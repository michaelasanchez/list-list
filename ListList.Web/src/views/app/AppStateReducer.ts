import { filter, map } from 'lodash';
import { AppState } from '.';
import { ApiHeader, ApiItem, ApiListItemCreation } from '../../contracts';
import { ListItemMapper } from '../../mappers';

export enum AppStateActionType {
  CancelHeaderCreate,
  CancelItemCreate,
  FinalizeHeaderDelete,
  FinalizeItemCreate,
  FinalizeItemDelete,
  InitiateHeaderCreate,
  InitiateItemCreate,
  SetHeader,
  SetHeaders,
  SetItem,
  SetLoading,
  SetSyncing,
  ToggleExpanded,
}

export type NodePath = number[];

export const newNodeId = 'new-node-id';

export interface AppStateAction {
  type: AppStateActionType;
  asChild?: boolean;
  creation?: ApiListItemCreation;
  header?: ApiHeader;
  headerId?: string;
  headers?: ApiHeader[];
  loading?: boolean;
  syncing?: boolean;
  index?: number;
  item?: ApiItem;
  itemId?: string;
}

export const AppStateReducer = (
  state: AppState,
  action: AppStateAction
): AppState => {
  switch (action.type) {
    case AppStateActionType.CancelHeaderCreate: {
      return {
        ...state,
        headers: state.headers.filter((h) => h.id != newNodeId),
      };
    }
    case AppStateActionType.CancelItemCreate: {
      return {
        ...state,
        headers: state.headers.map((h) =>
          h.id == action.headerId
            ? { ...h, items: h.items.filter((i) => i.id != newNodeId) }
            : h
        ),
      };
    }
    // Found this to be the culprit in an animation stutter
    // case AppStateActionType.FinalizeHeaderCreate: {
    //   return { ...state, headers: state.headers.filter((h) => !h.pending) };
    // }
    case AppStateActionType.FinalizeItemCreate: {
      return {
        ...state,
        headers: state.headers.map((h) =>
          h.id == action.headerId
            ? { ...h, items: h.items.filter((i) => !i.pending) }
            : h
        ),
      };
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
    case AppStateActionType.InitiateHeaderCreate: {
      if (state.headers.some((h) => h.id == newNodeId)) {
        return state;
      }

      const pendingHeader = {
        id: newNodeId,
        order: state.headers.length,
        checklist: false,
        readonly: false,
        label: '',
        description: '',
        items: [],
        shareLinks: [],
        pending: true,
      };

      state.headers.splice(
        action.index ?? state.headers.length,
        0,
        pendingHeader
      );

      return {
        ...state,
        headers: [...state.headers],
      };
    }
    case AppStateActionType.FinalizeHeaderDelete: {
      return {
        ...state,
        headers: state.headers.filter((h) => h.id != action.headerId),
      };
    }
    case AppStateActionType.InitiateItemCreate: {
      const activeHeader = state.headers.find((h) => h.id == action.headerId);

      // Remove pending item if exists
      // (helps when pending item is left in another view)
      if (activeHeader.items.some((i) => i.id == newNodeId)) {
        activeHeader.items = activeHeader.items.filter(
          (i) => i.id != newNodeId
        );
      }

      const itemIndex = activeHeader.items.findIndex(
        (i) => i.id == action.itemId
      );
      const item = activeHeader.items[itemIndex];

      const pending = {
        id: newNodeId,
        label: '',
        description: '',
        complete: false,
        completedOn: null,
        left: 0,
        right: 0,
        depth: item?.depth ?? 0,
        index: 0,
        headerId: action.headerId,
        isParent: false,
        childCount: 0,
        childrenIds: [],
        descendantCount: 0,
        expanded: false,
        pending: true,
        parentId: action.asChild ? item?.id : (item?.parentId as string),
      };

      if (itemIndex < 0) {
        activeHeader.items.push(pending);
      } else {
        activeHeader.items.splice(itemIndex, 0, pending);
      }

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
    default:
      return state;
  }
};
