import { ApiListItem } from ".";

export interface ApiListHeader {
  id: string;
  order: number;
  items: ApiListItem[];
}