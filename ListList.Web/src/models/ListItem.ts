import { ApiListItem } from '../contracts';

export interface ListItem extends ApiListItem {
  expanded: boolean;
  // children: ListNode[];
}

export type ListItems = ListItem[];
