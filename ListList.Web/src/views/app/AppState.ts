import { Header } from '../../models';

export interface AppState {
  syncing: boolean;
  loading: boolean;
  expanded: string[];
  tokens: { [headerId: string]: string[] };
  headers?: Header[];
}
