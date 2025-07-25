import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ApiListItemCreation } from '../../contracts';
import { CreateListItemForm } from '../form';

export interface CreateListItemModalProps {
  show: boolean;
  creation?: ApiListItemCreation;
  parentId?: string;
  onClose: () => void;
  onUpdate: (update: Partial<ApiListItemCreation>) => void;
  handleCreateNode: (creation: ApiListItemCreation, parentId: string) => void;
}

export const CreateListItemModal: React.FC<CreateListItemModalProps> = (
  props
) => {
  return (
    <Modal show={props.show}>
      <Modal.Header closeButton>
        <Modal.Title>Create Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateListItemForm
          creation={props.creation}
          onUpdate={props.onUpdate}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => props.handleCreateNode(props.creation, props.parentId)}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
