import { countBy, isNil, map } from 'lodash';
import { useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
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
  editingLabel: boolean;
  editingDescription: boolean;
  disableToggle?: boolean;
  itemCreation?: ListItemCreation;
  pendingLabel?: string;
  pendingDescription?: string;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [state, setState] = useState<ListNodeState>({
    editingLabel: false,
    editingDescription: false,
  });

  const handleCompleteNode = () => {
    new ListItemApi(props.token)
      .Complete(props.node.id)
      .then(() => props.reloadHeader());
  };

  const handleCreateNode = () => {
    console.log(state.itemCreation?.label?.trim().length);
    if (state.itemCreation?.label?.trim().length > 0) {
      const nodeCreation = {
        ...state.itemCreation,
        label: state.itemCreation.label.trim(),
      };

      new ListItemApi(props.token)
        .Create(nodeCreation, props.node.id)
        .then(() => {
          setState((s) => {
            const { pendingLabel, itemCreation: pendingNode, ...rest } = s;
            return rest;
          });
          props.reloadHeader();
        });
    } else {
      setState((s) => {
        const { pendingLabel, itemCreation: pendingNode, ...rest } = s;
        return rest;
      });
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

    if (e.button === 0 && !state.disableToggle) {
      props.dispatchAction({
        type: ActionType.ToggleNode,
        path: props.path,
      });
    }

    setState({ ...state, disableToggle: false });
  };

  const handleUpdateLabel = () => {
    setState((s) => ({ ...s, editingLabel: false, disableToggle: true }));

    setTimeout(() => {
      setState((s) => ({ ...s, disableToggle: false }));
    }, 100);

    if (state.pendingLabel != props.node.label) {
      const listItemPut = {
        label: state.pendingLabel.trim(),
        description: props.node.description,
      };

      new ListItemApi(props.token).Put(props.node.id, listItemPut).then(() => {
        props.reloadHeader();
        setState((s) => ({ ...s, pendingLabel: null }));
      });
    }
  };

  const handleUpdateDescription = () => {
    setState((s) => ({
      ...s,
      editingDescription: false,
      disableToggle: true,
    }));

    setTimeout(() => {
      setState((s) => ({ ...s, disableToggle: false }));
    }, 100);

    if (state.pendingDescription != props.node.description) {
      const listItemPut = {
        label: props.node.label,
        description: state.pendingDescription.trim(),
      };

      new ListItemApi(props.token).Put(props.node.id, listItemPut).then(() => {
        props.reloadHeader();
        setState((s) => ({ ...s, pendingDescription: null }));
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
                setState({
                  ...state,
                  editingLabel: true,
                  pendingLabel: props.node.label,
                })
              }
              onBlur={handleUpdateLabel}
              onChange={(update: string) =>
                setState({ ...state, pendingLabel: update })
              }
            />
            <Collapse
              in={
                !!props.node.description ||
                !!state.pendingDescription ||
                !!state.editingLabel ||
                !!state.editingDescription
              }
            >
              <div>
                <LabelEditor
                  className="description"
                  label={
                    isNil(state.pendingDescription)
                      ? props.node.description
                      : state.pendingDescription
                  }
                  placeholder="Add note"
                  onFocus={() =>
                    setState({ ...state, editingDescription: true })
                  }
                  onBlur={handleUpdateDescription}
                  onChange={(update: string) =>
                    setState({ ...state, pendingDescription: update })
                  }
                />
              </div>
            </Collapse>
          </div>
        </div>
        <div className="node-right">
          {hasChildren && (
            <div className="completed">
              ({countBy(props.node.children, (n) => n.complete)['true'] ?? 0}/
              {props.node.children.length})
            </div>
          )}
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
      {props.node.expanded && (
        <div className="node-body">
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
            node={state.itemCreation}
            onCancel={() =>
              setState((vm) => {
                const { itemCreation: pendingNode, ...rest } = vm;
                return rest;
              })
            }
            onUpdate={(node) =>
              setState((vm) => ({ ...vm, itemCreation: node }))
            }
            onSave={handleCreateNode}
          />
        </div>
      )}
    </div>
  );
};
