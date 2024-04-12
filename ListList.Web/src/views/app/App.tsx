import { filter, map } from 'lodash';
import * as React from 'react';
import { Container } from 'react-bootstrap';
import { ListNodeCreation, ListNodeDisplay } from '../../components';
import { ListItemCreation } from '../../contracts';
import { useAuth, useLocalStorage } from '../../hooks';
import { ListItemMapper } from '../../mappers';
import { ListHeader, ListNode } from '../../models';
import { ListHeaderApi, ListItemApi } from '../../network';
import { config, NodeRequest } from '../../shared';
import { Navbar } from '../Navbar';
import { AppState } from './AppState';

const getNode = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getNode(node.children[first], path);
};

interface AppProps {}

export type NodePath = number[];

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth(config.clientId);

  console.log('AUTH', authState);

  const localStorage = useLocalStorage('expanded');

  const [listHeaders, setHeaders] = React.useState<ListHeader[]>();

  const [appState, setAppState] = React.useState<AppState>({
    expanded: localStorage.exists() ? JSON.parse(localStorage.fetch()) : [],
  });

  React.useEffect(() => {
    if (authState.authenticated) {
      loadNodeHeaders(appState.expanded);
    } else {
      setHeaders([]);
    }
  }, [authState.authenticated]);

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
            ? [...appState.expanded, targetNode.id]
            : filter(appState.expanded, (n) => n != targetNode.id);

          localStorage.commit(JSON.stringify(expanded));

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
    [appState, listHeaders]
  );

  const handleCompleteNode = (listItemId: string) => {
    new ListItemApi(authState.token).CompleteItem(listItemId).then(() => {
      loadNodeHeaders(appState.expanded);
    });
  };

  const handleCreateHeader = (listItem: ListItemCreation) => {
    new ListHeaderApi(authState.token).Create(listItem).then((id: string) => {
      setAppState((vm) => {
        const { listHeaderCreation, ...rest } = vm;
        return rest;
      });
      loadNodeHeaders(appState.expanded);
    });
  };

  const handleCreateNode = (listItem: ListItemCreation, parentId: string) => {
    new ListItemApi(authState.token).Create(listItem, parentId).then(() => {
      loadNodeHeaders(appState.expanded);
    });
  };

  const handleDeleteNode = (listItemId: string) => {
    new ListItemApi(authState.token)
      .Delete(listItemId)
      .then(() => loadNodeHeaders(appState.expanded));
  };

  const handlePutNode = (current: ListNode, updatedLabel: string) => {
    const listItemPut = {
      label: updatedLabel,
      description: current.description,
    };

    new ListItemApi(authState.token)
      .Put(current.id, listItemPut)
      .then(() => loadNodeHeaders(appState.expanded));
  };

  return (
    <>
      <Navbar authState={authState} />
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
          <ListNodeCreation
            node={appState.listHeaderCreation}
            placeholder="New List"
            onCancel={() =>
              setAppState((vm) => {
                const { listHeaderCreation, ...rest } = vm;
                return rest;
              })
            }
            onSave={() => handleCreateHeader(appState.listHeaderCreation)}
            onUpdate={(creation: ListItemCreation) =>
              setAppState((vm) => ({ ...vm, listHeaderCreation: creation }))
            }
          />
        </Container>
      </main>
    </>
  );
};
