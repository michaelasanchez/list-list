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
      props.invoke(props.path, 'create-save', viewModel);
      setViewModel({});
    }
  };

  const handleUpdateNode = () => {
    if (viewModel.pendingLabel != props.node.label) {
      console.log('SAVE ME', viewModel.pendingLabel);
      setViewModel({ ...viewModel, pendingLabel: null });
    }
  };

  return (
    <div
      className={`list-node${hasChildren ? ' parent' : ''}`}
      onClick={handleToggleNode}
    >
      {/* <div className="handle" onClick={handleToggleNode}></div> */}
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
            {!hasChildren && (
              <Button
                size="sm"
                variant="outline-danger"
                disabled={props.node.children.length > 0}
                onClick={() => props.invoke(props.path, 'delete')}
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
              node={viewModel.pendingNode}
              onUpdate={(node) =>
                setViewModel((vm) => ({ ...vm, pendingNode: node }))
              }
              onSave={handleCreateNode}
            />
          </div>
        )}
      </div>
    </div>
  );
};
