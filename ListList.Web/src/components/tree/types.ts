import { Guid } from '../../contracts';

export interface TreeItemData {
  partitionId: string;
  label: string;
  description: string;
  complete?: boolean;
  completedOn?: string;
  index: number;
  numbered?: boolean;
  isChecklist?: boolean;
}

export interface TreeItem {
  id: Guid;
  children: TreeItem[];
  collapsed?: boolean;
  pending?: boolean;
  readonly?: boolean;
  data: TreeItemData;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: Guid | null;
  depth: number;
}

export interface SensorContext {
  items: FlattenedItem[];
  offset: number;
}
