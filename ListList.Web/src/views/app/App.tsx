import { findIndex } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Router, useLocation, useRoute } from 'wouter';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { Icon, LabelAndDescriptionEditor } from '../../components';
import { Listeners, SortableTree } from '../../components/tree/SortableTree';
import { ApiListItemCreation } from '../../contracts';
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

export type RouteParams = { activeHeaderId: string };

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme('ll-theme');

  const [location, navigate] = useLocation();

  const [match, params] = useRoute<RouteParams>('/:activeHeaderId');

  const { activeHeaderId } = match ? params : {};

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
        loadHeaders();
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });
        dispatch({ type: ActionType.SetSyncing, syncing: false });
      }
    }
  }, [authState.initialized, authState.authenticated]);

  // Keep state up-to-date with route
  useEffect(() => {}, [location]);

  const apis = React.useMemo<{ header: ListHeaderApi; item: ListItemApi }>(
    () => ({
      header: new ListHeaderApi(authState.token),
      item: new ListItemApi(authState.token),
    }),
    [authState]
  );

  const loadHeaders = () => {
    apis.header.Get().then((headers) => {
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

  const loadHeader = (headerId: string) => {
    apis.header
      .GetById(headerId)
      .then((header) => dispatch({ type: ActionType.SetHeader, header }));
  };

  const loadItem = (itemId: string) => {
    apis.item
      .GetById(itemId)
      .then((item) => dispatch({ type: ActionType.SetItem, item }));
  };

  const handleCreateHeader = (listItem: ApiListItemCreation) => {
    if (listItem.label.trim().length > 0) {
      const headerCreation = { ...listItem, label: listItem.label.trim() };

      new ListHeaderApi(authState.token)
        .Create(headerCreation)
        .then((id: string) => {
          dispatch({ type: ActionType.FinalizeHeaderCreate });
          loadHeaders();
        });
    } else {
      dispatch({ type: ActionType.CancelHeaderCreate });
    }
  };

  const activeHeader = React.useMemo(() => {
    // return null as typeof state.headers[0]
    const index = findIndex(state.headers, (h) => h.id == activeHeaderId);

    return index >= 0 ? state.headers[index] : null;
  }, [activeHeaderId, state.headers, state.expanded]);

  const previousHeader = React.useMemo(() => {
    const index = findIndex(
      state.headers,
      (h) => h.id == state.previousHeaderId
    );

    return index >= 0 ? state.headers[index] : null;
  }, [state.previousHeaderId]);

  const displayHeader = activeHeader || previousHeader;

  const headerListeners = React.useMemo<Listeners>(
    (): Listeners | null => ({
      onClick: (headerId: string) => {
        navigate(headerId);
        dispatch({ type: ActionType.SelectHeader, headerId });
      },
      onDragEnd: (headerId: string, destinationId: string) => {
        const order = state.headers.findIndex((h) => h.id == destinationId);

        new ListHeaderApi(authState.token)
          .Relocate(headerId, { order })
          .then(() => loadHeaders());
      },
      onSaveDescription: (id: string, description: string) =>
        apis.header
          .Put(id, {
            ...state.headers.find((h) => h.id == id),
            description,
          })
          .then(() => loadHeader(id)),
      onSaveLabel: (id: string, label: string) =>
        apis.header
          .Put(id, {
            ...state.headers.find((h) => h.id == id),
            label,
          })
          .then(() => loadHeader(id)),
    }),
    [authState?.token, state.expanded, state.headers, activeHeader]
  );

  const activeListeners = React.useMemo<Listeners>(
    (): Listeners | null =>
      activeHeader
        ? {
            onClick: (itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: activeHeader.id,
                itemId,
              });
            },
            onDragEnd: (activeId: string, overId: string, parentId: string) =>
              apis.item
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(activeHeader.id)),
            onSaveDescription: (id: string, description: string) =>
              apis.item
                .Put(id, {
                  ...activeHeader.items.find((i) => i.id == id),
                  description,
                })
                .then(() => loadItem(id)),
            onSaveLabel: (id: string, label: string) =>
              apis.item
                .Put(id, {
                  ...activeHeader.items.find((i) => i.id == id),
                  label,
                })
                .then(() => loadItem(id)),
          }
        : null,
    [activeHeader]
  );

  return (
    <Router>
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
                <div className="selected-header">
                  <div className="content">
                    <LabelAndDescriptionEditor
                      name={displayHeader?.id ?? 'none'}
                      label={displayHeader?.label ?? ''}
                      description={displayHeader?.description ?? ''}
                      onSaveLabel={(label) =>
                        headerListeners?.onSaveLabel(activeHeader.id, label)
                      }
                      onSaveDescription={(description) =>
                        headerListeners?.onSaveDescription(
                          activeHeader.id,
                          description
                        )
                      }
                    />
                  </div>
                  <div className="actions">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        navigate('/');

                        dispatch({ type: ActionType.DeselectHeader });
                      }}
                    >
                      <Icon type="backward" />
                    </Button>
                  </div>
                </div>
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
    </Router>
  );
};
