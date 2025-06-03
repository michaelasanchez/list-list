import { countBy, map } from 'lodash';
import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  Icon,
  LabelAndDescriptionEditor,
  ListNodeCreation,
  MemoizedIcon,
} from '.';
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
  editing: boolean;
  disableToggle?: boolean;
  itemCreation?: ListItemCreation;
}

export const ListNodeDisplay: React.FC<ListNodeDisplayProps> = (props) => {
  const hasChildren = props.node.children?.length > 0;

  const [state, setState] = useState<ListNodeState>({ editing: false });

  // Disable toggling for 100ms after editing was true
  useEffect(() => {
    let timeoutId: NodeJS.Timeout = null;

    if (state.editing) {
      setState((s) => ({ ...s, disableToggle: true }));
    } else {
      timeoutId = setTimeout(
        () => setState((s) => ({ ...s, disableToggle: false })),
        100
      );
    }

    return () => !!timeoutId && clearTimeout(timeoutId);
  }, [state.editing]);

  const handleCompleteNode = () => {
    new ListItemApi(props.token)
      .Complete(props.node.id)
      .then(() => props.reloadHeader());
  };

  const handleCreateNode = () => {
    if (state.itemCreation?.label?.trim().length > 0) {
      const nodeCreation = {
        ...state.itemCreation,
        label: state.itemCreation.label.trim(),
      };

      new ListItemApi(props.token)
        .Create(nodeCreation, props.node.id)
        .then(() => {
          setState((s) => {
            const { itemCreation: pendingNode, ...rest } = s;
            return rest;
          });
          props.reloadHeader();
        });
    } else {
      setState((s) => {
        const { itemCreation: pendingNode, ...rest } = s;
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

  const handleUpdateLabel = (pendingLabel: string) => {
    if (pendingLabel != props.node.label) {
      const listItemPut = {
        label: pendingLabel,
        description: props.node.description,
      };

      new ListItemApi(props.token)
        .Put(props.node.id, listItemPut)
        .then(() => props.reloadHeader());
    }
  };

  const handleUpdateDescription = (pendingDescription: string) => {
    if (pendingDescription != props.node.description) {
      const listItemPut = {
        label: props.node.label,
        description: pendingDescription,
      };

      new ListItemApi(props.token)
        .Put(props.node.id, listItemPut)
        .then(() => props.reloadHeader());
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
          <Button className="grip" variant="none">
            <Icon type="grip" />
          </Button>
          <Form.Check
            className="node-check"
            checked={props.node.complete}
            onClick={(e) => e.stopPropagation()}
            onChange={handleCompleteNode}
          />
        </div>
        <div className="node-title">
          <div className="heading">
            <LabelAndDescriptionEditor
              label={props.node.label}
              description={props.node.description}
              onEditingChange={(editing: boolean) =>
                setState((s) => ({ ...s, editing }))
              }
              onSaveLabel={handleUpdateLabel}
              onSaveDescription={handleUpdateDescription}
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
          {!hasChildren && !props.node.expanded ? (
            <Button
              className="delete`"
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
