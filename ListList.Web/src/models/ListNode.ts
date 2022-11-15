import { ApiListItem } from "../contracts";

export interface ListNode extends ApiListItem {
  expanded: boolean;
  parentId?: string;
  children?: ListNode[];
}