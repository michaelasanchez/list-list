import { Api } from '.';
import { ApiListHeader } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListHeaderApi extends Api {
  constructor(token?: string) {
    super('header', token);
  }

  public Create = (creation: ListItemCreation): Promise<string> => {
    return this.executePost(creation);
  };

  public Get = (): Promise<ApiListHeader[]> => {
    return this.executeGet();
  };

  public GetById = (id: string): Promise<ApiListHeader> => {
    this.setActionPath(id);

    return this.executeGet();
  };

  public Relocate = (headerId: string, index: number) => {
    this.setActionPath(`${headerId}/relocate`);

    return this.executePost({ index }, null, false);
  };
}
