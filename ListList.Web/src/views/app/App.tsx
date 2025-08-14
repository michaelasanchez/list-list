import { findIndex } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { Router, useLocation, useRoute } from 'wouter';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { SelectedHeader } from '../../components';
import {
  SortableTreeHooks as Hooks,
  SortableTree,
} from '../../components/tree/SortableTree';
import { ApiListItemCreation } from '../../contracts';
import {
  LocalStorageState,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { Temp } from '../../mappers/TreeItemMapper';
import { ListHeaderApi, ListItemApi, ShareApi } from '../../network';
import { config } from '../../shared';
import { Navbar } from '../Navbar';

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

export type RouteParams = { token: string };

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme(themeKey);

  const [location, navigate] = useLocation();

  const [match, params] = useRoute<RouteParams>('/:token');

  const { token } = match ? params : {};

  const localStorage = useLocalStorage(cacheKey);

  const [state, dispatch] = useReducer(AppStateReducer, null, () =>
    getDefaultAppState(localStorage)
  );

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
    if (authState.initialized) {
      if (authState.authenticated) {
        loadHeaders();
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });

        finishSyncing();
      }
    }
  }, [authState.initialized, authState.authenticated]);

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

  const apis = React.useMemo(
    () => ({
      headerApi: new ListHeaderApi(authState.token),
      itemApi: new ListItemApi(authState.token),
      shareApi: new ShareApi(authState.token),
    }),
    [authState]
  );

  const loadHeaders = () => {
    dispatch({ type: ActionType.SetLoading, loading: true });

    apis.headerApi.GetAll().then((headers) => {
      dispatch({ type: ActionType.SetLoading, loading: false });
      dispatch({ type: ActionType.SetHeaders, headers });

      finishSyncing();
    });
  };

  const loadHeader = (token: string) => {
    dispatch({ type: ActionType.SetLoading, loading: true });

    apis.headerApi.Get(token).then((header) => {
      dispatch({ type: ActionType.SetLoading, loading: false });
      dispatch({ type: ActionType.SetHeader, header });

      finishSyncing();
    });
  };

  const loadItem = (itemId: string) => {
    dispatch({ type: ActionType.SetLoading, loading: true });

    apis.itemApi.GetById(itemId).then((item) => {
      dispatch({ type: ActionType.SetLoading, loading: false });
      dispatch({ type: ActionType.SetItem, item });
    });
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

  const selectedHeader = React.useMemo(() => {
    const index = !token
      ? -1
      : findIndex(
          state.headers,
          (h) => h.id == token || h.tokens?.includes(token)
        );

    return index >= 0 ? state.headers[index] : null;
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

    const d = index >= 0 ? state.headers[index] : null;

    return d;
  }, [selectedHeader]);

  const headersListHooks = React.useMemo<Hooks>(
    (): Hooks | null => ({
      onClick: (headerId: string) => {
        navigate(headerId);
      },
      onDragEnd: (headerId: string, destinationId: string) => {
        const order = state.headers.findIndex((h) => h.id == destinationId);

        new ListHeaderApi(authState.token)
          .Relocate(headerId, { order })
          .then(() => loadHeaders());
      },
      onSaveDescription: (id: string, description: string) =>
        apis.headerApi
          .Put(id, {
            ...state.headers.find((h) => h.id == id),
            description,
          })
          .then(() => loadHeader(id)),
      onSaveLabel: (id: string, label: string) =>
        apis.headerApi
          .Put(id, {
            ...state.headers.find((h) => h.id == id),
            label,
          })
          .then(() => loadHeader(id)),
    }),
    [authState?.token, state.headers]
  );

  const selectedListHooks = React.useMemo<Hooks>(
    (): Hooks | null =>
      selectedHeader
        ? {
            onCheck: (itemId: string) => {
              apis.itemApi.Complete(itemId).then(() => loadItem(itemId));
            },
            onClick: (itemId: string) => {
              dispatch({
                type: ActionType.ToggleExpanded,
                headerId: selectedHeader.id,
                itemId,
              });
            },
            onDragEnd: (activeId: string, overId: string, parentId: string) =>
              apis.itemApi
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(selectedHeader.id)),
            onSaveDescription: (id: string, description: string) =>
              apis.itemApi
                .Put(id, {
                  ...selectedHeader.items.find((i) => i.id == id),
                  description,
                })
                .then(() => loadItem(id)),
            onSaveLabel: (id: string, label: string) =>
              apis.itemApi
                .Put(id, {
                  ...selectedHeader.items.find((i) => i.id == id),
                  label,
                })
                .then(() => loadItem(id)),
          }
        : null,
    [selectedHeader]
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
        <div className={`header-view${!selectedHeader ? ' show' : ''}`}>
          <Container className="list-container">
            <SortableTree
              listeners={headersListHooks}
              defaultItems={Temp.buildTreeFromHeaders(
                state.headers.filter((h) => !h.isNotOwned)
              )}
            />
          </Container>
        </div>
        <div className={`list-view${!!selectedHeader ? ' show' : ''}`}>
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
                  listeners={selectedListHooks}
                />
              </>
            )}
          </Container>
        </div>
      </main>
    </Router>
  );
};
