import { filter, map } from 'lodash';
import { AppState, getNode, NodePath } from '.';
import { ListItemCreation } from '../../contracts';
import { ListHeader, ListNode } from '../../models';
import { AppTheme } from '../../shared';

export enum AppStateActionType {
  // AddHeader,
  CancelHeaderCreate,
  CancelNodeDelete,
  FinalizeHeaderCreate,
  FinalizeNodeDelete,
  SetHeader,
  SetHeaders,
  // SetItem,
  ToggleNode,
  ToggleTheme,
  UpdateHeaderCreation,
}

export interface AppStateAction {
  type: AppStateActionType;
  creation?: ListItemCreation;
  header?: ListHeader;
  headerId?: string;
  headers?: ListHeader[];
  item?: ListNode;
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
    case AppStateActionType.FinalizeHeaderCreate: {
      // Remove creation prop from app state
      const { headerCreation: listHeaderCreation, ...rest } = state;

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
    case AppStateActionType.ToggleNode: {
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
    case AppStateActionType.ToggleTheme: {
      return {
        ...state,
        theme: state.theme == AppTheme.Light ? AppTheme.Dark : AppTheme.Light,
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
