import { filter, map } from 'lodash';
import { AppState } from '.';
import { ApiHeader, ApiItem, ApiListItemCreation } from '../../contracts';
import { ListItemMapper } from '../../mappers';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelItemDelete,
  // DeselectHeader,
  FinalizeHeaderCreate,
  FinalizeItemDelete,
  InitiateItemCreate,
  // SelectHeader,
  SetHeader,
  SetHeaders,
  SetItem,
  SetLoading,
  SetPreviousHeaderId,
  SetSyncing,
  // SetItem,
  ToggleExpanded,
  UpdateHeaderCreation,
}

export type NodePath = number[];

export interface AppStateAction {
  type: AppStateActionType;
  creation?: ApiListItemCreation;
  header?: ApiHeader;
  headerId?: string;
  headers?: ApiHeader[];
  loading?: boolean;
  syncing?: boolean;
  item?: ApiItem;
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
    case AppStateActionType.CancelItemDelete: {
      const { headerCreation, ...rest } = state;

      return { ...rest };
    }
    case AppStateActionType.FinalizeHeaderCreate: {
      const { headerCreation, ...rest } = state;

      return rest;
    }
    case AppStateActionType.FinalizeItemDelete: {
      const updatedHeaders = filter(
        state.headers,
        (h) => h.id !== action.headerId
      );

      return {
        ...state,
        headers: updatedHeaders,
      };
    }
    case AppStateActionType.InitiateItemCreate: {
      const pendingCreation = {
        id: 'newwwwwwwwwwwwwwwewewewe',
        label: '',
        description: '',
        complete: false,
        completedOn: null,
        left: 0,
        right: 0,
        depth: 0,
        headerId: action.headerId,
        isParent: false,
        childCount: 0,
        descendantCount: 0,
        expanded: false,
        pending: true,
      };

      const activeHeader = state.headers.find((h) => h.id == action.headerId);

      const expanded = activeHeader.items.filter((i) => i.expanded);

      const index = expanded.length == 0 ? activeHeader.items.length : 0;

      activeHeader.items.splice(index, 0, pendingCreation);

      return {
        ...state,
        headers: state.headers.map((h) =>
          h.id == action.headerId ? { ...h, items: [...activeHeader.items] } : h
        ),
      };
    }
    case AppStateActionType.SetHeader: {
      const existingIndex = state.headers.findIndex(
        (h) => h.id == action.header.id
      );

      const mapped = ListItemMapper.mapHeader(action.header, state.expanded);

      if (action.header.token) {
        if (!state.tokens[action.header.id]) {
          state.tokens[action.header.id] = [action.header.token];
        } else {
          const combined = [
            ...state.tokens[action.header.id],
            action.header.token,
          ];

          state.tokens[action.header.id] = combined;
          mapped.tokens = combined;
        }
      }

      return {
        ...state,
        headers:
          existingIndex >= 0
            ? map(state.headers, (h) => (h.id == action.header.id ? mapped : h))
            : [...state.headers, mapped],
      };

      return state;

      // if (existingIndex >= 0) {
      // }

      // const mapped = ListItemMapper.mapHeader(action.header, state.expanded);

      // const headers =
      //   existingIndex >= 0
      //     ? map(state.headers, (h) => (h.id == action.header.id ? mapped : h))
      //     : [...(state.headers ?? []), { ...mapped, isNotOwned: true }].sort(
      //         (a, b) => a.order - b.order
      //       );

      // return {
      //   ...state,
      //   headers,
      // };
    }
    case AppStateActionType.SetHeaders: {
      return {
        ...state,
        headers: ListItemMapper.mapHeaders(action.headers, state.expanded),
      };
    }
    case AppStateActionType.SetItem: {
      if (!action.item) return state;

      const headers = state.headers.map((h) =>
        h.id == action.item.headerId
          ? {
              ...h,
              items: h.items.map((i) =>
                i.id == action.item.id
                  ? ListItemMapper.mapItem(action.item, state.expanded)
                  : i
              ),
            }
          : h
      );

      return {
        ...state,
        headers,
      };
    }
    case AppStateActionType.SetLoading: {
      if (action.loading == state.loading) return state;

      return {
        ...state,
        loading: action.loading ?? state.loading,
      };
    }
    case AppStateActionType.SetPreviousHeaderId: {
      return {
        ...state,
        previousHeaderId: action.headerId ?? state.previousHeaderId,
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

      return {
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
