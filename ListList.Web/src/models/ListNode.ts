import { ApiListItem } from "./api";

export interface ListNode extends ApiListItem {
  parentId?: string;
  children?: ApiListItem[];
}