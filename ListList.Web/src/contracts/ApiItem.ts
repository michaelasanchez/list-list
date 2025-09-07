export interface ApiItem {
  id: string;
  label: string;
  description: string;

  complete: boolean;
  completedOn: string;

  depth: number;

  headerId: string;
  parentId?: string;

  isParent: boolean;
  childCount: number;
  descendantCount: number;
}
