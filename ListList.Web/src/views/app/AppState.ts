import { ListItemCreation } from '../../contracts';
import { ListHeader } from '../../models';
import { AppTheme } from '../../shared';

export interface AppState {
  expanded: string[];
  theme: AppTheme;
  headers?: ListHeader[];
  parentId?: string;
  listHeaderCreation?: ListItemCreation;
}
