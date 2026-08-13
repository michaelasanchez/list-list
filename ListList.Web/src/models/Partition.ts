import { Node, ShareLink } from '.';
import { ApiPartition } from '../contracts';

export interface Partition extends Omit<
  ApiPartition,
  'token' | 'nodes' | 'shareLinks'
> {
  checklist: boolean;
  isNotOwned?: boolean;
  nodes: Node[];
  pending: boolean;
  readonly: boolean;
  shareLinks: ShareLink[];
  tokens: string[] | null;
}
