import { ApiListItem } from ".";

export interface ApiListHeader {
  title: string;
  order: number;
  items: ApiListItem[];
}