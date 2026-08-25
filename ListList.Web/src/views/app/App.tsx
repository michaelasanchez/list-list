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
  CustomAction,
  MinimumLink,
  ShareModal,
} from '../../components';
import { ItemFeature } from '../../components/item-feature';
import { SlideTransition } from '../../components/slide-transition';
import {
  SortableTreeActions as Actions,
  SortableTree,
} from '../../components/tree/SortableTree';
import { ApiNodeCreation, ApiPartitionPut } from '../../contracts';
import {
  LocalStorageState,
  useAlerts,
  useAuth,
  useLocalStorage,
  useNavigationState,
  useTheme,
} from '../../hooks';
import { ViewMapper } from '../../mappers';
import { Node, Partition } from '../../models';
import {
  NodeApi,
  PartitionApi,
  ShareApi,
  Succeeded,
  TreeApi,
} from '../../network';
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
    partitions: defaultState.headers ?? [],
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
      headers: state.partitions,
    });
    localStorage.commit(json);
  }, [state.expanded, /*state.tokens,*/ state.partitions]);

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
      headerApi: new PartitionApi(),
      itemApi: new NodeApi(),
      shareApi: new ShareApi(),
      treeApi: new TreeApi(),
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
        dispatch({ type: ActionType.SetHeader, partition: header });

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
        dispatch({ type: ActionType.SetItem, node: item });

        return true;
      } catch {
        return false;
      }
    },
    [apis],
  );

  const createNode = useCallback(
    async (partitionId: string, raw: ApiNodeCreation): Promise<Succeeded> => {
      if (
        (raw.label && raw.label.trim().length > 0) ||
        (raw.description && raw.description.trim().length > 0)
      ) {
        const creation: ApiNodeCreation = {
          // ...raw,
          label: raw.label?.trim() ?? '',
          description: raw.description?.trim(),
          complete: raw.complete,
          overId: raw.overId,
          parentId: raw.parentId,
        };

        dispatch({ type: ActionType.SetLoading, loading: true });

        try {
          await apis.headerApi.CreateNode(partitionId, creation);

          // dispatch({ type: ActionType.FinalizeItemCreate, partitionId });
          dispatch({ type: ActionType.SetLoading, loading: true });

          loadHeader(partitionId);

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
        state.partitions ?? [],
        state.expanded,
      ),
    [navState.token, navState.selectedId, state.partitions, state.expanded],
  );

  // Load header if not found from initial load
  useEffect(() => {
    if (!state.syncing && navState.token && !current.partitionId) {
      loadHeader(navState.token);
    }
  }, [current, state.syncing]);

  /* ACTIONS */
  const sharedActions = React.useMemo<Actions>(
    (): Actions => ({
      onCollapse: (partitionId, nodeId) => {
        dispatch({
          type: ActionType.ToggleExpanded,
          partitionId,
          nodeId,
        });
      },
      onNavigate: (partitionId, nodeId) => {
        partitionId == nodeId
          ? navigate(partitionId)
          : navigate(partitionId, nodeId);
      },
    }),
    [],
  );

  const headerActions = React.useMemo<Actions>(
    (): Actions => ({
      ...sharedActions,
      custom: ({
        id: partitionId,
        checklist,
      }: {
        id: string;
        checklist: boolean;
      }): CustomAction[][] => {
        return [
          [
            {
              label: 'Checklist',
              icon: checklist ? 'checked' : 'unchecked',
              fade: !checklist,
              keepOpen: true,
              action: () =>
                apis.headerApi
                  .Patch(partitionId, { checklist: !checklist })
                  .then(() => loadHeader(partitionId)),
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
                await apis.headerApi.Delete(partitionId);

                const header = state.partitions?.find(
                  (h) => h.id == partitionId,
                );

                dispatch({
                  type: ActionType.FinalizeHeaderDelete,
                  partitionId,
                });

                if (header) {
                  showHeaderUndoAlert(header);
                }

                return true;
              },
            },
          ],
        ];
      },
      onCreate: async (label, description, overId) => {
        const order =
          (state.partitions?.findIndex((h) => h.id == overId) ?? 0) - 1;

        await apis.headerApi.CreatePartition({
          label: label ?? '',
          description: description ?? '',
          order,
        });

        return loadHeaders();
      },
      onDelete: async (partitionId) => {
        if (partitionId == newNodeId) {
          dispatch({
            type: ActionType.CancelHeaderCreate,
          });

          return Promise.resolve(true);
        } else {
          await apis.headerApi.Delete(partitionId);

          dispatch({
            type: ActionType.FinalizeHeaderDelete,
            partitionId: partitionId,
          });

          const header = state.partitions?.find((h) => h.id == partitionId);

          if (header) {
            showHeaderUndoAlert(header);
          }

          return Promise.resolve(true);
        }
      },
      onDragEnd: async (activeId, overId, projectedParentId) => {
        const activeInfo = findItemLocation(activeId, state.partitions);
        const overInfo = findItemLocation(overId, state.partitions);
        const parentId = normalizeParentId(projectedParentId, state.partitions);

        console.log('ACTIVE', activeInfo);
        console.log('OVER', overInfo);

        if (activeInfo.type === 'partition' && overInfo.type === 'partition') {
          const order = getReorderedIndex(
            state.partitions ?? [],
            activeId,
            overId,
          );

          console.log('ACTIVE ID', activeId);
          console.log('OVER ID', overId);
          console.log('PARENT ID', parentId);

          // await apis.treeApi.RelocatePartition(activeId, { order });

          // await loadHeaders();
          return true;
        } else if (
          activeInfo.type === 'node' &&
          overInfo.type === 'partition'
        ) {
          await apis.treeApi.PromoteNode(activeInfo.partitionId!, activeId, {
            order:
              state.partitions?.findIndex(
                (partition) => partition.id === overInfo.partitionId,
              ) ?? 0,
          });
          await loadHeaders();
          return true;
        } else if (
          activeInfo.type === 'partition' &&
          overInfo.type === 'node'
        ) {
          await apis.treeApi.DemotePartition(activeId, {
            destinationPartitionId: overInfo.partitionId!,
            parentId: parentId ?? overId,
            order:
              parentId === overId
                ? 0
                : getNodeOrder(
                    overInfo.partitionId!,
                    overId,
                    activeId,
                    parentId,
                    state.partitions,
                  ),
          });
          await loadHeaders();
          return true;
        } else if (activeInfo.type === 'node' && overInfo.type === 'node') {
          const partition = findItemLocation(
            overInfo.partitionId!,
            state.partitions,
          );

          console.log(
            'RELOCATE NODE\n',
            `destinationPartitionId: ${overInfo.partitionId}\n`,
            `dest partition label: ${partition?.label}\n`,
            `parentId: ${parentId}\n`,
            `order: ${getNodeOrder(overInfo.partitionId!, overId, activeId, parentId, state.partitions)}`,
          );
          await apis.treeApi.RelocateNode(activeInfo.partitionId!, activeId, {
            destinationPartitionId: overInfo.partitionId!,
            parentId,
            order: getNodeOrder(
              overInfo.partitionId!,
              overId,
              activeId,
              parentId,
              state.partitions,
            ),
          });
          await loadHeaders();
          return true;
        }

        return true;
      },
      onUpdate: async (partitionId, update) => {
        const header = state.partitions?.find((h) => h.id == partitionId);

        if (header) {
          const put: ApiPartitionPut = {
            ...header,
            ...update,
          };

          return apis.headerApi
            .Put(partitionId, put)
            .then(() => loadHeader(partitionId));
        }

        return Promise.resolve(false);
      },
    }),
    [authState.user, current, state.partitions],
  );

  const nodeActions = React.useMemo<Actions | null>(
    (): Actions | null =>
      !current
        ? null
        : {
            ...sharedActions,
            onCheck: (nodeId) =>
              apis.itemApi
                .Complete(current.token!, nodeId)
                .then(() => loadItem(current.token!, nodeId)),
            onCreate: (label, description, overId, parentId) =>
              createNode(current.partitionId!, {
                label,
                description,
                overId,
                parentId,
              }),
            onDelete: async (activeId, overId, parentId) => {
              if (activeId == newNodeId) {
                dispatch({
                  type: ActionType.CancelItemCreate,
                  partitionId: current.partitionId!,
                });
              } else {
                await apis.itemApi.Delete(current.token!, activeId);

                loadHeader(current.partitionId!);

                const item = getItem(
                  state.partitions ?? [],
                  current.partitionId!,
                  activeId,
                );

                if (item) {
                  showItemUndoAlert(current.token!, item, overId, parentId);
                }
              }
              return Promise.resolve(true);
            },
            onDragEnd: (activeId, overId, parentId) =>
              apis.itemApi
                .Relocate(current.token!, activeId, overId, parentId)
                .then(() => loadHeader(current.partitionId!)),
            onUpdate: async (activeId, update) => {
              if (current.partitionId) {
                const item = getItem(
                  state.partitions,
                  current.partitionId,
                  activeId,
                );

                if (item && current.token) {
                  await apis.itemApi.Put(current.token, activeId, {
                    ...item,
                    ...update,
                  });

                  return await loadItem(current.token, activeId);
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
                  hooks={headerActions}
                  onBack={() => {
                    const parent = vm.path?.length
                      ? vm.path[vm.path.length - 1]
                      : null;

                    navigate(parent?.partitionId, parent?.selectedId);
                  }}
                  onPatch={(patch) =>
                    // TODO: is this the same as what is on hooks.onUpdate?
                    //          ANSWER: no.... :'(
                    //            but we'll get to this later
                    vm.partitionId &&
                    apis.headerApi.Patch(vm.partitionId, patch).then(() => {
                      if (vm.partitionId) loadHeader(vm.partitionId);
                    })
                  }
                  onShare={() => setQueryParams({ share: 'true' })}
                />
              )}

              {Boolean(vm.items) ? (
                <SortableTree
                  {...vm.treeProps}
                  defaultItems={vm.items}
                  actions={
                    // TODO: typescript
                    vm.depth === 0 ? headerActions : (nodeActions ?? undefined)
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
        partitionId={current.partitionId}
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
          apis.shareApi.Delete(id).then(() => loadHeader(current.partitionId!))
        }
        onShare={(share) =>
          apis.shareApi
            .Share(current.partitionId!, share)
            .then(() => loadHeader(current.partitionId!))
        }
        onUpdate={(id: string, put: MinimumLink) =>
          apis.shareApi
            .Put(id, { token: put.token ?? '', ...put })
            .then(() => loadHeader(current.partitionId!))
        }
      />
    </Router>
  );

  function showHeaderUndoAlert(header: Partition) {
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
    item: Node,
    overId: string | null,
    parentId: string | null,
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
                  loadHeader(item.partitionId);
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

function normalizeParentId(
  parentId: string | null,
  partitions: Partition[],
): string | null {
  return partitions.some((partition) => partition.id === parentId)
    ? null
    : parentId;
}

function getReorderedIndex(
  partitions: Partition[],
  activeId: string,
  overId: string,
): number {
  const activeIndex = partitions.findIndex(
    (partition) => partition.id === activeId,
  );
  const overIndex = partitions.findIndex(
    (partition) => partition.id === overId,
  );

  if (activeIndex < 0 || overIndex < 0) {
    return 0;
  }

  return Math.max(0, overIndex + (activeIndex < overIndex ? 1 : 0));
}

function getNodeRootOrder(
  partitionId: string,
  activeId: string,
  partitions: Partition[],
): number {
  return (
    partitions
      .find((partition) => partition.id === partitionId)
      ?.nodes.filter((node) => !node.parentId && node.id !== activeId).length ??
    0
  );
}

function getNodeOrder(
  partitionId: string,
  overId: string,
  activeId: string,
  parentId: string | null,
  partitions: Partition[],
): number {
  const nodes =
    partitions.find((partition) => partition.id === partitionId)?.nodes ?? [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const siblings = nodes.filter(
    (node) => (node.parentId ?? null) === parentId && node.id !== activeId,
  );

  let targetId: string | null = overId;
  let target = nodeById.get(targetId);

  while (target && (target.parentId ?? null) !== parentId) {
    targetId = target.parentId;
    target = targetId ? nodeById.get(targetId) : undefined;
  }

  const overIndex = target
    ? siblings.findIndex((node) => node.id === target.id)
    : -1;

  if (overIndex < 0) {
    return siblings.length;
  }

  // return overIndex;
  return overIndex + (target?.id === overId ? 0 : 1);
}

function getItem(
  headers: Partition[],
  partitionId: string,
  itemId: string,
): Node | null {
  const header = headers?.find((h) => h.id == partitionId);

  return header?.nodes?.find((i) => i.id == itemId) ?? null;
}

// Helper to find item details
const findItemLocation = (
  itemId: string,
  partitions: Partition[],
): { type: string; partitionId?: string; label?: string } => {
  // Check if it's a top-level partition
  const partition = partitions.find((p) => p.id === itemId);
  if (partition) {
    return {
      type: 'partition',
      partitionId: partition.id,
      label: partition.label,
    };
  }

  // Check if it's a node nested in a partition
  for (const p of partitions) {
    const node = p.nodes?.find((n) => n.id === itemId);
    if (node) {
      return { type: 'node', partitionId: p.id, label: node.label };
    }
  }

  return { type: 'unknown' };
};
