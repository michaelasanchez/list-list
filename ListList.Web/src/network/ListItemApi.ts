import { Api } from '.';
import { ApiListItem } from '../models';

export class ListItemApi extends Api<ApiListItem> {
  constructor(token?: string) {
    super('ListItem', token);
  }
}
