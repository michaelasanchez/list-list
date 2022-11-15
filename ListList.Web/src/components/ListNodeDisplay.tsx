import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { map } from 'lodash';
import { Button, Form } from 'react-bootstrap';
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
        <span>
          {props.path.length > 0 && (
            <Form.Check checked={props.node?.complete} />
          )}
          <h5>{props.node?.label}</h5>
        </span>
        <span>
          <Button
            size="sm"
            variant="outline-danger"
            disabled={props.node?.children.length > 0}
            onClick={() => props.invoke(props.path, 'delete')}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline-success"
            onClick={() => props.invoke(props.path, 'create-init')}
          >
            Create
          </Button>
          <Button
            variant="none"
            disabled={!(props.node?.children.length > 0)}
            onClick={() => props.invoke(props.path, 'toggle')}
          >
            {props.node?.children.length > 0 && (
              <FontAwesomeIcon
                icon={props.node?.expanded ? faChevronDown : faChevronUp}
              />
            )}
          </Button>
        </span>
      </div>
      {props.node?.description}
      {props.node?.expanded && (
        <div className="node-children">
          {map(props.node?.children, (item, i) => (
            <ListNodeDisplay
              key={i}
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
