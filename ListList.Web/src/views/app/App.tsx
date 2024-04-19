import { map } from 'lodash';
import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { AppStateActionType as ActionType, AppState, AppStateReducer } from '.';
import { ListNodeCreation, ListNodeDisplay } from '../../components';
import { ListItemCreation } from '../../contracts';
import { LocalStorageState, useAuth, useLocalStorage } from '../../hooks';
import { ListItemMapper } from '../../mappers';
import { ListNode } from '../../models';
import { ListHeaderApi } from '../../network';
import { AppTheme, config } from '../../shared';
import { Navbar } from '../Navbar';

export type NodePath = number[];

const getDefaultAppState = (localStorage: LocalStorageState): AppState => {
  const defaultState = localStorage.exists()
    ? JSON.parse(localStorage.fetch())
    : {
        theme:
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? AppTheme.Dark
            : AppTheme.Light,
      };

  return {
    expanded: defaultState.expanded ?? [],
    theme: defaultState.theme,
  };
};

export const getNode = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getNode(node.children[first], path);
};

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);

  const localStorageState = useLocalStorage('list-list');

  const [state, dispatch] = useReducer(
    AppStateReducer,
    getDefaultAppState(localStorageState)
  );

  // Keep local storage up-to-date
  useEffect(() => {
    localStorageState.commit(
      JSON.stringify({ expanded: state.expanded, theme: state.theme })
    );
  }, [state.expanded, state.theme]);

  // Set theme attribute
  useEffect(() => {
    const htmlTag = document.getElementsByTagName('html');

    htmlTag[0].setAttribute(
      'data-bs-theme',
      state.theme == AppTheme.Light ? 'light' : 'dark'
    );
  }, [state.theme]);

  // Load/unload list headers
  useEffect(() => {
    if (authState.authenticated) {
      loadNodeHeaders(state.expanded);
    } else {
      dispatch({ type: ActionType.SetHeaders, headers: [] });
    }
  }, [authState.authenticated]);

  const loadNodeHeaders = (expanded?: string[]) => {
    new ListHeaderApi(authState.token).Get().then((resp) =>
      dispatch({
        type: ActionType.SetHeaders,
        headers: ListItemMapper.mapHeaders(resp, expanded),
      })
    );
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
    new ListHeaderApi(authState.token).Create(listItem).then((id: string) => {
      dispatch({ type: ActionType.FinalizeCreate });
      loadNodeHeaders(state.expanded);
    });
  };

  return (
    <>
      <Navbar
        theme={state.theme}
        authState={authState}
        onToggleTheme={() => dispatch({ type: ActionType.ToggleTheme })}
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
              onCancel={() => dispatch({ type: ActionType.CancelDelete })}
              onSave={() => handleCreateHeader(state.headerCreation)}
              onUpdate={(creation: ListItemCreation) =>
                dispatch({ type: ActionType.UpdateCreation, creation })
              }
            />
          )}
        </Container>
      </main>
    </>
  );
};
