import { findIndex } from 'lodash';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Container } from 'react-bootstrap';
import { Router, useLocation, useRoute } from 'wouter';

import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import {
  DropdownAction,
  MinimumLink,
  SelectedHeader,
  ShareModal,
} from '../../components';
import {
  SortableTreeHooks as Hooks,
  ItemUpdate,
  SortableTree,
} from '../../components/tree/SortableTree';
import {
  LocalStorageState,
  useAlerts,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { Temp } from '../../mappers/TreeItemMapper';
import { ListHeaderApi, ListItemApi, ShareApi, Succeeded } from '../../network';
import { config } from '../../shared';
import { Navbar } from '../Navbar';
import { FloatingUi } from '../ui';

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

  const { AlertList, showAlert } = useAlerts();

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
    async (
      headerId: string,
      label: string,
      description: string
    ): Promise<Succeeded> => {
      if (label?.trim().length > 0 || description?.trim().length > 0) {
        const headerCreation = {
          label: label?.trim(),
          description: description?.trim(),
        };

        dispatch({ type: ActionType.SetLoading, loading: true });

        try {
          await apis.headerApi.CreateItem(headerId, headerCreation);

          dispatch({ type: ActionType.FinalizeHeaderCreate });
          dispatch({ type: ActionType.SetLoading, loading: true });

          loadHeader(headerId);

          return true;
        } catch {
          return false;
        }
      } else {
        dispatch({ type: ActionType.CancelHeaderCreate });

        return false;
      }
    },
    [apis]
  );

  const selectedHeader = React.useMemo(() => {
    const index = !token
      ? -1
      : findIndex(
          state.headers,
          (h) => h.id == token || h.tokens?.includes(token)
        );

    const selected = index >= 0 ? state.headers[index] : null;

    if (Boolean(selected)) {
      dispatch({
        type: ActionType.SetPreviousHeaderId,
        headerId: selected.id,
      });
    }

    return selected;
  }, [token, state.headers, state.expanded]);

  // Load header if not found from initial load
  useEffect(() => {
    if (!state.syncing && !selectedHeader && !!token) {
      loadHeader(token);
    }
  }, [selectedHeader, state.syncing]);

  const displayHeader = React.useMemo(() => {
    if (selectedHeader) {
      return selectedHeader;
    }

    const index = findIndex(
      state.headers,
      (h) => h.id == state.previousHeaderId
    );

    return index >= 0 ? state.headers[index] : null;
  }, [selectedHeader, state.previousHeaderId]);

  const headersListHooks = React.useMemo<Hooks>(
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
            {
              label: 'Show Completed',
              icon: 'unchecked',
              fade: true,
              keepOpen: true,
              action: () => console.log('show completed'),
            },
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

                showAlert({
                  content: (
                    <>
                      <strong>{header.label}</strong> was deleted.
                      <Alert.Link
                        onClick={
                          () =>
                            apis.headerApi
                              .Restore(headerId, { order: header.order })
                              .then(() => loadHeaders()) // TODO: this could probably use loadHeader(headerId), but something isn't working (maybe it's not ordering the list properly?)
                        }
                      >
                        Undo
                      </Alert.Link>
                    </>
                  ),
                });

                return true;
              },
            },
          ],
        ];
      },
      onClick: (headerId: string) => navigate(headerId),
      onCreate: async (label: string, description: string) => {
        const id = await apis.headerApi.CreateHeader({ label, description });

        dispatch({ type: ActionType.FinalizeHeaderCreate });

        return loadHeader(id);
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

  const selectedListHooks = React.useMemo<Hooks>(
    (): Hooks | null =>
      selectedHeader
        ? {
            onCheck: (itemId: string) =>
              apis.itemApi.Complete(itemId).then(() => loadItem(itemId)),
            onClick: (itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: selectedHeader.id,
                itemId,
              });
            },
            onCreate: (label, description) =>
              handleCreateItem(selectedHeader.id, label, description),
            onDelete: (id: string) =>
              apis.itemApi.Delete(id).then(() => loadHeader(selectedHeader.id)),
            onDragEnd: (activeId: string, overId: string, parentId: string) =>
              apis.itemApi
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(selectedHeader.id)),
            onUpdate: (id: string, update: ItemUpdate) =>
              apis.itemApi
                .Put(id, {
                  ...selectedHeader.items.find((i) => i.id == id),
                  ...update,
                })
                .then(() => loadItem(id)),
          }
        : null,
    [selectedHeader]
  );

  const showListView = Boolean(selectedHeader);

  return (
    <Router>
      <Navbar
        theme={themeState.current}
        authState={authState}
        syncing={state.syncing}
        onSetTheme={themeState.setTheme}
      />
      <main>
        <div className={`header-view${!showListView ? ' show' : ''}`}>
          <Container className="list-container">
            <SortableTree
              hooks={headersListHooks}
              defaultItems={Temp.buildTreeFromHeaders(
                state.headers.filter((h) => !h.isNotOwned)
              )}
            />
          </Container>
        </div>
        <div className={`list-view${showListView ? ' show' : ''}`}>
          <Container className="list-container">
            {displayHeader && (
              <>
                <SelectedHeader
                  header={displayHeader}
                  listeners={headersListHooks}
                  onBack={() => navigate('/')}
                  onPatch={(patch) =>
                    apis.headerApi
                      .Patch(displayHeader.id, patch)
                      .then(() => loadHeader(displayHeader.id))
                  }
                  onShare={() => navigate(`/${token}/share`)}
                />
                <SortableTree
                  collapsible
                  indicator
                  removable
                  checklist={displayHeader.isChecklist}
                  readonly={displayHeader.isReadonly}
                  defaultItems={Temp.buildTreeFromItems(
                    displayHeader.items,
                    state.expanded
                  )}
                  hooks={selectedListHooks}
                />
              </>
            )}
          </Container>
        </div>
      </main>

      <FloatingUi
        selectedHeader={selectedHeader}
        dispatch={dispatch}
        showAlert={showAlert}
      />

      {AlertList}

      <ShareModal
        show={params?.action == 'share'}
        shareLinks={selectedHeader?.shareLinks}
        onClose={() => navigate(`/${token ?? selectedHeader?.id}`)}
        onDelete={(id: string) =>
          apis.shareApi.Delete(id).then(() => loadHeader(selectedHeader?.id))
        }
        onShare={(share) =>
          apis.shareApi
            .Share(selectedHeader?.id, share)
            .then(() => loadHeader(selectedHeader?.id))
        }
        onUpdate={(id: string, put: MinimumLink) =>
          apis.shareApi
            .Put(id, { token: put.token ?? '', ...put })
            .then(() => loadHeader(selectedHeader?.id))
        }
      />
    </Router>
  );
};
