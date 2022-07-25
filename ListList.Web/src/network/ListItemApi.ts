import { Api } from '.';
import { ApiListItem } from '../models';
import { ListItemCreation } from '../models/contracts/ListItemCreation';

export class ListItemApi extends Api<ApiListItem> {
  constructor(token?: string) {
    super('ListItem', token);
  }

  public CreateItem = (creation: ListItemCreation, parentId: string) => {
    this.setActionPath(`${parentId}`);

    return this.executePost(creation) as Promise<number>;
  };

  public DeleteItem = (listItemId: string) => {
    return this.executeDelete(listItemId);
  }
}
