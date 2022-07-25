import { map } from 'lodash';
import { ListNode } from '../models';
import { NodePath } from '../views';
import React = require('react');

interface ListNodeDisplayProps {
  node: ListNode;
  path: NodePath;
  invoke?: (path: NodePath, action: string) => void;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  return (
    <div className="list-node">
      <div className="node-heading">
        <h4>{props.node?.label}</h4>
        <span>
          <button
            disabled={(props?.node.children.length > 0)}
            onClick={() => props.invoke(props.path, 'delete')}
          >
            Delete
          </button>
          <button onClick={() => props.invoke(props.path, 'create-init')}>
            Create
          </button>
          <button
            disabled={!(props?.node.children.length > 0)}
            onClick={() => props.invoke(props.path, 'toggle')}
          >
            {props.node.expanded ? '-' : '+'}
          </button>
        </span>
      </div>
      {props.node?.expanded && (
        <div className="node-children">
          {map(props.node?.children, (item, i) => (
            <ListNodeDisplay
              node={item}
              path={[...props.path, i]}
              invoke={props.invoke}
            />
          ))}
        </div>
      )}
    </div>
  );
};
