export interface ApiNode {
  id: string;
  label: string;
  description: string;

  complete: boolean;
  completedOn: string;

  depth: number;
  index: number;

  partitionId: string;
  parentId: string | null;

  isParent: boolean;
  childCount: number;
  childrenIds: string[]
  descendantCount: number;
}
