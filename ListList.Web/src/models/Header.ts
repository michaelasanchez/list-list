import { Item, ShareLink } from '.';
import { ApiPartition } from '../contracts';

export interface Header
  extends Omit<ApiPartition, 'token' | 'items' | 'shareLinks'> {
  checklist: boolean;
  isNotOwned?: boolean;
  items: Item[];
  pending: boolean;
  readonly: boolean;
  shareLinks: ShareLink[];
  tokens: string[] | null;
}
