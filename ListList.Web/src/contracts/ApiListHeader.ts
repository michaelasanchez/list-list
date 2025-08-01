import { ApiListItem } from '.';
import { ApiShareLink } from './ApiShareLink';

export interface ApiListHeader {
  id: string;
  token?: string;
  isReadOnly: boolean;
  label: string;
  description: string;
  order: number;
  items: ApiListItem[];
  shareLinks: ApiShareLink[];
}
