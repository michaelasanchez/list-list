import { countBy, isNil, map } from 'lodash';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { LabelEditor, ListNodeCreation, MemoizedIcon } from '.';
import { ListItemCreation } from '../contracts';
import { ListNode } from '../models';
import { NodeRequest } from '../shared';
import { NodePath } from '../views';
import React = require('react');

interface ListNodeDisplayProps {
  node: ListNode;
  path: NodePath;
  className?: string;
  invokeRequest?: (path: NodePath, request: NodeRequest, payload?: any) => void;
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
    if (e.button === 0) props.invokeRequest(props.path, NodeRequest.Toggle);
  };

  const handleCreateNode = () => {
    if (viewModel.pendingNode?.label?.length > 0) {
      props.invokeRequest(
        props.path,
        NodeRequest.Create,
        viewModel.pendingNode
      );
      setViewModel({});
    }
  };

  const handleDeleteNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.invokeRequest(props.path, NodeRequest.Delete);
  };

  const handleUpdateNode = () => {
    if (viewModel.pendingLabel != props.node.label) {
      props.invokeRequest(
        props.path,
        NodeRequest.Update,
        viewModel.pendingLabel
      );
      setViewModel({ ...viewModel, pendingLabel: null });
    }
  };

  return (
    <div
      className={`list-node${props.className ? ` ${props.className}` : ''}${
        props.node.expanded ? ' expanded' : ''
      }${hasChildren ? ' parent' : ''}`}
    >
      <div className="node-header" onClick={handleToggleNode}>
        <div className="node-left">
          <Form.Check
            className="node-check"
            checked={props.node.complete}
            onClick={(e) => e.stopPropagation()}
            onChange={() =>
              props.invokeRequest(props.path, NodeRequest.Complete)
            }
          />
        </div>
        <div className="node-title">
          <div className="heading">
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
          </div>
        </div>
        <div className="node-right">
          {hasChildren && (
            <div className="completed">
              ({countBy(props.node.children, (n) => n.complete)['true'] ?? 0}/
              {props.node.children.length})
            </div>
          )}
          <div>
            {!hasChildren ? (
              <Button
                className="delete"
                size="sm"
                variant="none"
                disabled={hasChildren}
                onClick={handleDeleteNode}
              >
                <MemoizedIcon type="delete" />
              </Button>
            ) : (
              <Button variant="none">
                {hasChildren && (
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
              invokeRequest={props.invokeRequest}
            />
          ))}
          <ListNodeCreation
            node={viewModel.pendingNode}
            onCancel={() =>
              setViewModel((vm) => {
                const { pendingNode, ...rest } = vm;
                return rest;
              })
            }
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
