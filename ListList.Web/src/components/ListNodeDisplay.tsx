import { countBy, map } from 'lodash';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { LabelEditor, ListNodeCreation, MemoizedIcon } from '.';
import { ListItemCreation } from '../contracts';
import { ListNode } from '../models';
import { NodePath } from '../views';
import React = require('react');

interface ListNodeDisplayProps {
  node: ListNode;
  path: NodePath;
  invoke?: (path: NodePath, action: string, payload?: any) => void;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [pendingNode, setPendingNode] = useState<ListItemCreation>();

  const handleSaveNode = () => {
    if (!!pendingNode) {
      props.invoke(props.path, 'create-save', pendingNode);
      setPendingNode(null);
    }
  };

  console.log('PENDING', pendingNode);

  return (
    <div className={`list-node${hasChildren ? ' parent' : ''}`}>
      {props.path.length > 0 && (
        <Form.Check
          className="node-check"
          checked={props.node.complete}
          onChange={() => props.invoke(props.path, 'complete')}
        />
      )}
      <div className="node-content">
        <div className="node-heading">
          <span>
            <h5>
              <LabelEditor label={props.node.label} />
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
              <MemoizedIcon type="createOutline" />
            </Button>
            {hasChildren && (
              <Button
                variant="none"
                onClick={() => props.invoke(props.path, 'toggle')}
              >
                {props.node.children.length > 0 && (
                  <MemoizedIcon
                    type={props.node.expanded ? 'expanded' : 'collapsed'}
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
            <ListNodeCreation
              node={pendingNode}
              onUpdate={setPendingNode}
              onSave={handleSaveNode}
            />
          </div>
        )}
      </div>
    </div>
  );
};
