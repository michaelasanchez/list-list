export interface ApiListItem {
  id: string;
  groupId: string;
  label: string;
  description: string;
  complete: boolean;

  left: number;
  right: number;
}
