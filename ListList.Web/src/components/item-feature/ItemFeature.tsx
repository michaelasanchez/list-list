import React from 'react';
import { ActionDropdown, IconButton, LabelAndDescriptionEditor } from '..';
import { ApiPartitionPatch } from '../../contracts';
import { Partition } from '../../models';
import { SortableTreeActions } from '../tree/SortableTree';

export type Featured = Pick<
  Partition,
  'id' | 'label' | 'description' | 'checklist' | 'readonly' | 'shareLinks'
> | null;

export interface ItemFeatureProps {
  node: Featured;
  hooks?: SortableTreeActions;
  onBack?: () => void;
  onShare?: () => void;
  onPatch?: (patch: ApiPartitionPatch) => void;
}

export const ItemFeature: React.FC<ItemFeatureProps> = (props) => {
  const headerActions = React.useMemo(
    () =>
      !props.node || props.node.readonly ? (
        <></>
      ) : (
        <>
          <IconButton
            iconType="share"
            size="sm"
            variant="outline-secondary"
            onClick={() => props.onShare?.()}
          />
          <ActionDropdown
            size="sm"
            actionGroups={props.hooks?.custom?.({
              id: props.node.id,
              checklist: props.node.checklist,
            })}
          />
          <IconButton
            iconType="backward"
            variant="secondary"
            onClick={() => props.onBack?.()}
          />
        </>
      ),
    [props.node],
  );

  return (
    <div className="selected-header">
      <div className="content">
        <LabelAndDescriptionEditor
          name={props.node?.id ?? 'no-header-selected'}
          label={props.node?.label ?? ''}
          description={props.node?.description ?? ''}
          placeholderDescription="Add note"
          disabled={!Boolean(props.node)}
          onUpdate={(update) =>
            props.hooks?.onUpdate
              ? props.hooks.onUpdate(props.node!.id, update)
              : Promise.resolve(false)
          }
        />
      </div>
      <div className="actions">{headerActions}</div>
    </div>
  );
};
