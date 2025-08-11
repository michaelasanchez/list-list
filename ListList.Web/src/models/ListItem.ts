import { ApiListItem } from '../contracts';

export interface ListItem extends ApiListItem {
  expanded: boolean;
}

export type ListItems = ListItem[];
