import React from 'react';
import { ListItemCreation } from '../contracts';
import { Icon } from './icon/Icon';
import { LabelEditor } from './LabelEditor';

export interface ListNodeCreationProps {
  node: ListItemCreation;
  placeholder?: string;
  onCancel: () => void;
  onSave: () => void;
  onUpdate: (update: ListItemCreation) => void;
}

export const ListNodeCreation: React.FC<ListNodeCreationProps> = (props) => {
  return (
    <div className="list-node pending">
      <div className="node-header">
        <div className="node-left">
          <Icon type="create" />
        </div>
        <div className="node-title">
          <span className="heading">
            <LabelEditor
              name="new-item"
              label={props.node?.label}
              placeholder={props.placeholder || 'New Item'}
              onCancel={props.onCancel}
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
