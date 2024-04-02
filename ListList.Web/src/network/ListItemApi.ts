import { Api } from '.';
import { ApiListHeader, ApiListItem, ApiListItemPut } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('ListItem', token);
  }

  public CompleteItem = (listItemId: string) => {
    this.setActionPath(`complete/${listItemId}`);
    return this.executePost(null, null, false);
  };

  public CreateItem = (
    creation: ListItemCreation,
    parentId: string = null
  ): Promise<number> => {
    if (parentId) {
      this.setActionPath(`${parentId}`);
    }

    return this.executePost(creation);
  };

  public DeleteItem = (listItemId: string) => {
    return this.executeDelete(listItemId);
  };

  public GetHeaders = (): Promise<ApiListHeader[]> => {
    return this.executeGet();
  };

  public PutItem = (listItemId: string, put: ApiListItemPut) => {
    return this.executePut(put, listItemId) as Promise<void>;
  };
}
