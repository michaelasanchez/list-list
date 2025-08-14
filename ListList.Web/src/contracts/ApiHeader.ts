import { ApiItem } from '.';
import { ApiShareLink } from './ApiShareLink';

export interface ApiHeader {
  id: string;
  token?: string;
  order: number;
  checklist: boolean;
  readonly: boolean;
  label: string;
  description: string;
  items: ApiItem[];
  shareLinks: ApiShareLink[];
}
