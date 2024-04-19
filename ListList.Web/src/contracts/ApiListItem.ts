export interface ApiListItem {
  id: string;
  label: string;
  description: string;
  complete: boolean;
  completedOn: string;

  left: number;
  right: number;
}
