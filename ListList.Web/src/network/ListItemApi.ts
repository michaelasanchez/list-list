import { Api } from '.';
import { ApiListItemPut } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('item', token);
  }

  public Complete = (listItemId: string) => {
    this.setActionPath(`${listItemId}/complete`);
    return this.executePost(null, null, false);
  };

  public Create = (
    creation: ListItemCreation,
    parentId: string
  ): Promise<string> => {
    this.setActionPath(`${parentId}`);

    return this.executePost(creation);
  };

  public Delete = (listItemId: string) => {
    return this.executeDelete(listItemId);
  };

  public GetById = (listItemId: string) => {
    this.setActionPath(`${listItemId}`);

    return this.executeGet();
  };

  public Put = (listItemId: string, put: ApiListItemPut) => {
    return this.executePut(put, listItemId) as Promise<void>;
  };

  public Relocate = (
    activeId: string,
    overId: string,
    parentId: string
  ) => {
    this.setActionPath(`${activeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };
}
