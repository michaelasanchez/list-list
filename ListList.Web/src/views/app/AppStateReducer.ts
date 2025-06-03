import { filter, map } from 'lodash';
import { App, AppState, NodePath } from '.';
import { ListItemCreation } from '../../contracts';
import { ListHeader, ListNode } from '../../models';

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
  ToggleNode,
  UpdateHeaderCreation,
}

export interface AppStateAction {
  type: AppStateActionType;
  creation?: ListItemCreation;
  header?: ListHeader;
  headerId?: string;
  headers?: ListHeader[];
  syncing?: boolean;
  item?: ListNode;
  path?: NodePath;
}

export const getNode = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getNode(node.children[first], path);
};

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
    case AppStateActionType.SelectHeader: {
      return {
        ...state,
        activeHeaderId: action.headerId,
      };
    }
    case AppStateActionType.SetHeader: {
      const headers = map(state.headers, (h) =>
        h.id == action.header.id ? action.header : h
      );

      return {
        ...state,
        headers,
      };
    }
    case AppStateActionType.SetHeaders: {
      return {
        ...state,
        headers: action.headers,
      };
    }
    case AppStateActionType.SetSyncing: {
      return {
        ...state,
        syncing: action.syncing,
      };
    }
    case AppStateActionType.ToggleNode: {
      console.log(action.path);
      const headerIndex = action.path.shift();
      const targetNode = getNode(state.headers[headerIndex].root, action.path);

      targetNode.expanded = !targetNode.expanded;

      const expanded = targetNode.expanded
        ? [...state.expanded, targetNode.id]
        : filter(state.expanded, (n) => n != targetNode.id);

      return {
        ...state,
        headers: [...state.headers],
        expanded,
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
