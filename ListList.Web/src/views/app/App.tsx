import { findIndex } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { ListHeaderDisplay } from '../../components';
import { Listeners, SortableTree } from '../../components/tree/SortableTree';
import { ListItemCreation } from '../../contracts';
import {
  LocalStorageState,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { ListHeaderApi, ListItemApi } from '../../network';
import { config } from '../../shared';
import { Navbar } from '../Navbar';
import { Temp } from './temp';

const getDefaultAppState = (localStorage: LocalStorageState): AppState => {
  const defaultState = localStorage.exists()
    ? JSON.parse(localStorage.fetch())
    : {};

  return {
    syncing: true,
    expanded: defaultState.expanded ?? [],
    headers: defaultState.headers,
  };
};

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme('ll-theme');

  const localStorage = useLocalStorage('ll-data');

  const [state, dispatch] = useReducer(
    AppStateReducer,
    getDefaultAppState(localStorage)
  );

  // Keep local storage up-to-date
  useEffect(() => {
    localStorage.commit(
      JSON.stringify({ expanded: state.expanded, headers: state.headers })
    );
  }, [state.expanded, state.headers]);

  // Load/unload list headers
  useEffect(() => {
    if (authState.initialized) {
      if (authState.authenticated) {
        loadHeaders(state.expanded);
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });
        dispatch({ type: ActionType.SetSyncing, syncing: false });
      }
    }
  }, [authState.initialized, authState.authenticated]);

  const loadHeaders = (expanded?: string[]) => {
    new ListHeaderApi(authState.token).Get().then((headers) => {
      dispatch({
        type: ActionType.SetHeaders,
        headers,
      });

      if (state.syncing) {
        dispatch({
          type: ActionType.SetSyncing,
          syncing: false,
        });
      }
    });
  };

  const loadHeader = (headerId: string, expanded: string[]) => {
    new ListHeaderApi(authState.token)
      .GetById(headerId)
      .then((header) => dispatch({ type: ActionType.SetHeader, header }));
  };

  // TODO: gets tricky because we have to map child nodes tooooo
  // const loadItem = (itemId: string) => {
  //   new ListItemApi(authState.token).GetById(itemId).then((resp) => {});
  // };

  const handleCreateHeader = (listItem: ListItemCreation) => {
    if (listItem.label.trim().length > 0) {
      const headerCreation = { ...listItem, label: listItem.label.trim() };

      new ListHeaderApi(authState.token)
        .Create(headerCreation)
        .then((id: string) => {
          dispatch({ type: ActionType.FinalizeHeaderCreate });
          loadHeaders(state.expanded);
        });
    } else {
      dispatch({ type: ActionType.CancelHeaderCreate });
    }
  };

  const activeHeader = React.useMemo(() => {
    const index = findIndex(state.headers, (h) => h.id == state.activeHeaderId);

    return index >= 0 ? state.headers[index] : null;
  }, [state.activeHeaderId, state.headers, state.expanded]);

  const previousHeader = React.useMemo(() => {
    const index = findIndex(
      state.headers,
      (h) => h.id == state.previousHeaderId
    );

    return index >= 0 ? state.headers[index] : null;
  }, [state.previousHeaderId]);

  const displayHeader = activeHeader || previousHeader;

  const headerListeners = React.useMemo<Listeners>(
    () => ({
      onClick: (headerId: string) =>
        dispatch({ type: ActionType.SelectHeader, headerId }),
      onDragEnd: (headerId: string, destinationId: string) => {
        const destinationIndex = state.headers.findIndex(
          (h) => h.id == destinationId
        );

        new ListHeaderApi(authState.token)
          .Relocate(headerId, destinationIndex)
          .then(() => loadHeaders(state.expanded));
      },
    }),
    [authState?.token, state.expanded, state.headers, activeHeader]
  );

  const activeListeners = React.useMemo<Listeners>(
    () =>
      activeHeader
        ? {
            onClick: (headerId: string, itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId,
                itemId,
              });
            },
            onDragEnd: (
              activeId: string,
              overId: string,
              parentId: string
            ) =>
              new ListItemApi(authState.token)
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(activeHeader.id, state.expanded)),
          }
        : null,
    [activeHeader]
  );

  return (
    <>
      <Navbar
        theme={themeState.current}
        authState={authState}
        syncing={state.syncing}
        onSetTheme={themeState.setTheme}
      />
      <main>
        <div className={`header-view${!activeHeader ? ' show' : ''}`}>
          <Container className="list-container">
            <SortableTree
              // indicator
              listeners={headerListeners}
              defaultItems={Temp.buildTreeFromHeaders(state.headers)}
            />
            {/* {authState.authenticated && (
              <ListNodeCreation
                node={(state as AppState).headerCreation}
                placeholder="New List"
                onCancel={() => dispatch({ type: ActionType.CancelNodeDelete })}
                onSave={() => handleCreateHeader(state.headerCreation)}
                onUpdate={(creation: ListItemCreation) =>
                  dispatch({ type: ActionType.UpdateHeaderCreation, creation })
                }
              />
            )} */}
          </Container>
        </div>
        <div className={`list-view${!!activeHeader ? ' show' : ''}`}>
          <Container className="list-container">
            {displayHeader && (
              <>
                <ListHeaderDisplay
                  token={authState.token}
                  header={displayHeader}
                  selected={true}
                  onSelect={() => dispatch({ type: ActionType.DeselectHeader })}
                  reloadHeader={() =>
                    loadHeader(activeHeader.id, state.expanded)
                  }
                />
                <SortableTree
                  collapsible
                  indicator
                  removable
                  defaultItems={Temp.buildTreeFromItems(
                    displayHeader.items,
                    state.expanded
                  )}
                  listeners={activeListeners}
                />
              </>
            )}
          </Container>
        </div>
      </main>
    </>
  );
};
