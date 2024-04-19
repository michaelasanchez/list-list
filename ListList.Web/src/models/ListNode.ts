import { ApiListItem } from "../contracts";

export interface ListNode extends ApiListItem {
  expanded: boolean;
  headerId: string;
  isRoot: boolean;
  parentId?: string;
  children?: ListNode[];
}