import { filter, map } from 'lodash';
import { AppState } from '.';
import {
  ApiListHeader,
  ApiListItem,
  ApiListItemCreation,
} from '../../contracts';
import { ListItemMapper } from '../../mappers';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelNodeDelete,
  // DeselectHeader,
  FinalizeHeaderCreate,
  FinalizeNodeDelete,
  // SelectHeader,
  SetHeader,
  SetHeaders,
  SetItem,
  SetLoading,
  SetSyncing,
  // SetItem,
  ToggleExpanded,
  UpdateHeaderCreation,
}

export type NodePath = number[];

export interface AppStateAction {
  type: AppStateActionType;
  creation?: ApiListItemCreation;
  header?: ApiListHeader;
  headerId?: string;
  headers?: ApiListHeader[];
  loading?: boolean;
  syncing?: boolean;
  item?: ApiListItem;
  itemId?: string;
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
    case AppStateActionType.SetHeader: {
      const existingIndex =
        state.headers?.findIndex((h) => h.id == action.header.id) ?? -1;
      const mapped = ListItemMapper.mapHeader(action.header, state.expanded);

      const headers =
        existingIndex >= 0
          ? map(state.headers, (h) => (h.id == action.header.id ? mapped : h))
          : [...(state.headers ?? []), mapped].sort(
              (a, b) => a.order - b.order
            );

      return {
        ...state,
        headers,
      };

      // if (existingIndex >= 0) {
      //   const mapped = ListItemMapper.mapHeader(action.header, state.expanded);

      //   // i'm just really wondering if any of this crap needs to happen.
      //   // like....
      //   /* if we're being directed to a different url, for some reason, the page
      //    * is going to reload everything anyways, so why put all this work into
      //    * keeping track of or managing a tokens objects if it's not going to be
      //    * persisted?
      //    */
      //   if (action.header.token) {
      //     if (!state.tokens[action.header.id]) {
      //       state.tokens[action.header.id] = [action.header.token];
      //     } else {
      //       const combined = [
      //         ...state.tokens[action.header.id],
      //         action.header.token,
      //       ];

      //       state.tokens[action.header.id] = combined;
      //       mapped.tokens = combined;
      //     }
      //   }

      //   return {
      //     ...state,
      //     headers: map(state.headers, (h) =>
      //       h.id == action.header.id ? mapped : h
      //     ),
      //   };
      // }

      // return state;
    }
    case AppStateActionType.SetHeaders: {
      return {
        ...state,
        headers: ListItemMapper.mapHeaders(action.headers, state.expanded),
      };
    }
    case AppStateActionType.SetItem: {
      if (!action.item) return state;

      return {
        ...state,
        headers: state.headers.map((h) =>
          h.id == action.item.headerId
            ? {
                ...h,
                items: h.items.map((i) =>
                  i.id == action.item.id
                    ? {
                        ...i,
                        // just updating label & description for now !!
                        label: action.item.label,
                        description: action.item.description,
                      }
                    : i
                ),
              }
            : h
        ),
      };
    }
    case AppStateActionType.SetLoading: {
      return {
        ...state,
        loading: action.loading ?? state.loading,
      };
    }
    case AppStateActionType.SetSyncing: {
      return {
        ...state,
        syncing: action.syncing ?? state.syncing,
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
