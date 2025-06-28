import { ListItem } from '.';

export interface ListHeader {
  id: string;
  order: number;
  items: ListItem[];
}
