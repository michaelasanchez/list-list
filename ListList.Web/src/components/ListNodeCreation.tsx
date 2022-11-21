import React = require('react');
import { Button } from 'react-bootstrap';
import { ListItemCreation } from '../contracts';
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
      <div className="node-header">
        <div className="node-control">
          <Button variant="none">
            <Icon type="create" />
          </Button>
        </div>
        <div className="node-title">
          <span className="heading">
            <LabelEditor
              label={props.node?.label}
              placeholder="New Item"
              onChange={(updatedLabel) =>
                props.onUpdate({ ...props.node, label: updatedLabel })
              }
              onBlur={props.onSave}
            />
          </span>
        </div>
      </div>
    </div>
  );
};
