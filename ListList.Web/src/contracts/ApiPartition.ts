import { ApiNode } from '.';
import { ApiShareLink } from './ApiShareLink';

export interface ApiPartition {
  id: string;
  token?: string;
  order: number;
  checklist: boolean;
  owned: boolean;
  readonly: boolean;
  label: string;
  description: string;
  items: ApiNode[];
  shareLinks: ApiShareLink[];
}
