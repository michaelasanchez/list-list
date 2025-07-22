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

  public Get = (): Promise<ApiListHeader[]> => {
    return this.executeGet();
  };

  public GetById = (id: string): Promise<ApiListHeader> => {
    this.setActionPath(id);

    return this.executeGet();
  };

  public Update = (id: string, put: ApiListHeaderPut): Promise<void> => {
    this.setActionPath(id);

    return this.executePost(put, null, false);
  };

  public Relocate = (headerId: string, { order }: ApiListHeaderRelocation) => {
    this.setActionPath(`${headerId}/relocate`);

    return this.executePost({ order }, null, false);
  };
}
