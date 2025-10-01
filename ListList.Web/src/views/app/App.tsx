import { findIndex } from 'lodash';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { Router, useLocation, useRoute } from 'wouter';

import cn from 'classnames';
import {
  AppStateActionType as ActionType,
  AppState,
  AppStateReducer,
  newNodeId,
} from '.';
import {
  DropdownAction,
  IconButton,
  MinimumLink,
  SelectedHeader,
  ShareModal,
} from '../../components';
import {
  SortableTreeHooks as Hooks,
  ItemUpdate,
  SortableTree,
} from '../../components/tree/SortableTree';
import { ApiListItemCreation } from '../../contracts';
import {
  LocalStorageState,
  useAlerts,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { Temp } from '../../mappers/TreeItemMapper';
import { Header, Item } from '../../models';
import { ListHeaderApi, ListItemApi, ShareApi, Succeeded } from '../../network';
import { config } from '../../shared';
import { Navbar } from '../Navbar';
import { FloatingUi } from '../ui';
import * as styles from './App.module.scss';

const themeKey = 'll-them';
const cacheKey = 'll-data';

const getDefaultAppState = (localStorage: LocalStorageState): AppState => {
  const defaultState = localStorage.exists()
    ? JSON.parse(localStorage.fetch())
    : {};

  return {
    syncing: true,
    loading: false,
    expanded: defaultState.expanded ?? [],
    tokens: {},
    headers: defaultState.headers ?? [],
  };
};

export type RouteParams = { token: string; action?: string };

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme(themeKey);

  const [location, navigate] = useLocation();

  const [match, params] = useRoute<RouteParams>('/:token/:action?');

  const { token } = match ? params : {};

  const localStorage = useLocalStorage(cacheKey);

  const [state, dispatch] = useReducer(AppStateReducer, null, () =>
    getDefaultAppState(localStorage)
  );

  const { AlertList, hideAlert, showAlert } = useAlerts({ duration: 15000 });

  // Keep local storage up-to-date
  useEffect(() => {
    const json = JSON.stringify({
      expanded: state.expanded,
      headers: state.headers,
    });
    localStorage.commit(json);
  }, [state.expanded, state.headers]);

  // Load/unload headers
  useEffect(() => {
    if (authState.initialized && !authState.loading) {
      if (authState.authenticated) {
        loadHeaders();
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });

        finishSyncing();
      }
    }
  }, [authState.initialized, authState.authenticated, authState.loading]);

  // Keep state up-to-date with route
  useEffect(() => {
    if (state.headers) {
    }
  }, [state.headers, token]);

  const finishSyncing = () =>
    state.syncing &&
    dispatch({
      type: ActionType.SetSyncing,
      syncing: false,
    });

  const apis = useMemo(
    () => ({
      headerApi: new ListHeaderApi(authState.token),
      itemApi: new ListItemApi(authState.token),
      shareApi: new ShareApi(authState.token),
    }),
    [authState]
  );

  const loadHeaders = useCallback(async (): Promise<Succeeded> => {
    dispatch({ type: ActionType.SetLoading, loading: true });

    try {
      const headers = await apis.headerApi.GetAll();

      dispatch({ type: ActionType.SetLoading, loading: false });
      dispatch({ type: ActionType.SetHeaders, headers });

      return true;
    } catch {
      return false;
    } finally {
      finishSyncing();
    }
  }, [apis]);

  const loadHeader = useCallback(
    async (token: string): Promise<Succeeded> => {
      dispatch({ type: ActionType.SetLoading, loading: true });

      try {
        const header = await apis.headerApi.Get(token);

        dispatch({ type: ActionType.SetLoading, loading: false });
        dispatch({ type: ActionType.SetHeader, header });

        return true;
      } catch {
        return false;
      } finally {
        finishSyncing();
      }
    },
    [apis]
  );

  const loadItem = useCallback(
    async (itemId: string): Promise<Succeeded> => {
      dispatch({ type: ActionType.SetLoading, loading: true });

      try {
        const item = await apis.itemApi.GetById(itemId);

        dispatch({ type: ActionType.SetLoading, loading: false });
        dispatch({ type: ActionType.SetItem, item });

        return true;
      } catch {
        return false;
      }
    },
    [apis]
  );

  const handleCreateItem = useCallback(
    async (headerId: string, raw: ApiListItemCreation): Promise<Succeeded> => {
      if (raw.label?.trim().length > 0 || raw.description?.trim().length > 0) {
        const creation: ApiListItemCreation = {
          // ...raw,
          label: raw.label?.trim(),
          description: raw.description?.trim(),
          complete: raw.complete,
          overId: raw.overId,
          parentId: raw.parentId,
        };

        dispatch({ type: ActionType.SetLoading, loading: true });

        try {
          await apis.headerApi.CreateItem(headerId, creation);

          // dispatch({ type: ActionType.FinalizeItemCreate, headerId });
          dispatch({ type: ActionType.SetLoading, loading: true });

          loadHeader(headerId);

          return true;
        } catch {
          return false;
        }
      } else {
        dispatch({ type: ActionType.CancelItemCreate });

        return false;
      }
    },
    [apis]
  );

  const selected = React.useMemo(() => {
    const index = !token
      ? -1
      : findIndex(
          state.headers,
          (h) => h.id == token || h.tokens?.includes(token)
        );

    const header = index >= 0 ? state.headers[index] : null;
    const id = Boolean(header) ? header.id : null;

    const tree = Boolean(header)
      ? Temp.buildTreeFromItems(header.items, state.expanded)
      : [];

    if (Boolean(header)) {
      dispatch({
        type: ActionType.SetPreviousHeaderId,
        headerId: header.id,
      });
    }

    return { header, id, tree };
  }, [token, state.headers, state.expanded]);

  // Load header if not found from initial load
  useEffect(() => {
    if (!state.syncing && !selected && !!token) {
      loadHeader(token);
    }
  }, [selected, state.syncing]);

  const display = React.useMemo(() => {
    if (Boolean(selected.header)) {
      return selected;
    }

    const index = findIndex(
      state.headers,
      (h) => h.id == state.previousHeaderId
    );

    const header = index >= 0 ? state.headers[index] : null;
    const id = Boolean(header) ? header.id : null;
    const tree = Boolean(header)
      ? Temp.buildTreeFromItems(header.items, state.expanded)
      : [];

    return { header, id, tree };
  }, [selected, state.previousHeaderId]);

  const headersHooks = React.useMemo<Hooks>(
    (): Hooks | null => ({
      actions: ({
        id: headerId,
        checklist,
      }: {
        id: string;
        checklist: boolean;
      }): DropdownAction[][] => {
        return [
          [
            {
              label: 'Checklist',
              icon: checklist ? 'checked' : 'unchecked',
              fade: !checklist,
              keepOpen: true,
              action: () =>
                apis.headerApi
                  .Patch(headerId, { checklist: !checklist })
                  .then(() => loadHeader(headerId)),
            },
            // {
            //   label: 'Show Completed',
            //   icon: 'unchecked',
            //   fade: true,
            //   keepOpen: true,
            //   action: () => console.log('show completed'),
            // },
            {
              label: 'Show Dates',
              icon: 'unchecked',
              fade: true,
              keepOpen: true,
              action: () => console.log('show dates'),
            },
          ],
          [
            {
              label: 'Delete',
              icon: 'delete',
              action: async () => {
                await apis.headerApi.Delete(headerId);

                const header = state.headers.find((h) => h.id == headerId);

                dispatch({ type: ActionType.FinalizeHeaderDelete, headerId });

                showHeaderUndoAlert(header);

                return true;
              },
            },
          ],
        ];
      },
      onClick: (headerId: string) => navigate(headerId),
      onCreate: async (label: string, description: string, overId: string) => {
        const order = state.headers.findIndex((h) => h.id == overId) - 1;

        await apis.headerApi.CreateHeader({
          label,
          description,
          order,
        });

        // dispatch({ type: ActionType.FinalizeHeaderCreate });

        return loadHeaders();
      },
      onDragEnd: async (headerId: string, destinationId: string) => {
        const order = state.headers.findIndex((h) => h.id == destinationId);

        await apis.headerApi.Relocate(headerId, { order });

        return loadHeaders();
      },
      onUpdate: async (id: string, update: ItemUpdate) =>
        apis.headerApi
          .Put(id, {
            ...state.headers.find((h) => h.id == id),
            ...update,
          })
          .then(() => loadHeader(id)),
    }),
    [authState?.token, state.headers]
  );

  const selectedHooks = React.useMemo<Hooks>(
    (): Hooks | null =>
      !selected
        ? null
        : {
            onCheck: (itemId: string) =>
              apis.itemApi.Complete(itemId).then(() => loadItem(itemId)),
            onClick: (itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: selected.id,
                itemId,
              });
            },
            onCreate: (label, description, overId: string, parentId: string) =>
              handleCreateItem(selected.id, {
                label,
                description,
                overId,
                parentId,
              }),
            onDelete: (id: string, overId: string, parentId: string) => {
              if (id == newNodeId) {
                dispatch({
                  type: ActionType.CancelItemCreate,
                  headerId: selected.id,
                });

                return Promise.resolve(true);
              } else {
                return apis.itemApi.Delete(id).then(() => {
                  loadHeader(selected.id);

                  const item = selected.header.items.find((i) => i.id == id);

                  showItemUndoAlert(item, overId, parentId);

                  return true;
                });
              }
            },
            onDragEnd: (activeId: string, overId: string, parentId: string) =>
              apis.itemApi
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(selected.id)),
            onUpdate: (id: string, update: ItemUpdate) =>
              apis.itemApi
                .Put(id, {
                  ...selected.header.items.find((i) => i.id == id),
                  ...update,
                })
                .then(() => loadItem(id)),
          },
    [selected]
  );

  const showListView = Boolean(token);

  const viewRef = React.useRef<HTMLDivElement>(null);

  console.log('LOADING', state.syncing || state.loading);

  return (
    <Router>
      <Navbar
        theme={themeState.current}
        authState={authState}
        syncing={state.syncing}
        onSetTheme={themeState.setTheme}
      />
      <main>
        <div
          className={`header-view${!showListView ? ' show' : ''}`}
          ref={!showListView ? viewRef : null}
        >
          <Container className="list-container">
            <SortableTree
              hooks={headersHooks}
              defaultItems={Temp.buildTreeFromHeaders(
                state.headers.filter((h) => !h.isNotOwned)
              )}
            />
          </Container>
        </div>
        <div
          className={cn(styles.ListView, 'list-view', showListView && 'show')}
          ref={showListView ? viewRef : null}
        >
          <Container className="list-container">
            <SelectedHeader
              token={token}
              header={display.header}
              listeners={headersHooks}
              onBack={() => navigate('/')}
              onPatch={(patch) =>
                apis.headerApi
                  .Patch(display.id, patch)
                  .then(() => loadHeader(display.id))
              }
              onShare={() => navigate(`/${token}/share`)}
            />
            {!Boolean(display.header) && (
              <>
                <div className={styles.NotFound}>
                  <h2>List not found!</h2>
                  {/* <Button */}
                  <IconButton iconType="backward"
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    Back
                  </IconButton>
                </div>
              </>
            )}
            <SortableTree
              collapsible
              indicator
              removable
              checklist={display.header?.isChecklist}
              readonly={display.header?.isReadonly}
              defaultItems={display.tree}
              hooks={selectedHooks}
            />
          </Container>
        </div>
      </main>

      <FloatingUi
        selectedHeader={selected?.header}
        viewRef={viewRef}
        dispatch={dispatch}
        showAlert={showAlert}
      />

      {AlertList}

      <ShareModal
        show={params?.action == 'share'}
        shareLinks={selected.header?.shareLinks}
        onClose={() => navigate(`/${token ?? selected.id}`)}
        onDelete={(id: string) =>
          apis.shareApi.Delete(id).then(() => loadHeader(selected.id))
        }
        onShare={(share) =>
          apis.shareApi
            .Share(selected.id, share)
            .then(() => loadHeader(selected.id))
        }
        onUpdate={(id: string, put: MinimumLink) =>
          apis.shareApi
            .Put(id, { token: put.token ?? '', ...put })
            .then(() => loadHeader(selected.id))
        }
      />
    </Router>
  );

  function showHeaderUndoAlert(header: Header) {
    const alertId = showAlert({
      content: (
        <>
          <strong>"{header.label}"</strong> was deleted.{' '}
          <Alert.Link
            onClick={() =>
              apis.headerApi
                .Restore(header.id, { order: header.order })
                .then(() => {
                  // TODO: loading items could be skipped
                  loadHeaders(/* skipItems = true */);
                  hideAlert(alertId);
                })
            }
          >
            Undo
          </Alert.Link>
        </>
      ),
    });
  }

  function showItemUndoAlert(item: Item, overId: string, parentId: string) {
    const alertId = showAlert({
      content: (
        <>
          <strong>"{item.label}"</strong> was deleted.{' '}
          <Alert.Link
            onClick={() =>
              apis.itemApi.Restore(item.id, overId, parentId).then(() => {
                loadHeader(item.headerId);
                hideAlert(alertId);
              })
            }
          >
            Undo
          </Alert.Link>
        </>
      ),
    });
  }
};
