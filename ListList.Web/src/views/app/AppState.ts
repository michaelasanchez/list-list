import { ListItemCreation } from '../../contracts';
import { ListHeader } from '../../models';

export interface AppState {
  syncing: boolean;
  expanded: string[];
  headers?: ListHeader[];
  parentId?: string;
  headerCreation?: ListItemCreation;
}
