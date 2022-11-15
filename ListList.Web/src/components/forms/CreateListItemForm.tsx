import React = require('react');
import { Form } from 'react-bootstrap';
import { ListItemCreation } from '../../contracts';

export interface CreateListItemFormProps {
  creation: ListItemCreation;
  onUpdate: (update: Partial<ListItemCreation>) => void;
}

export interface ModalState {
  show: boolean;
  creation?: ListItemCreation;
  parentId?: string;
}

export const CreateListItemForm: React.FC<CreateListItemFormProps> = (
  props
) => {
  return (
    <Form>
      <Form.Label>Label</Form.Label>
      <Form.Control
        type="text"
        value={props.creation?.label || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          props.onUpdate({
            label: e.target.value,
          })
        }
      ></Form.Control>
      <Form.Label>Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        value={props.creation?.description || ''}
        onChange={(e) =>
          props.onUpdate({
            description: e.target.value,
          })
        }
      />
    </Form>
  );
};
