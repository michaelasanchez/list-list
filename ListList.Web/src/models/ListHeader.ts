import { ListItem } from '.';

export interface ListHeader {
  id: string;
  label: string;
  description: string;
  order: number;
  items: ListItem[];
}
