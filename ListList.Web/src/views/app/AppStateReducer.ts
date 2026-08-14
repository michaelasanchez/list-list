import { filter, map } from 'lodash';
import { AppState } from '.';
import { ApiNode, ApiNodeCreation, ApiPartition } from '../../contracts';
import { ListItemMapper } from '../../mappers';
import { Node, Partition } from '../../models';

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
  creation?: ApiNodeCreation;
  partition?: ApiPartition;
  partitionId?: string | null;
  headers?: ApiPartition[];
  loading?: boolean;
  syncing?: boolean;
  index?: number;
  node?: ApiNode;
  nodeId?: string | null;
}

export const AppStateReducer = (
  state: AppState,
  action: AppStateAction,
): AppState => {
  switch (action.type) {
    case AppStateActionType.CancelHeaderCreate: {
      return {
        ...state,
        partitions: state.partitions.filter((h) => h.id != newNodeId),
      };
    }
    case AppStateActionType.CancelItemCreate: {
      return {
        ...state,
        partitions: state.partitions.map((h) =>
          h.id == action.partitionId
            ? { ...h, nodes: h.nodes.filter((i) => i.id != newNodeId) }
            : h,
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
        partitions: state.partitions.map((h) =>
          h.id == action.partitionId
            ? { ...h, nodes: h.nodes.filter((i) => !i.pending) }
            : h,
        ),
      };
    }
    case AppStateActionType.FinalizeItemDelete: {
      const updatedHeaders = filter(
        state.partitions,
        (h) => h.id !== action.partitionId,
      );

      return {
        ...state,
        partitions: updatedHeaders,
      };
    }
    case AppStateActionType.InitiateHeaderCreate: {
      if (state.partitions.some((h) => h.id == newNodeId)) {
        return state;
      }

      const pendingHeader: Partition = {
        id: newNodeId,
        order: state.partitions.length,
        checklist: false,
        owned: true,
        readonly: false,
        label: '',
        description: '',
        nodes: [],
        shareLinks: [],
        pending: true,
        tokens: null,
      };

      state.partitions.splice(
        action.index ?? state.partitions.length,
        0,
        pendingHeader,
      );

      return {
        ...state,
        partitions: [...state.partitions],
      };
    }
    case AppStateActionType.FinalizeHeaderDelete: {
      return {
        ...state,
        partitions: state.partitions.filter((h) => h.id != action.partitionId),
      };
    }
    case AppStateActionType.InitiateItemCreate: {
      if (!action.partitionId) {
        console.error(
          `AppStateActionType.InitiateItemCreate - action.headerId is required.`,
        );

        return state;
      }

      const activeHeader = state.partitions.find(
        (h) => h.id == action.partitionId,
      );

      if (!activeHeader) {
        console.error(
          `AppStateActionType.InitiateItemCreate - Partition with id ${action.partitionId} not found in state.headers`,
        );

        return state;
      }

      // Remove pending item if exists
      // (helps when pending item is left in another view)
      if (activeHeader.nodes.some((i) => i.id == newNodeId)) {
        activeHeader.nodes = activeHeader.nodes.filter(
          (i) => i.id != newNodeId,
        );
      }

      const itemIndex = activeHeader.nodes.findIndex(
        (i) => i.id == action.nodeId,
      );
      const item = activeHeader.nodes[itemIndex];

      const pending: Node = {
        id: newNodeId,
        label: '',
        description: '',
        complete: false,
        completedOn: '',
        depth: item?.depth ?? 0,
        index: 0,
        partitionId: action.partitionId,
        isParent: false,
        childCount: 0,
        childrenIds: [],
        descendantCount: 0,
        expanded: false,
        pending: true,
        parentId: action.asChild ? item?.id : (item?.parentId as string),
      };

      if (itemIndex < 0) {
        activeHeader.nodes.push(pending);
      } else {
        activeHeader.nodes.splice(itemIndex, 0, pending);
      }

      return {
        ...state,
        partitions: state.partitions.map((h) =>
          h.id == action.partitionId
            ? { ...h, nodes: [...activeHeader.nodes] }
            : h,
        ),
      };
    }
    case AppStateActionType.SetHeader: {
      if (!action.partition?.id) {
        console.error(
          `AppStateActionType.SetHeader - action.header${action.partition ? '.id' : ''} is required.`,
        );

        return state;
      }

      const existingIndex = state.partitions.findIndex(
        (h) => h.id == action.partition!.id,
      );

      const mapped = ListItemMapper.mapHeader(action.partition, state.expanded);

      if (action.partition.token) {
        if (!state.tokens[action.partition.id]) {
          state.tokens[action.partition.id] = [action.partition.token];
        } else {
          const combined = [
            ...state.tokens[action.partition.id],
            action.partition.token,
          ];

          state.tokens[action.partition.id] = combined;
          mapped.tokens = combined;
        }
      }

      return {
        ...state,
        partitions:
          existingIndex >= 0
            ? map(state.partitions, (h) =>
                h.id == action.partition!.id ? mapped : h,
              )
            : [...state.partitions, mapped],
      };
    }
    case AppStateActionType.SetHeaders: {
      if (!action.headers) {
        console.error(
          `AppStateActionType.SetHeaders - action.headers is required.`,
        );

        return state;
      }

      const headers = ListItemMapper.mapHeaders(action.headers, state.expanded);

      return {
        ...state,
        partitions: headers,
      };
    }
    case AppStateActionType.SetItem: {
      if (!action.node) {
        console.error(`AppStateActionType.SetItem - action.item is required.`);

        return state;
      }

      const headers = state.partitions.map((h) =>
        h.id == action.node?.partitionId
          ? {
              ...h,
              nodes: h.nodes.map((i) =>
                i.id == action.node?.id
                  ? ListItemMapper.mapItem(action.node, state.expanded)
                  : i,
              ),
            }
          : h,
      );

      return {
        ...state,
        partitions: headers,
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
      if (!action.nodeId) return state;

      return {
        ...state,
        partitions: state.partitions.map((h) =>
          h.id == (action.partitionId ?? action.nodeId)
            ? {
                ...h,
                nodes: h.nodes.map((i) =>
                  i.id == action.nodeId ? { ...i, expanded: !i.expanded } : i,
                ),
              }
            : h,
        ),
        expanded: state.expanded.includes(action.nodeId)
          ? filter(state.expanded, (i) => i != action.nodeId)
          : [...state.expanded, action.nodeId],
      };
    }
    default:
      return state;
  }
};
