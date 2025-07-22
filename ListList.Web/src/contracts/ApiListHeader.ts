import { ApiListItem } from ".";

export interface ApiListHeader {
  id: string;
  label: string;
  description: string;
  order: number;
  items: ApiListItem[];
}