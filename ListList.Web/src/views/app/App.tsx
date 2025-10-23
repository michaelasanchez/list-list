import * as React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Container } from 'react-bootstrap';
import { Router } from 'wouter';

import cn from 'classnames';
import {
  AppStateActionType as ActionType,
  AppState,
  AppStateReducer,
  newNodeId,
} from '.';
import {
  Breadcrumbs,
  DropdownAction,
  MinimumLink,
  ShareModal,
} from '../../components';
import { ItemFeature } from '../../components/item-feature';
import { SlideTransition } from '../../components/slide-transition';
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
  useNavigationState,
  useTheme,
} from '../../hooks';
import { ViewMapper } from '../../mappers';
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

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme(themeKey);

  const localStorage = useLocalStorage(cacheKey);

  const [state, dispatch] = useReducer(AppStateReducer, null, () =>
    getDefaultAppState(localStorage)
  );

  const {
    navigate: navigateBase,
    setQueryParams,
    ...navState
  } = useNavigationState();

  const { AlertList, hideAlert, showAlert } = useAlerts();

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

  const navigate = useCallback(
    (token?: string, selectedId?: string) => {
      const parts = [token, selectedId].filter(Boolean);
      const route = parts.length ? parts.join('/') : '';

      navigateBase(`/${route}`);
    },
    [navigateBase]
  );

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

  const createItem = useCallback(
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

  const current = React.useMemo(
    () =>
      ViewMapper.map(
        navState.token,
        navState.selectedId,
        state.headers,
        state.expanded
      ),
    [navState.token, navState.selectedId, state.headers, state.expanded]
  );

  // Load header if not found from initial load
  useEffect(() => {
    if (
      !state.syncing &&
      Boolean(navState.token) &&
      !Boolean(current.headerId)
    ) {
      loadHeader(navState.token);
    }
  }, [current, state.syncing]);

  const headerHooks = React.useMemo<Hooks>(
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
            // {
            //   label: 'Show Dates',
            //   icon: 'unchecked',
            //   fade: true,
            //   keepOpen: true,
            //   action: () => console.log('show dates'),
            // },
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

        return loadHeaders();
      },
      onDelete: async (activeId: string) => {
        if (activeId == newNodeId) {
          dispatch({
            type: ActionType.CancelHeaderCreate,
          });
        } else {
          await apis.headerApi.Delete(activeId);

          const header = state.headers.find((h) => h.id == activeId);

          dispatch({
            type: ActionType.FinalizeHeaderDelete,
            headerId: activeId,
          });

          showHeaderUndoAlert(header);

          return true;
        }
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

  const itemHooks = React.useMemo<Hooks>(
    (): Hooks | null =>
      !current
        ? null
        : {
            onCheck: (itemId: string) =>
              apis.itemApi.Complete(itemId).then(() => loadItem(itemId)),
            onClick: (id: string) => navigate(navState.token, id),
            onCollapse: (itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: current.headerId,
                itemId,
              });
            },
            onCreate: (label, description, overId: string, parentId: string) =>
              createItem(current.headerId, {
                label,
                description,
                overId,
                parentId,
              }),
            onDelete: async (
              activeId: string,
              overId: string,
              parentId: string
            ) => {
              if (activeId == newNodeId) {
                dispatch({
                  type: ActionType.CancelItemCreate,
                  headerId: current.headerId,
                });

                return Promise.resolve(true);
              } else {
                await apis.itemApi.Delete(activeId);

                loadHeader(current.headerId);

                const item = getItem(state.headers, current.headerId, activeId);

                showItemUndoAlert(item, overId, parentId);

                return true;
              }
            },
            onDragEnd: (activeId: string, overId: string, parentId: string) =>
              apis.itemApi
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(current.headerId)),
            onUpdate: async (activeId: string, update: ItemUpdate) => {
              const item = getItem(state.headers, current.headerId, activeId);

              await apis.itemApi.Put(activeId, {
                ...item,
                ...update,
              });

              return await loadItem(activeId);
            },
          },
    [current]
  );

  const mainRef = React.useRef<HTMLDivElement>(null);

  return (
    <Router>
      <Navbar
        authState={authState}
        syncing={state.syncing}
        theme={themeState.current}
        onSetTheme={themeState.setTheme}
      />
      <main ref={mainRef}>
        <SlideTransition
          current={current}
          render={(vm) => (
            <Container className={cn(styles.ViewContainer)}>
              {Boolean(vm.path) && (
                <Breadcrumbs path={vm.path} navigate={navigate} />
              )}
              {Boolean(vm.featured) && (
                <ItemFeature
                  node={vm.featured}
                  hooks={headerHooks}
                  onBack={() => {
                    const parent = Boolean(vm.path)
                      ? vm.path[vm.path.length - 1]
                      : null;

                    navigate(parent?.headerId, parent?.selectedId);
                  }}
                  onPatch={(patch) =>
                    // TODO: is this the same as what is on hooks.onUpdate?
                    //          ANSWER: no.... :'(
                    //            but we'll get to this later
                    apis.headerApi
                      .Patch(vm.headerId, patch)
                      .then(() => loadHeader(vm.headerId))
                  }
                  onShare={() => setQueryParams({ share: 'true' })}
                />
              )}
              <SortableTree
                {...vm.treeProps}
                defaultItems={vm.items}
                hooks={vm.depth === 0 ? headerHooks : itemHooks}
              />
            </Container>
          )}
        />
      </main>

      <FloatingUi
        headerId={current?.headerId}
        selectedId={current?.selectedId}
        items={current.items}
        containerRef={mainRef}
        dispatch={dispatch}
        showAlert={showAlert}
      />

      {AlertList}

      <ShareModal
        show={navState.queryParams.share === 'true'}
        shareLinks={current.featured?.shareLinks}
        onClose={() => setQueryParams({ share: null })}
        onDelete={(id: string) =>
          apis.shareApi.Delete(id).then(() => loadHeader(current.headerId))
        }
        onShare={(share) =>
          apis.shareApi
            .Share(current.headerId, share)
            .then(() => loadHeader(current.headerId))
        }
        onUpdate={(id: string, put: MinimumLink) =>
          apis.shareApi
            .Put(id, { token: put.token ?? '', ...put })
            .then(() => loadHeader(current.headerId))
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

function getItem(
  headers: Header[],
  headerId: string,
  itemId: string
): Item | null {
  const header = headers?.find((h) => h.id == headerId);

  return header?.items?.find((i) => i.id == itemId) ?? null;
}
