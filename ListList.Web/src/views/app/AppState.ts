import { ApiListItemCreation } from '../../contracts';
import { ListHeader } from '../../models';

export interface AppState {
  syncing: boolean;
  loading: boolean;
  expanded: string[];
  tokens: { [headerId: string]: string[] };
  previousHeaderId?: string;
  headers?: ListHeader[];
  headerCreation?: ApiListItemCreation;
}
