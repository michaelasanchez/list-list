import { filter } from 'lodash';
import { AppState } from '.';
import { ListNode } from '../../models';

enum AppStateActionType {
  CompleteNode,
  // InitDelete,
  FinalizeDelete,
  FinalizeCreate,
  FinalizeUpdate,
  ToggleNode,
}

export interface AppStateAction {
  type: AppStateActionType;
  node: ListNode;
}

export const AppStateReducer = (state: AppState, action: AppStateAction) => {
  switch (action.type) {
    case AppStateActionType.CompleteNode: {
      return {
        ...state,
      };
    }
    case AppStateActionType.FinalizeCreate: {
      // Remove creation prop from app state
      const { listHeaderCreation, ...rest } = state;

      return rest;
    }
    case AppStateActionType.FinalizeDelete: {
      return {
        ...state,
      };
    }
    case AppStateActionType.FinalizeUpdate: {
      return {
        ...state,
      };
    }
    case AppStateActionType.ToggleNode: {
      action.node.expanded = !action.node.expanded;

      const expanded = action.node.expanded
        ? [...state.expanded, action.node.id]
        : filter(state.expanded, (n) => n != action.node.id);

      localStorage.commit(JSON.stringify(expanded));

      return {
        ...state,
        headers: [...state.headers],
        expanded,
      };
    }
    default:
      return state;
  }
};
