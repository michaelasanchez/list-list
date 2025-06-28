import type { MutableRefObject } from 'react';
import { ListItem } from '../models';

// export interface TreeItem {
//   id: string;
//   children: TreeItem[];
//   expanded?: boolean;
// }

// export type TreeItems = ListNode[];

// export interface FlattenedItem extends ListNode {
//   parentId: string | null;
//   depth: number;
//   index: number;
// }

export type SensorContext = MutableRefObject<{
  items: ListItem[];
  offset: number;
}>;
