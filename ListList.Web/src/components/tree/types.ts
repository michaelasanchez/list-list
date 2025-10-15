import type { UniqueIdentifier } from '@dnd-kit/core';

export interface TreeItemData {
  label: string;
  description: string;
  complete?: boolean;
  completedOn?: string;
  index: number;
  numbered?: boolean;
  isChecklist?: boolean;
}

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  pending?: boolean;
  data: TreeItemData;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
}

export interface SensorContext {
  items: FlattenedItem[];
  offset: number;
}
