import { Item, ShareLink } from '.';
import { ApiHeader } from '../contracts';

export interface Header
  extends Omit<ApiHeader, 'token' | 'checklist' | 'readonly' | 'items' | 'shareLinks'> {
  tokens?: string[];
  isChecklist: boolean;
  isNotOwned?: boolean;
  isReadonly: boolean;
  items: Item[];
  pending: boolean;
  shareLinks: ShareLink[];
}
