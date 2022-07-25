import { ApiListItem } from "./api";

export interface ListNode extends ApiListItem {
  expanded: boolean;
  parentId?: string;
  children?: ListNode[];
}