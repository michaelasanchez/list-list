import { ApiNode } from '../contracts';

export interface Node extends Omit<ApiNode, 'completedOn'> {
  completedOn: string;
  expanded: boolean;
  pending: boolean;
}

export type Nodes = Node[];
