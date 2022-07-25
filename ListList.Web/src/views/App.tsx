import { map } from 'lodash';
import * as React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ListNodeDisplay } from '../components';
import { useAuth } from '../hooks';
import { ListItemMapper } from '../mappers';
import { ListItemCreation } from '../models/contracts/ListItemCreation';
import { ListNode } from '../models/ListNode';
import { ListItemApi } from '../network';
import { Navbar } from './Navbar';

interface AppProps {}

export type NodePath = number[];

interface ModalState {
  show: boolean;
  creation?: ListItemCreation;
  parentId?: string;
}

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth();

  const [userNode, setUserNode] = React.useState<ListNode>();
  
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
      .Get()
      .then((resp) => setUserNode(ListItemMapper.mapToNode(resp)));
  };

  const handleNodeAction = (path: NodePath, action: string) => {
    const targetNode = getItem(userNode, path);
    switch (action) {
      case 'toggle': {
        targetNode.expanded = !targetNode.expanded;
        setUserNode({ ...userNode });
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
        {map(userNode?.children, (item, i) => (
          <ListNodeDisplay
            key={i}
            path={[i]}
            node={item}
            invoke={handleNodeAction}
          />
        ))}
      </main>
      <Modal show={modalState.show}>
        <Modal.Header closeButton>
          <Modal.Title>Create Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Label</Form.Label>
          <Form.Control
            type="text"
            value={modalState.creation?.label || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setModalState({
                ...modalState,
                creation: {
                  ...modalState.creation,
                  label: e.target.value,
                },
              })
            }
          ></Form.Control>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={modalState.creation?.description || ''}
            onChange={(e) =>
              setModalState({
                ...modalState,
                creation: {
                  ...modalState.creation,
                  description: e.target.value,
                },
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
