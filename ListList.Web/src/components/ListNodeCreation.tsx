import React = require('react');
import { Button } from 'react-bootstrap';
import { ListItemCreation } from '../contracts';
import { NodePath } from '../views';
import { Icon } from './Icon';
import { LabelEditor } from './LabelEditor';

export interface ListNodeCreationProps {
  node: ListItemCreation;
  onSave?: () => void;
  onUpdate?: (update: ListItemCreation) => void;
}

export const ListNodeCreation: React.FC<ListNodeCreationProps> = (props) => {
  return (
    <div className="list-node pending">
      <div className="node-check">
        <Button variant="none">
          <Icon type="create" />
        </Button>
      </div>
      <div className="node-content">
        <div className="node-heading">
          <span>
            <h5>
              <LabelEditor
                label={props.node?.label || 'List Item'}
                onChange={(updatedLabel) =>
                  props.onUpdate({ ...props.node, label: updatedLabel })
                }
                onBlur={props.onSave}
              />
            </h5>
          </span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
