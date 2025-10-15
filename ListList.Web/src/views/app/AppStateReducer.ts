import { UniqueIdentifier } from '@dnd-kit/core';
import { filter, map } from 'lodash';
import { AppState } from '.';
import { flattenTree, removeChildrenOf } from '../../components';
import { FlattenedItem } from '../../components/tree/types';
import { ApiHeader, ApiItem, ApiListItemCreation } from '../../contracts';
import { ListItemMapper, TreeMapper } from '../../mappers';
import { Item } from '../../models';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelItemCreate,
  CancelItemDelete,
  // DeselectHeader,
  // FinalizeHeaderCreate,
  FinalizeHeaderDelete,
  FinalizeItemCreate,
  FinalizeItemDelete,
  InitiateHeaderCreate,
  InitiateItemCreate,
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

// TODO: UTILITY
function getFlattenedItems(items: Item[], expanded: string[]): FlattenedItem[] {
  const tree = TreeMapper.buildTreeFromItems(items, expanded);

  const flattenedTree = flattenTree(tree);
  const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
    (acc, { children, collapsed, id }) =>
      collapsed && children.length ? [...acc, id] : acc,
    []
  );

  return removeChildrenOf(flattenedTree, collapsedItems);
}

// TODO: UTILITY
function getDescendants(items: Item[], targetId) {
  const byId = new Map(items.map((it) => [it.id, it]));

  // start with the immediate children of target (so target itself isn't included)
  const startChildren = byId.get(targetId)?.childrenIds || [];

  const visited = new Set();
  const stack = [...startChildren]; // use stack or queue; order here doesn't matter because we'll preserve original order when filtering

  while (stack.length) {
    const id = stack.pop();
    if (!id || visited.has(id)) continue;
    visited.add(id);

    const node = byId.get(id);
    if (node && Array.isArray(node.childrenIds) && node.childrenIds.length) {
      // push children so we discover deeper descendants
      for (const childId of node.childrenIds) {
        if (!visited.has(childId)) stack.push(childId);
      }
    }
  }

  // Now filter original items to preserve input ordering, exclude the target itself
  return items.filter((it) => it.id !== targetId && visited.has(it.id));
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
        parentId: item?.parentId as string,
      };

      activeHeader.items.splice(itemIndex, 0, pending);

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
