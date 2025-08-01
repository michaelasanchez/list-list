import { ListItem, ShareLink } from '.';

export interface ListHeader {
  id: string;
  token?: string;
  label: string;
  description: string;
  order: number;
  items: ListItem[];
  shareLinks: ShareLink[];
}
