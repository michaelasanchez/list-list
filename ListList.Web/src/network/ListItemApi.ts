import { Api } from '.';
import { ApiListHeader, ApiListItem, ApiListItemPut } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('item', token);
  }

  public CompleteItem = (listItemId: string) => {
    this.setActionPath(`complete/${listItemId}`);
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

  public Put = (listItemId: string, put: ApiListItemPut) => {
    return this.executePut(put, listItemId) as Promise<void>;
  };
}
