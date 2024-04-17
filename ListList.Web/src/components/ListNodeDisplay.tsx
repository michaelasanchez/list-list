import { countBy, isNil, map } from 'lodash';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { LabelEditor, ListNodeCreation, MemoizedIcon } from '.';
import { ListItemCreation } from '../contracts';
import { ListNode } from '../models';
import { NodeRequest } from '../shared';
import { NodePath, RequestPayload } from '../views';
import { AppStateAction, AppStateActionType } from '../views/app';
import React = require('react');

interface ListNodeDisplayProps {
  node: ListNode;
  path: NodePath;
  className?: string;
  dispatchAction: (action: AppStateAction) => void;
  dispatchRequest: (payload: RequestPayload) => void;
}

interface ListNodeViewModel {
  pendingLabel?: string;
  pendingNode?: ListItemCreation;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [viewModel, setViewModel] = useState<ListNodeViewModel>({});

  const handleCompleteNode = () => {
    props.dispatchRequest({
      type: NodeRequest.Complete,
      path: props.path,
    });
  };

  const handleCreateNode = () => {
    if (viewModel.pendingNode?.label?.length > 0) {
      props.dispatchRequest({
        type: NodeRequest.Create,
        path: props.path,
        creation: viewModel.pendingNode,
      });

      setViewModel({});
    }
  };

  const handleDeleteNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.dispatchRequest({ type: NodeRequest.Delete, path: props.path });
  };

  const handleToggleNode = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button === 0)
      props.dispatchAction({
        type: AppStateActionType.ToggleNode,
        path: props.path,
      });
  };

  const handleUpdateNode = () => {
    if (viewModel.pendingLabel != props.node.label) {
      props.dispatchRequest({
        type: NodeRequest.Update,
        path: props.path,
        label: viewModel.pendingLabel,
      });
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
            onChange={handleCompleteNode}
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
              dispatchAction={props.dispatchAction}
              dispatchRequest={props.dispatchRequest}
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
