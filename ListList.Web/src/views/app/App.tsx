import { findIndex } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { Router, useLocation, useRoute } from 'wouter';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { SelectedHeader } from '../../components';
import { Listeners, SortableTree } from '../../components/tree/SortableTree';
import { ApiListItemCreation } from '../../contracts';
import {
  LocalStorageState,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { ListHeaderApi, ListItemApi, ShareApi } from '../../network';
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

export type RouteParams = { token: string };

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);
  const themeState = useTheme('ll-theme');

  const [location, navigate] = useLocation();

  const [match, params] = useRoute<RouteParams>('/:token');

  const { token } = match ? params : {};

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
        if (token) {
          loadHeader(token);
        } else {
          loadHeaders();
        }
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });
        dispatch({ type: ActionType.SetSyncing, syncing: false });
      }
    }
  }, [authState.initialized, authState.authenticated]);

  // Keep state up-to-date with route
  useEffect(() => {}, [location]);

  const apis = React.useMemo(
    () => ({
      headerApi: new ListHeaderApi(authState.token),
      itemApi: new ListItemApi(authState.token),
      shareApi: new ShareApi(authState.token),
    }),
    [authState]
  );

  const finishSyncing = () =>
    state.syncing &&
    dispatch({
      type: ActionType.SetSyncing,
      syncing: false,
    });

  const loadHeaders = () => {
    apis.headerApi.GetAll().then((headers) => {
      dispatch({
        type: ActionType.SetHeaders,
        headers,
      });

      finishSyncing();
    });
  };

  const loadHeader = (token: string) => {
    apis.headerApi.Get(token).then((header) => {
      dispatch({ type: ActionType.SetHeader, header });

      finishSyncing();
    });
  };

  const loadItem = (itemId: string) => {
    apis.itemApi
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
    const index = !token
      ? -1
      : findIndex(state.headers, (h) => h.id == token || h.token == token);

    return index >= 0 ? state.headers[index] : null;
  }, [token, state.headers, state.expanded]);

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
    [authState?.token, state.expanded, state.headers, activeHeader]
  );

  const displayListeners = React.useMemo<Listeners>(
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
              apis.itemApi
                .Relocate(activeId, overId, parentId)
                .then(() => loadHeader(activeHeader.id)),
            onSaveDescription: (id: string, description: string) =>
              apis.itemApi
                .Put(id, {
                  ...activeHeader.items.find((i) => i.id == id),
                  description,
                })
                .then(() => loadItem(id)),
            onSaveLabel: (id: string, label: string) =>
              apis.itemApi
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
          </Container>
        </div>
        <div className={`list-view${!!activeHeader ? ' show' : ''}`}>
          <Container className="list-container">
            {displayHeader && (
              <>
                <SelectedHeader
                  header={displayHeader}
                  listeners={displayListeners}
                  onBack={() => navigate('/')}
                />
                <SortableTree
                  collapsible
                  indicator
                  removable
                  defaultItems={Temp.buildTreeFromItems(
                    displayHeader.items,
                    state.expanded
                  )}
                  listeners={displayListeners}
                />
              </>
            )}
          </Container>
        </div>
      </main>
    </Router>
  );
};
