import { ApiListItemCreation } from '../../contracts';
import { ListHeader } from '../../models';

export interface AppState {
  syncing: boolean;
  loading: boolean;
  expanded: string[];
  previousHeaderId?: string;
  headers?: ListHeader[];
  headerCreation?: ApiListItemCreation;
}
