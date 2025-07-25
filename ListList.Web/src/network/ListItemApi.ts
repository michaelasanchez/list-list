import { Api } from '.';
import { ApiListItem, ApiListItemPut } from '../contracts';
import { ApiListItemCreation } from '../contracts/post/ApiListItemCreation';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('item', token);
  }

  public Complete = (listItemId: string): Promise<void> => {
    this.setActionPath(`${listItemId}/complete`);
    
    return this.executePost(null, null, false);
  };

  public Create = (
    creation: ApiListItemCreation,
    parentId: string
  ): Promise<string> => {
    this.setActionPath(`${parentId}`);

    return this.executePost(creation);
  };

  public Delete = (listItemId: string): Promise<void> => {
    return this.executeDelete(listItemId);
  };

  public GetById = (listItemId: string): Promise<ApiListItem> => {
    this.setActionPath(`${listItemId}`);

    return this.executeGet();
  };

  public Put = (listItemId: string, put: ApiListItemPut): Promise<void> => {
    return this.executePut(put, listItemId);
  };

  public Relocate = (
    activeId: string,
    overId: string,
    parentId: string
  ): Promise<void> => {
    this.setActionPath(`${activeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };
}
