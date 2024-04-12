import { ListItemCreation } from "../../contracts";
import { ListHeader } from "../../models";

export interface AppState {
  headers?: ListHeader[];
  expanded: string[];
  parentId?: string;
  listHeaderCreation?: ListItemCreation;
}
