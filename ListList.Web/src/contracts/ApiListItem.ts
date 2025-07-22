export interface ApiListItem {
  id: string;
  label: string;
  description: string;
  complete: boolean;
  completedOn: string;

  left: number;
  right: number;

  depth: number;

  headerId: string;
  parentId?: string;

  hasChildren: boolean;
  childCount: number;
  descendantCount: number;
}
