import { ListItem, ShareLink } from '.';

export interface ListHeader {
  id: string;
  tokens?: string[];
  isReadOnly: boolean;
  isNotOwned?: boolean;
  label: string;
  description: string;
  order: number;
  items: ListItem[];
  shareLinks: ShareLink[];
}
