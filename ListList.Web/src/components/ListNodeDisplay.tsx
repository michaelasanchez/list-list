import { countBy, isNil, map } from 'lodash';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { LabelEditor, ListNodeCreation, MemoizedIcon } from '.';
import { ListItemCreation } from '../contracts';
import { ListNode } from '../models';
import { ListItemApi } from '../network';
import { NodePath } from '../views';
import { AppStateActionType as ActionType, AppStateAction } from '../views/app';
import React = require('react');

interface ListNodeDisplayProps {
  token: string;
  node: ListNode;
  path: NodePath;
  className?: string;
  dispatchAction: (action: AppStateAction) => void;
  reloadHeader: () => void;
}

interface ListNodeState {
  pendingLabel?: string;
  pendingNode?: ListItemCreation;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [state, setState] = useState<ListNodeState>({});

  const handleCompleteNode = () => {
    new ListItemApi(props.token)
      .Complete(props.node.id)
      .then(() => props.reloadHeader());
  };

  const handleCreateNode = () => {
    console.log(state.pendingNode?.label?.trim().length);
    if (state.pendingNode?.label?.trim().length > 0) {
      const nodeCreation = {
        ...state.pendingNode,
        label: state.pendingNode.label.trim(),
      };

      new ListItemApi(props.token)
        .Create(nodeCreation, props.node.id)
        .then(() => {
          setState({});
          props.reloadHeader();
        });
    } else {
      setState({});
    }
  };

  const handleDeleteNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    new ListItemApi(props.token).Delete(props.node.id).then(() =>
      props.node.isRoot
        ? props.dispatchAction({
            type: ActionType.FinalizeNodeDelete,
            headerId: props.node.headerId,
          })
        : props.reloadHeader()
    );
  };

  const handleToggleNode = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (e.button === 0)
      props.dispatchAction({
        type: ActionType.ToggleNode,
        path: props.path,
      });
  };

  const handleUpdateNode = () => {
    if (state.pendingLabel != props.node.label) {
      const listItemPut = {
        label: state.pendingLabel.trim(),
        description: props.node.description,
      };

      new ListItemApi(props.token).Put(props.node.id, listItemPut).then(() => {
        props.reloadHeader();
        setState({ ...state, pendingLabel: null });
      });
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
                isNil(state?.pendingLabel)
                  ? props.node.label
                  : state.pendingLabel
              }
              onFocus={() =>
                setState({ ...state, pendingLabel: props.node.label })
              }
              onBlur={handleUpdateNode}
              onChange={(update: string) =>
                setState({ ...state, pendingLabel: update })
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
            {!hasChildren && !props.node.expanded ? (
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
                <MemoizedIcon
                  type={props.node.expanded ? 'expanded' : 'collapsed'}
                />
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
              token={props.token}
              node={item}
              path={[...props.path, i]}
              dispatchAction={props.dispatchAction}
              reloadHeader={props.reloadHeader}
            />
          ))}
          <ListNodeCreation
            node={state.pendingNode}
            onCancel={() =>
              setState((vm) => {
                const { pendingNode, ...rest } = vm;
                return rest;
              })
            }
            onUpdate={(node) =>
              setState((vm) => ({ ...vm, pendingNode: node }))
            }
            onSave={handleCreateNode}
          />
        </div>
      )}
    </div>
  );
};
