export interface ApiNodeCreation {
  label: string | null;
  description?: string | null;
  complete?: boolean;
  overId: string;
  parentId?: string;
}
