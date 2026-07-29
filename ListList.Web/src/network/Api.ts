import { config } from '../shared';

const formApiRequestPath = (
  basePath: string,
  actionPath?: string,
  queryParams?: string,
): string => {
  const path = `${basePath}${actionPath ? `/${actionPath}` : ''}${
    queryParams ? `?${queryParams}` : ''
  }`;

  return `${config.apiUrl}${path.startsWith('/') ? path.slice(1) : path}`;
};

export type QueryParameters = { [key: string]: any };

export type Succeeded = boolean;

export class Api {
  private _basePath: string;
  private _actionPath: string;
  private _queryParameters: string;

  constructor(basePath: string) {
    this._basePath = basePath;
  }

  private async execute(
    init: RequestInit | null = null,
    toJson: boolean = true,
  ): Promise<any> {
    const path = formApiRequestPath(
      this._basePath,
      this._actionPath,
      this._queryParameters,
    );

    this._actionPath = null;
    this._queryParameters = null;

    return fetch(path, { ...(init ?? {}), credentials: 'include' }).then(
      (result) =>
        result.ok && result.status >= 200 && result.status < 300
          ? toJson
            ? result.json()
            : result
          : result.text().then((text) => {
              throw new Error(text);
            }),
    );
  }

  protected executeDelete(
    id: string,
    params: RequestInit = null,
  ): Promise<void> {
    this.setActionPath(`${id}`);

    return this.execute(
      {
        ...params,
        method: 'DELETE',
      },
      false,
    );
  }

  protected executeGet(
    queryParams?: QueryParameters,
    init: RequestInit = null,
  ): Promise<any> {
    if (!!queryParams) this.setQueryParameters(queryParams);

    return this.execute(init);
  }

  protected executePatch(
    id: string,
    obj: any,
    init: RequestInit = null,
  ): Promise<any> {
    this.setActionPath(`${id}`);
    return this.execute(
      {
        ...init,
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(obj),
      },
      false,
    );
  }

  protected executePost(
    obj: any | null = null,
    init: RequestInit | null = null,
    toJson: boolean = false,
  ): Promise<any> {
    return this.execute(
      {
        ...init,
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(obj),
      },
      toJson,
    );
  }

  protected executePut(obj: any, id: string = null): Promise<any> {
    if (id !== null) this.setActionPath(`${id}`);
    return this.execute(
      {
        method: 'PUT',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(obj),
      },
      false,
    );
  }

  protected setActionPath = (path?: string) => {
    this._actionPath = path;
  };

  protected setQueryParameters = (params: { [key: string]: any }) => {
    this._queryParameters = new URLSearchParams(params).toString();
  };
}
