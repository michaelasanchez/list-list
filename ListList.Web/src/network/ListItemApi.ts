import { Api } from '.';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListItemCreation } from '../contracts/put/ListItemCreation';

export class ListItemApi extends Api<ApiListItem> {
  constructor(token?: string) {
    super('ListItem', token);
  }

  public CompleteItem = (listItemId: string) => {
    this.setActionPath(`complete/${listItemId}`);
    return this.executePost(null, null, false) as Promise<void>;
  };

  public CreateItem = (creation: ListItemCreation, parentId: string) => {
    this.setActionPath(`${parentId}`);

    return this.executePost(creation) as Promise<number>;
  };

  public DeleteItem = (listItemId: string) => {
    return this.executeDelete(listItemId);
  };

  public GetHeaders = () => {
    return this.executeGet() as Promise<ApiListHeader[]>;
  };
}
