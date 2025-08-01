import { Api } from '.';
import {
  ApiListHeader,
  ApiListHeaderPut,
  ApiListHeaderRelocation,
  ApiListItemCreation,
} from '../contracts';

export class ListHeaderApi extends Api {
  constructor(token?: string) {
    super('header', token);
  }

  public Create = (creation: ApiListItemCreation): Promise<string> => {
    return this.executePost(creation);
  };

  public GetAll = (): Promise<ApiListHeader[]> => {
    return this.executeGet();
  };

  public Get = (token: string): Promise<ApiListHeader> => {
    this.setActionPath(token);

    return this.executeGet();
  };

  public Put = (id: string, put: ApiListHeaderPut): Promise<void> => {
    return this.executePut(put, id);
  };

  public Relocate = (headerId: string, relocation: ApiListHeaderRelocation) => {
    this.setActionPath(`${headerId}/relocate`);

    return this.executePost(relocation, null, false);
  };

  public Update = (id: string, put: ApiListHeaderPut): Promise<void> => {
    this.setActionPath(id);

    return this.executePost(put, null, false);
  };
}
