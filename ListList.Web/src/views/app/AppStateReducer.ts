import { UniqueIdentifier } from '@dnd-kit/core';
import { filter, map } from 'lodash';
import { AppState } from '.';
import { flattenTree, removeChildrenOf } from '../../components';
import { FlattenedItem } from '../../components/tree/types';
import { ApiHeader, ApiItem, ApiListItemCreation } from '../../contracts';
import { ListItemMapper, Temp } from '../../mappers';
import { Item } from '../../models';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelItemCreate,
  CancelItemDelete,
  // DeselectHeader,
  FinalizeHeaderCreate,
  FinalizeHeaderDelete,
  FinalizeItemDelete,
  InitiateHeaderCreate,
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

export const newNodeId = 'new-node-id';

export interface AppStateAction {
  type: AppStateActionType;
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

function getFlattenedItems(items: Item[], expanded: string[]): FlattenedItem[] {
  const tree = Temp.buildTreeFromItems(items, expanded);

  const flattenedTree = flattenTree(tree);
  const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
    (acc, { children, collapsed, id }) =>
      collapsed && children.length ? [...acc, id] : acc,
    []
  );

  return removeChildrenOf(flattenedTree, collapsedItems);
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
    case AppStateActionType.CancelItemDelete: {
      const { headerCreation, ...rest } = state;

      return { ...rest };
    }
    case AppStateActionType.FinalizeHeaderCreate: {
      return { ...state, headers: state.headers.filter((h) => !h.pending) };
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
        isChecklist: false,
        isReadonly: false,
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

      // TODO: remove this limit?
      if (activeHeader.items.some((i) => i.id == newNodeId)) {
        return state;
      }

      const flattenedItems = getFlattenedItems(
        activeHeader.items,
        state.expanded
      );

      // console.log(activeHeader, flattenedItems);
      // console.log('ACTION INDEX', action.index);

      const overId = flattenedItems[action.index]?.id;

      const overIndex = activeHeader.items.findIndex((i) => i.id == overId);
      const over = activeHeader.items[overIndex];

      // console.log('...OVER', over);

      const pending = {
        id: newNodeId,
        label: '',
        description: '',
        complete: false,
        completedOn: null,
        left: 0,
        right: 0,
        depth: over?.depth ?? 0,
        index: 0,
        headerId: action.headerId,
        isParent: false,
        childCount: 0,
        descendantCount: 0,
        expanded: false,
        pending: true,
        parentId: over?.parentId as string,
      };

      activeHeader.items.splice(overIndex, 0, pending);

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
