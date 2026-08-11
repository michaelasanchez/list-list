import { ApiNode } from '../contracts';

export interface Item extends Omit<ApiNode, 'completedOn'> {
  completedOn: string;
  expanded: boolean;
  pending: boolean;
}

export type ListItems = Item[];
