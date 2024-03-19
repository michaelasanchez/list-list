import { filter, map } from 'lodash';
import * as React from 'react';
import { Container } from 'react-bootstrap';
import { ListNodeDisplay } from '../components';
import { ListItemCreation } from '../contracts';
import { useAuth, useLocalStorage } from '../hooks';
import { ListItemMapper } from '../mappers';
import { ListHeader, ListNode } from '../models';
import { ListItemApi } from '../network';
import { config } from '../shared';
import { Navbar } from './Navbar';

const getItem = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getItem(node.children[first], path);
};

interface AppProps {}

export type NodePath = number[];

interface AppViewModel {
  expanded: string[];
  parentId?: string;
  creation?: ListItemCreation;
}

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth(config.clientId);

  const localStorage = useLocalStorage('expanded');

  const [listHeaders, setHeaders] = React.useState<ListHeader[]>();

  const [viewModel, setViewModel] = React.useState<AppViewModel>({
    expanded: localStorage.exists() ? JSON.parse(localStorage.fetch()) : [],
  });

  React.useEffect(() => {
    if (authState.authenticated) {
      loadNodeHeaders(viewModel.expanded);
    } else {
      setHeaders([]);
    }
  }, [authState.authenticated]);

  const loadNodeHeaders = (expanded?: string[]) => {
    new ListItemApi(authState.token)
      .GetHeaders()
      .then((resp) => setHeaders(ListItemMapper.mapHeaders(resp, expanded)));
  };

  const handleNodeAction = React.useCallback(
    (path: NodePath, action: string, payload?: any) => {
      const headerIndex = path.shift();
      const targetNode = getItem(listHeaders[headerIndex].root, path);

      switch (action) {
        case 'complete': {
          handleCompleteNode(targetNode.id);
          break;
        }
        case 'create-save': {
          handleCreateNode(payload, targetNode.id);
          break;
        }
        case 'delete': {
          handleDeleteNode(targetNode.id);
          break;
        }
        case 'toggle': {
          targetNode.expanded = !targetNode.expanded;

          const expanded = targetNode.expanded
            ? [...viewModel.expanded, targetNode.id]
            : filter(viewModel.expanded, targetNode.id);

          localStorage.commit(JSON.stringify(expanded));
          setViewModel((vm) => ({
            ...vm,
            expanded,
          }));
          setHeaders((headers) => ({ ...headers }));
          break;
        }
        case 'update-save': {
          handlePutNode(targetNode, payload);
          break;
        }
      }
    },
    [viewModel, listHeaders]
  );

  const handleCompleteNode = (listItemId: string) => {
    new ListItemApi(authState.token).CompleteItem(listItemId).then(() => {
      loadNodeHeaders(viewModel.expanded);
    });
  };

  const handleCreateNode = (listItem: ListItemCreation, parentId: string) => {
    new ListItemApi(authState.token).CreateItem(listItem, parentId).then(() => {
      setViewModel((vm) => ({ ...vm, showModal: false }));
      loadNodeHeaders(viewModel.expanded);
    });
  };

  const handleDeleteNode = (listItemId: string) => {
    new ListItemApi(authState.token)
      .DeleteItem(listItemId)
      .then(() => loadNodeHeaders(viewModel.expanded));
  };

  const handlePutNode = (current: ListNode, updatedLabel: string) => {
    const listItemPut = {
      label: updatedLabel,
      description: current.description,
    };

    new ListItemApi(authState.token)
      .PutItem(current.id, listItemPut)
      .then(() => loadNodeHeaders(viewModel.expanded));
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
              invoke={handleNodeAction}
            />
          ))}
        </Container>
      </main>
    </>
  );
};
