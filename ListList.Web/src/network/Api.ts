import { config } from '../shared';

const formApiRequestPath = (
  basePath: string,
  actionPath?: string,
  queryParams?: string
): string => {
  return `${config.apiUrl}${basePath}${actionPath ? `/${actionPath}` : ''}${
    queryParams ? `?${queryParams}` : ''
  }`;
};

export type QueryParameters = { [key: string]: any };

export class Api<T> {
  private _token: string;

  private _basePath: string;
  private _actionPath: string;
  private _queryParameters: string;

  constructor(basePath: string, token?: string) {
    this._basePath = basePath;

    if (token) this._token = token;
  }

  private async execute(
    init: RequestInit = null,
    toJson: boolean = true
  ): Promise<any> {
    const requestPath = formApiRequestPath(
      this._basePath,
      this._actionPath,
      this._queryParameters
    );

    if (this._token) {
      const authHeaders = new Headers({
        Authorization: `Bearer ${this._token}`,
      });

      if (init) {
        if (init.headers) {
          (init.headers as Headers).append(
            'Authorization',
            `Bearer ${this._token}`
          );
        } else {
          init.headers = authHeaders;
        }
      } else {
        init = {
          headers: authHeaders,
        };
      }
    }

    const fetchInvocation = init
      ? fetch(requestPath, init)
      : fetch(requestPath);

    return fetchInvocation.then((result) =>
      result.ok && result.status == 200 && toJson ? result.json() : result
    );
  }

  protected executeDelete(
    id: string,
    params: RequestInit = null
  ): Promise<void> {
    this.setActionPath(`${id}`);
    return this.execute(
      {
        ...params,
        method: 'DELETE',
      },
      false
    );
  }

  protected executeGet(
    queryParams?: QueryParameters,
    init: RequestInit = null
  ): Promise<any> {
    if (!!queryParams) this.setQueryParameters(queryParams);

    return this.execute(init);
  }

  protected executePatch(
    id: number,
    obj: any,
    init: RequestInit = null
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
      false
    );
  }

  protected executePost(
    obj: any,
    init: RequestInit = null,
    toJson?: boolean
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
      toJson
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
      false
    );
  }

  protected setActionPath = (path: string) => {
    this._actionPath = path;
  };

  protected setQueryParameters = (params: { [key: string]: any }) => {
    this._queryParameters = new URLSearchParams(params).toString();
  };

  public GetById = (id: string): Promise<T> => {
    this.setActionPath(`${id}`);

    return this.executeGet() as Promise<T>;
  };

  public Get = (): Promise<T[]> => {
    return this.executeGet() as Promise<T[]>;
  };

  public Create = (obj: any): Promise<string> => {
    return this.executePost(obj) as Promise<string>;
  };

  // public Delete = (id: number): Promise<void> => {
  //   return this.executeDelete(id) as Promise<void>;
  // };

  // public Patch = (id: number, obj: any): Promise<void> => {
  //   return this.executePatch(id, obj) as Promise<void>;
  // };

  // public Put = (obj: T, id?: number): Promise<void> => {
  //   return this.executePut(obj, id) as Promise<void>;
  // };
}
