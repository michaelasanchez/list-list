import { Api } from '.';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListItemApi extends Api<ApiListItem> {
  constructor(token?: string) {
    super('ListItem', token);
  }

  public GetHeaders = () => {
    return this.executeGet() as Promise<ApiListHeader[]>;
  }

  public CreateItem = (creation: ListItemCreation, parentId: string) => {
    this.setActionPath(`${parentId}`);

    return this.executePost(creation) as Promise<number>;
  };

  public DeleteItem = (listItemId: string) => {
    return this.executeDelete(listItemId);
  }
}
