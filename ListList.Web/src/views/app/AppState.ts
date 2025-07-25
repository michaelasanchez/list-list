import { ApiListItemCreation } from '../../contracts';
import { ListHeader } from '../../models';

export interface AppState {
  syncing: boolean;
  expanded: string[];
  activeHeaderId?: string;
  previousHeaderId?: string;
  headers?: ListHeader[];
  parentId?: string;
  headerCreation?: ApiListItemCreation;
}
