import { map } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { ListNodeCreation, ListNodeDisplay } from '../../components';
import { ListItemCreation } from '../../contracts';
import {
  LocalStorageState,
  useAuth,
  useLocalStorage,
  useTheme,
} from '../../hooks';
import { ListItemMapper } from '../../mappers';
import { ListHeaderApi } from '../../network';
import { config } from '../../shared';
import { Navbar } from '../Navbar';

export type NodePath = number[];

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
        loadNodeHeaders(state.expanded);
      } else {
        dispatch({ type: ActionType.SetHeaders, headers: [] });
        dispatch({ type: ActionType.SetSyncing, syncing: false });
      }
    }
  }, [authState.initialized, authState.authenticated]);

  const loadNodeHeaders = (expanded?: string[]) => {
    new ListHeaderApi(authState.token).Get().then((resp) => {
      dispatch({
        type: ActionType.SetHeaders,
        headers: ListItemMapper.mapHeaders(resp, expanded),
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
    new ListHeaderApi(authState.token).GetById(headerId).then((resp) => {
      const header = ListItemMapper.mapHeader(resp, expanded);

      dispatch({ type: ActionType.SetHeader, header });
    });
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
          loadNodeHeaders(state.expanded);
        });
    } else {
      dispatch({ type: ActionType.CancelHeaderCreate });
    }
  };

  return (
    <>
      <Navbar
        theme={themeState.current}
        authState={authState}
        syncing={state.syncing}
        onSetTheme={themeState.setTheme}
      />
      <main>
        <Container>
          {map(state.headers, (h, i) => (
            <ListNodeDisplay
              key={i}
              token={authState.token}
              path={[i]}
              node={h.root}
              className="root"
              dispatchAction={dispatch}
              reloadHeader={() => loadHeader(h.id, state.expanded)}
            />
          ))}
          {authState.authenticated && (
            <ListNodeCreation
              node={(state as AppState).headerCreation}
              placeholder="New List"
              onCancel={() => dispatch({ type: ActionType.CancelNodeDelete })}
              onSave={() => handleCreateHeader(state.headerCreation)}
              onUpdate={(creation: ListItemCreation) =>
                dispatch({ type: ActionType.UpdateHeaderCreation, creation })
              }
            />
          )}
        </Container>
      </main>
    </>
  );
};
