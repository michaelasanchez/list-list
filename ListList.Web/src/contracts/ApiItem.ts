export interface ApiItem {
  id: string;
  label: string;
  description: string;

  // completable: boolean;
  complete: boolean;
  completedOn: string;

  left: number;
  right: number;

  depth: number;

  headerId: string;
  parentId?: string;

  isParent: boolean;
  childCount: number;
  descendantCount: number;
}
