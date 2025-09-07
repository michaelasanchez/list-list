import { Api } from '.';
import {
  ApiHeader,
  ApiHeaderPatch,
  ApiListHeaderPut,
  ApiListHeaderRelocation,
  ApiListItemCreation,
} from '../contracts';

export class ListHeaderApi extends Api {
  constructor(token?: string) {
    super('header', token);
  }

  public CreateHeader = (creation: ApiListItemCreation): Promise<string> => {
    return this.executePost(creation);
  };

  public CreateItem = (
    headerId: string,
    creation: ApiListItemCreation
  ): Promise<string> => {
    this.setActionPath(`${headerId}`);

    return this.executePost(creation);
  };

  public Delete = (headerId: string): Promise<void> =>
    this.executeDelete(headerId);

  public GetAll = (): Promise<ApiHeader[]> => {
    this.setActionPath();

    return this.executeGet();
  };

  public Get = (token: string): Promise<ApiHeader> => {
    this.setActionPath(token);

    return this.executeGet();
  };

  public Patch = (id: string, patch: ApiHeaderPatch): Promise<void> => {
    return this.executePatch(id, patch);
  };

  public Put = (id: string, put: ApiListHeaderPut): Promise<void> => {
    return this.executePut(put, id);
  };

  public Relocate = (
    headerId: string,
    relocation: ApiListHeaderRelocation
  ): Promise<void> => {
    this.setActionPath(`${headerId}/relocate`);

    return this.executePost(relocation, null, false);
  };

  public Update = (id: string, put: ApiListHeaderPut): Promise<void> => {
    this.setActionPath(id);

    return this.executePost(put, null, false);
  };
}
