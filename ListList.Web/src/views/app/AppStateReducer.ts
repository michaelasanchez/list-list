import { filter, map } from 'lodash';
import { AppState } from '.';
import { ApiListHeader, ListItemCreation } from '../../contracts';
import { ListItemMapper } from '../../mappers';
import { ListItem } from '../../models';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelNodeDelete,
  DeselectHeader,
  FinalizeHeaderCreate,
  FinalizeNodeDelete,
  SelectHeader,
  SetHeader,
  SetHeaders,
  SetSyncing,
  // SetItem,
  ToggleExpanded,
  UpdateHeaderCreation,
}

export type NodePath = number[];

export interface AppStateAction {
  type: AppStateActionType;
  creation?: ListItemCreation;
  header?: ApiListHeader;
  headerId?: string;
  headers?: ApiListHeader[];
  syncing?: boolean;
  item?: ListItem;
  itemId?: string;
  path?: NodePath;
}

export const AppStateReducer = (
  state: AppState,
  action: AppStateAction
): AppState => {
  switch (action.type) {
    case AppStateActionType.CancelHeaderCreate: {
      const { headerCreation, ...rest } = state;

      return rest;
    }
    case AppStateActionType.CancelNodeDelete: {
      const { headerCreation, ...rest } = state;

      return { ...rest };
    }
    case AppStateActionType.DeselectHeader: {
      const { activeHeaderId, ...rest } = state;

      return { ...rest, previousHeaderId: activeHeaderId };
    }
    case AppStateActionType.FinalizeHeaderCreate: {
      const { headerCreation, ...rest } = state;

      return rest;
    }
    case AppStateActionType.FinalizeNodeDelete: {
      const updatedHeaders = filter(
        state.headers,
        (h) => h.id !== action.headerId
      );

      return {
        ...state,
        headers: updatedHeaders,
      };
    }
    case AppStateActionType.SelectHeader: {
      const { previousHeaderId, ...rest } = state;

      return { ...rest, activeHeaderId: action.headerId };
    }
    case AppStateActionType.SetHeader: {
      const headers = map(state.headers, (h) =>
        h.id == action.header.id
          ? ListItemMapper.mapHeader(action.header, state.expanded)
          : h
      );

      return {
        ...state,
        headers,
      };
    }
    case AppStateActionType.SetHeaders: {
      return {
        ...state,
        headers: ListItemMapper.mapHeaders(action.headers, state.expanded),
      };
    }
    case AppStateActionType.SetSyncing: {
      return {
        ...state,
        syncing: action.syncing,
      };
    }
    case AppStateActionType.ToggleExpanded: {
      if (!action.headerId || !action.itemId) return state;

      const after = {
        ...state,
        headers: state.headers.map((h) =>
          h.id == action.headerId
            ? {
                ...h,
                items: h.items.map((i) =>
                  i.id == action.itemId ? { ...i, expanded: !i.expanded } : i
                ),
              }
            : h
        ),
        expanded: state.expanded.includes(action.itemId)
          ? filter(state.expanded, (i) => i != action.itemId)
          : [...state.expanded, action.itemId],
      };

      return after;
    }
    case AppStateActionType.UpdateHeaderCreation: {
      return {
        ...state,
        headerCreation: action.creation,
      };
    }
    default:
      return state;
  }
};
