import { countBy, isNil, map } from 'lodash';
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
  className?: string;
  invoke?: (path: NodePath, action: string, payload?: any) => void;
}

interface ListNodeViewModel {
  pendingLabel?: string;
  pendingNode?: ListItemCreation;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [viewModel, setViewModel] = useState<ListNodeViewModel>({});

  const handleToggleNode = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button === 0) props.invoke(props.path, 'toggle');
  };

  const handleCreateNode = () => {
    if (viewModel.pendingNode?.label?.length > 0) {
      props.invoke(props.path, 'create-save', viewModel.pendingNode);
      setViewModel({});
    }
  };

  const handleDeleteNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.invoke(props.path, 'delete');
  };

  const handleUpdateNode = () => {
    if (viewModel.pendingLabel != props.node.label) {
      props.invoke(props.path, 'update-save', viewModel.pendingLabel);
      setViewModel({ ...viewModel, pendingLabel: null });
    }
  };

  return (
    <div
      className={`list-node${props.className ? ` ${props.className}` : ''}${
        hasChildren ? ' parent' : ''
      }`}
    >
      <div className="node-header" onClick={handleToggleNode}>
        <div className="node-control">
          <Form.Check
            className="node-check"
            checked={props.node.complete}
            onClick={(e) => e.stopPropagation()}
            onChange={() => props.invoke(props.path, 'complete')}
          />
        </div>
        <div className="node-title">
          <span className="heading">
            <LabelEditor
              label={
                isNil(viewModel?.pendingLabel)
                  ? props.node.label
                  : viewModel.pendingLabel
              }
              onFocus={() =>
                setViewModel({ ...viewModel, pendingLabel: props.node.label })
              }
              onBlur={handleUpdateNode}
              onChange={(update: string) =>
                setViewModel({ ...viewModel, pendingLabel: update })
              }
            />
          </span>
          {hasChildren && (
            <span className="completed">
              ({countBy(props.node.children, (n) => n.complete)['true'] ?? 0}/
              {props.node.children.length})
            </span>
          )}
          <div>
            {!hasChildren && (
              <Button
                size="sm"
                variant="outline-danger"
                disabled={props.node.children.length > 0}
                onClick={handleDeleteNode}
              >
                <MemoizedIcon type="remove" />
              </Button>
            )}
            {hasChildren && (
              <Button variant="none">
                {props.node.children.length > 0 && (
                  <MemoizedIcon
                    type={props.node.expanded ? 'expanded' : 'collapsed'}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      {props.node.expanded && (
        <div className="node-body">
          {props.node.description && <p>{props.node.description}</p>}
          {map(props.node.children, (item, i) => (
            <ListNodeDisplay
              key={i}
              node={item}
              path={[...props.path, i]}
              invoke={props.invoke}
            />
          ))}
          <ListNodeCreation
            node={viewModel.pendingNode}
            onUpdate={(node) =>
              setViewModel((vm) => ({ ...vm, pendingNode: node }))
            }
            onSave={handleCreateNode}
          />
        </div>
      )}
    </div>
  );
};
