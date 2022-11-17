import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { countBy, map } from 'lodash';
import { Button, Form } from 'react-bootstrap';
import { Icon, MemoizedIcon } from '.';
import { ListNode } from '../models';
import { NodePath } from '../views';
import React = require('react');

interface ListNodeDisplayProps {
  node: ListNode;
  path: NodePath;
  invoke?: (path: NodePath, action: string) => void;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  return (
    <div className={`list-node${hasChildren ? ' parent' : ''}`}>
      {props.path.length > 0 && (
        <div className="node-check">
          <Form.Check
            checked={props.node.complete}
            onChange={() => props.invoke(props.path, 'complete')}
          />
        </div>
      )}
      <div className="node-content">
        <div className="node-heading">
          <span>
            <h5>
              {props.node.label}
              {hasChildren && (
                <span className="completed">
                  (
                  {countBy(props.node.children, (n) => n.complete)['true'] ?? 0}
                  /{props.node.children.length})
                </span>
              )}
            </h5>
          </span>
          <span>
            <Button
              size="sm"
              variant="outline-danger"
              disabled={props.node.children.length > 0}
              onClick={() => props.invoke(props.path, 'delete')}
            >
              <MemoizedIcon type="remove" />
            </Button>
            <Button
              size="sm"
              variant="outline-success"
              onClick={() => props.invoke(props.path, 'create-init')}
            >
              <MemoizedIcon type="create" />
            </Button>
            {hasChildren && (
              <Button
                variant="none"
                onClick={() => props.invoke(props.path, 'toggle')}
              >
                {props.node.children.length > 0 && (
                  <FontAwesomeIcon
                    icon={props.node.expanded ? faChevronDown : faChevronUp}
                  />
                )}
              </Button>
            )}
          </span>
        </div>
        {props.node.description && <p>{props.node.description}</p>}
        {props.node.expanded && (
          <div className="node-children">
            {map(props.node.children, (item, i) => (
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
    </div>
  );
};
