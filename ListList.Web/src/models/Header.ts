import { Item, ShareLink } from '.';
import { ApiHeader } from '../contracts';

export interface Header
  extends Omit<ApiHeader, 'token' | 'items' | 'shareLinks'> {
  checklist: boolean;
  isNotOwned?: boolean;
  items: Item[];
  pending: boolean;
  readonly: boolean;
  shareLinks: ShareLink[];
  tokens?: string[];
}
