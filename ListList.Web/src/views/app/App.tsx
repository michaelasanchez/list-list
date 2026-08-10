import * as React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
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
import { ApiListHeaderPut, ApiListItemCreation } from '../../contracts';
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
    ? JSON.parse(localStorage.fetch()!)
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
    getDefaultAppState(localStorage),
  );

  const {
    navigate: navigateBase,
    setQueryParams,
    ...navState
  } = useNavigationState();

  const { AlertList, hideAlert, showAlert } = useAlerts();

  // TODO: finish implementing "tokens"
  // Keep local storage up-to-date
  useEffect(() => {
    const json = JSON.stringify({
      expanded: state.expanded,
      // tokens: state.tokens,
      headers: state.headers,
    });
    localStorage.commit(json);
  }, [state.expanded, /*state.tokens,*/ state.headers]);

  // Load/unload headers
  useEffect(() => {
    if (!authState.loading) {
      if (authState.user) {
        loadHeaders();
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });

        finishSyncing();
      }
    }
  }, [authState.loading, authState.user]);

  const navigate = useCallback(
    (token?: string, selectedId?: string) => {
      const parts = [token, selectedId].filter(Boolean);
      const route = parts.length ? parts.join('/') : '';

      navigateBase(`/${route}`);
    },
    [navigateBase],
  );

  const finishSyncing = () =>
    state.syncing &&
    dispatch({
      type: ActionType.SetSyncing,
      syncing: false,
    });

  const apis = useMemo(
    () => ({
      headerApi: new ListHeaderApi(),
      itemApi: new ListItemApi(),
      shareApi: new ShareApi(),
    }),
    [authState],
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
    [apis],
  );

  const loadItem = useCallback(
    async (token: string, itemId: string): Promise<Succeeded> => {
      dispatch({ type: ActionType.SetLoading, loading: true });

      try {
        const item = await apis.itemApi.GetById(token, itemId);

        dispatch({ type: ActionType.SetLoading, loading: false });
        dispatch({ type: ActionType.SetItem, item });

        return true;
      } catch {
        return false;
      }
    },
    [apis],
  );

  const createItem = useCallback(
    async (headerId: string, raw: ApiListItemCreation): Promise<Succeeded> => {
      if (
        (raw.label && raw.label?.trim().length > 0) ||
        (raw.description && raw.description?.trim().length > 0)
      ) {
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
    [apis],
  );

  const current = React.useMemo(
    () =>
      ViewMapper.map(
        navState.token ?? null,
        navState.selectedId ?? null,
        state.headers ?? [],
        state.expanded,
      ),
    [navState.token, navState.selectedId, state.headers, state.expanded],
  );

  // Load header if not found from initial load
  useEffect(() => {
    if (!state.syncing && navState.token && !current.headerId) {
      loadHeader(navState.token);
    }
  }, [current, state.syncing]);

  const headerHooks = React.useMemo<Hooks>(
    (): Hooks => ({
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

                const header = state.headers?.find((h) => h.id == headerId);

                dispatch({ type: ActionType.FinalizeHeaderDelete, headerId });

                if (header) {
                  showHeaderUndoAlert(header);
                }

                return true;
              },
            },
          ],
        ];
      },
      onClick: (headerId) => navigate(headerId as string),
      onCreate: async (label: string, description: string, overId) => {
        const order =
          (state.headers?.findIndex((h) => h.id == overId) ?? 0) - 1;

        await apis.headerApi.CreateHeader({
          label,
          description,
          order,
        });

        return loadHeaders();
      },
      onDelete: async (activeId) => {
        if (activeId == newNodeId) {
          dispatch({
            type: ActionType.CancelHeaderCreate,
          });

          return Promise.resolve(true);
        } else {
          await apis.headerApi.Delete(activeId as string);

          dispatch({
            type: ActionType.FinalizeHeaderDelete,
            headerId: activeId as string,
          });

          const header = state.headers?.find((h) => h.id == activeId);

          if (header) {
            showHeaderUndoAlert(header);
          }

          return Promise.resolve(true);
        }
      },
      onDragEnd: async (headerId, destinationId) => {
        const order =
          state.headers?.findIndex((h) => h.id == destinationId) ?? 0;

        await apis.headerApi.Relocate(headerId as string, { order });

        return loadHeaders();
      },
      onUpdate: async (headerId, update: ItemUpdate) => {
        const header = state.headers?.find((h) => h.id == headerId);

        if (header) {
          const put: ApiListHeaderPut = {
            ...header,
            ...update,
          };

          return apis.headerApi
            .Put(headerId as string, put)
            .then(() => loadHeader(headerId as string));
        }

        return Promise.resolve(false);
      },
    }),
    [authState.user, state.headers],
  );

  const itemHooks = React.useMemo<Hooks | null>(
    (): Hooks | null =>
      !current
        ? null
        : {
            onCheck: (itemId) =>
              apis.itemApi
                .Complete(current.token!, itemId as string)
                .then(() => loadItem(current.token!, itemId as string)),
            onCollapse: (itemId) =>
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: current.headerId!,
                itemId: itemId as string,
              }),
            onCreate: (label, description, overId, parentId) =>
              createItem(current.headerId!, {
                label,
                description,
                overId: overId as string,
                parentId: parentId as string,
              }),
            onDelete: async (activeId, overId, parentId) => {
              if (activeId == newNodeId) {
                dispatch({
                  type: ActionType.CancelItemCreate,
                  headerId: current.headerId!,
                });
              } else {
                await apis.itemApi.Delete(current.token!, activeId as string);

                loadHeader(current.headerId!);

                const item = getItem(
                  state.headers ?? [],
                  current.headerId!,
                  activeId as string,
                );

                if (item) {
                  showItemUndoAlert(
                    current.token!,
                    item,
                    overId as string,
                    parentId as string,
                  );
                }
              }
              return Promise.resolve(true);
            },
            onDragEnd: (activeId, overId, parentId) =>
              apis.itemApi
                .Relocate(
                  current.token!,
                  activeId as string,
                  overId as string,
                  parentId as string,
                )
                .then(() => loadHeader(current.headerId!)),
            onSelect: (activeId) =>
              navigate(navState.token, activeId as string),
            onUpdate: async (activeId, update: ItemUpdate) => {
              if (current.headerId) {
                const item = getItem(
                  state.headers,
                  current.headerId,
                  activeId as string,
                );

                if (item && current.token) {
                  await apis.itemApi.Put(current.token, activeId as string, {
                    ...item,
                    ...update,
                  });

                  return await loadItem(current.token, activeId as string);
                }
              }

              return Promise.resolve(false);
            },
          },
    [current],
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
              {vm.path && <Breadcrumbs path={vm.path} navigate={navigate} />}
              {vm.featured && (
                <ItemFeature
                  node={vm.featured}
                  hooks={headerHooks}
                  onBack={() => {
                    const parent = vm.path?.length
                      ? vm.path[vm.path.length - 1]
                      : null;

                    navigate(parent?.headerId, parent?.selectedId);
                  }}
                  onPatch={(patch) =>
                    // TODO: is this the same as what is on hooks.onUpdate?
                    //          ANSWER: no.... :'(
                    //            but we'll get to this later
                    vm.headerId &&
                    apis.headerApi.Patch(vm.headerId, patch).then(() => {
                      if (vm.headerId) loadHeader(vm.headerId);
                    })
                  }
                  onShare={() => setQueryParams({ share: 'true' })}
                />
              )}

              {Boolean(vm.items) ? (
                <SortableTree
                  {...vm.treeProps}
                  defaultItems={vm.items}
                  hooks={
                    // TODO: typescript
                    vm.depth === 0 ? headerHooks : (itemHooks ?? undefined)
                  }
                />
              ) : Boolean(state.loading || state.syncing) ? (
                <Spinner animation="border" />
              ) : (
                <div className={cn(styles.NotFound)}>
                  {Boolean(vm.token) ? 'List not found' : 'No lists available'}
                </div>
              )}
            </Container>
          )}
        />
      </main>

      <FloatingUi
        headerId={current.headerId}
        selectedId={current.selectedId}
        readonly={current.readonly ?? false}
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
          apis.shareApi.Delete(id).then(() => loadHeader(current.headerId!))
        }
        onShare={(share) =>
          apis.shareApi
            .Share(current.headerId!, share)
            .then(() => loadHeader(current.headerId!))
        }
        onUpdate={(id: string, put: MinimumLink) =>
          apis.shareApi
            .Put(id, { token: put.token ?? '', ...put })
            .then(() => loadHeader(current.headerId!))
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

  function showItemUndoAlert(
    token: string,
    item: Item,
    overId: string,
    parentId: string,
  ) {
    const alertId = showAlert({
      content: (
        <>
          <strong>"{item.label}"</strong> was deleted.{' '}
          <Alert.Link
            onClick={() =>
              apis.itemApi
                .Restore(token, item.id, overId, parentId)
                .then(() => {
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
  itemId: string,
): Item | null {
  const header = headers?.find((h) => h.id == headerId);

  return header?.items?.find((i) => i.id == itemId) ?? null;
}
