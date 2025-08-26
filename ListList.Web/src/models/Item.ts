import { ApiItem } from '../contracts';

export interface Item extends Omit<ApiItem, 'completedOn'> {
  completedOn: Date;
  expanded: boolean;
  pending: boolean;
}

export type ListItems = Item[];
