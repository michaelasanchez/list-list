import { filter, map } from 'lodash';
import * as React from 'react';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { AppState } from '.';
import { ListNodeCreation, ListNodeDisplay } from '../../components';
import { ListItemCreation } from '../../contracts';
import { useAuth, useLocalStorage } from '../../hooks';
import { ListItemMapper } from '../../mappers';
import { ListHeader, ListNode } from '../../models';
import { ListHeaderApi, ListItemApi } from '../../network';
import { AppTheme, config, NodeRequest } from '../../shared';
import { Navbar } from '../Navbar';

export type NodePath = number[];

const getNode = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getNode(node.children[first], path);
};

export const App: React.FC = () => {
  const authState = useAuth(config.clientId);

  const localStorage = useLocalStorage('list-list');

  const [listHeaders, setHeaders] = React.useState<ListHeader[]>();

  const [state, setAppState] = React.useState<AppState>(() => {
    const defaultState = localStorage.exists()
      ? JSON.parse(localStorage.fetch())
      : {};

    return {
      expanded: defaultState.expanded ?? [],
      theme: defaultState.theme ?? AppTheme.Light,
    };
  });

  // Keep local storage up-to-date
  useEffect(() => {
    localStorage.commit(
      JSON.stringify({ expanded: state.expanded, theme: state.theme })
    );
  }, [state.expanded, state.theme]);

  // Load/unload list headers
  useEffect(() => {
    if (authState.authenticated) {
      loadNodeHeaders(state.expanded);
    } else {
      setHeaders([]);
    }
  }, [authState.authenticated]);

  // Set theme attribute
  useEffect(() => {
    const htmlTag = document.getElementsByTagName('html');

    htmlTag[0].setAttribute(
      'data-bs-theme',
      state.theme == AppTheme.Light ? 'light' : 'dark'
    );
  }, [state.theme]);

  const loadNodeHeaders = (expanded?: string[]) => {
    new ListHeaderApi(authState.token)
      .Get()
      .then((resp) => setHeaders(ListItemMapper.mapHeaders(resp, expanded)));
  };

  const handleNodeRequest = React.useCallback(
    (path: NodePath, request: NodeRequest, payload?: any) => {
      const headerIndex = path.shift();
      const targetNode = getNode(listHeaders[headerIndex].root, path);

      switch (request) {
        case NodeRequest.Complete: {
          handleCompleteNode(targetNode.id);
          break;
        }
        case NodeRequest.Create: {
          handleCreateNode(payload, targetNode.id);
          break;
        }
        case NodeRequest.Delete: {
          handleDeleteNode(targetNode.id);
          break;
        }
        case NodeRequest.Toggle: {
          targetNode.expanded = !targetNode.expanded;

          const expanded = targetNode.expanded
            ? [...state.expanded, targetNode.id]
            : filter(state.expanded, (n) => n != targetNode.id);

          setAppState((vm) => ({
            ...vm,
            expanded,
          }));

          setHeaders((headers) => ({ ...headers }));
          break;
        }
        case NodeRequest.Update: {
          handlePutNode(targetNode, payload);
          break;
        }
      }
    },
    [state, listHeaders]
  );

  const handleCompleteNode = (listItemId: string) => {
    new ListItemApi(authState.token).CompleteItem(listItemId).then(() => {
      loadNodeHeaders(state.expanded);
    });
  };

  const handleCreateHeader = (listItem: ListItemCreation) => {
    new ListHeaderApi(authState.token).Create(listItem).then((id: string) => {
      setAppState((vm) => {
        const { listHeaderCreation, ...rest } = vm;
        return rest;
      });
      loadNodeHeaders(state.expanded);
    });
  };

  const handleCreateNode = (listItem: ListItemCreation, parentId: string) => {
    new ListItemApi(authState.token).Create(listItem, parentId).then(() => {
      loadNodeHeaders(state.expanded);
    });
  };

  const handleDeleteNode = (listItemId: string) => {
    new ListItemApi(authState.token)
      .Delete(listItemId)
      .then(() => loadNodeHeaders(state.expanded));
  };

  const handlePutNode = (current: ListNode, updatedLabel: string) => {
    const listItemPut = {
      label: updatedLabel,
      description: current.description,
    };

    new ListItemApi(authState.token)
      .Put(current.id, listItemPut)
      .then(() => loadNodeHeaders(state.expanded));
  };

  return (
    <>
      <Navbar
        theme={state.theme}
        authState={authState}
        onToggleTheme={() =>
          setAppState({
            ...state,
            theme:
              state.theme == AppTheme.Light ? AppTheme.Dark : AppTheme.Light,
          })
        }
      />
      <main>
        <Container>
          {map(listHeaders, (h, i) => (
            <ListNodeDisplay
              key={i}
              path={[i]}
              node={h.root}
              className="root"
              invokeRequest={handleNodeRequest}
            />
          ))}
          {authState.authenticated && (
            <ListNodeCreation
              node={state.listHeaderCreation}
              placeholder="New List"
              onCancel={() =>
                setAppState((vm) => {
                  const { listHeaderCreation, ...rest } = vm;
                  return rest;
                })
              }
              onSave={() => handleCreateHeader(state.listHeaderCreation)}
              onUpdate={(creation: ListItemCreation) =>
                setAppState((vm) => ({ ...vm, listHeaderCreation: creation }))
              }
            />
          )}
        </Container>
      </main>
    </>
  );
};
