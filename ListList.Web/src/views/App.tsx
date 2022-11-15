import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ListNodeDisplay } from '../components';
import { CreateListItemForm, ModalState } from '../components/forms';
import { ListItemCreation } from '../contracts/put/ListItemCreation';
import { useAuth } from '../hooks';
import { ListItemMapper } from '../mappers';
import { ListHeader } from '../models/ListHeader';
import { ListNode } from '../models/ListNode';
import { ListItemApi } from '../network';
import { Navbar } from './Navbar';

interface AppProps {}

export type NodePath = number[];

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth();

  const [listHeaders, setHeaders] = React.useState<ListHeader[]>();

  const [modalState, setModalState] = React.useState<ModalState>({
    show: false,
  });

  React.useEffect(() => {
    if (!!authState.user) {
      loadUserNode();
    }
  }, [authState.user]);

  const loadUserNode = () => {
    new ListItemApi(authState.user.tokenId)
      .GetHeaders()
      .then((resp) => setHeaders(ListItemMapper.mapHeaders(resp)));
  };

  const handleNodeAction = (path: NodePath, action: string) => {
    const targetNode = getItem(listHeaders[0].nodes, path);
    switch (action) {
      case 'toggle': {
        targetNode.expanded = !targetNode.expanded;
        setHeaders({ ...listHeaders });
        break;
      }
      case 'create-init': {
        setModalState({
          show: true,
          creation: { label: '', description: '', complete: false },
          parentId: targetNode.id,
        });
        break;
      }
      case 'delete': {
        handleDeleteNode(targetNode.id);
        break;
      }
    }
  };

  const handleCreateNode = (listItem: ListItemCreation, parentId: string) => {
    new ListItemApi(authState.user.tokenId)
      .CreateItem(listItem, parentId)
      .then(() => {
        setModalState({ show: false });
        loadUserNode();
      });
  };

  const handleDeleteNode = (listItemId: string) => {
    new ListItemApi(authState.user.tokenId)
      .DeleteItem(listItemId)
      .then(() => loadUserNode());
  };

  return (
    <>
      <Navbar authState={authState} />
      <main>
        {listHeaders && (
          <ListNodeDisplay
            path={[]}
            node={listHeaders[0].nodes}
            invoke={handleNodeAction}
          />
        )}
      </main>
      <Modal show={modalState.show}>
        <Modal.Header closeButton>
          <Modal.Title>Create Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateListItemForm
            creation={modalState.creation}
            onUpdate={(update: Partial<ListItemCreation>) =>
              setModalState({
                ...modalState,
                creation: { ...modalState.creation, ...update },
              })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setModalState({ show: false })}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              handleCreateNode(modalState.creation, modalState.parentId)
            }
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const getItem = (node: ListNode, path: NodePath): ListNode => {
  if (!path?.length) return node;
  const first = path.shift();
  return getItem(node.children[first], path);
};
