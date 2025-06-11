import { ApiListItem } from "../contracts";

export interface ListNode extends ApiListItem {
  expanded: boolean;
  headerId: string;
  isRoot: boolean;
  children: ListNode[];
  parentId?: string;
}

export type ListNodes = ListNode[];