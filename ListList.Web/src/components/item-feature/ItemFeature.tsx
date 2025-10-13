import React from 'react';
import { ActionDropdown, IconButton, LabelAndDescriptionEditor } from '..';
import { ApiHeaderPatch } from '../../contracts';
import { SortableTreeHooks } from '../tree/SortableTree';
import { Featured } from '../../views/app/App';

export interface ItemFeatureProps {
  node: Featured;
  hooks?: SortableTreeHooks;
  onBack?: () => void;
  onShare?: () => void;
  onPatch?: (patch: ApiHeaderPatch) => void;
}

export const ItemFeature: React.FC<ItemFeatureProps> = (props) => {
  const headerActions = React.useMemo(
    () =>
      !Boolean(props.node) || props.node.readonly ? (
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
            actionGroups={props.hooks?.actions?.({
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
    [props.node]
  );

  return (
    <div className="selected-header">
      <div className="content">
        <LabelAndDescriptionEditor
          name={props.node?.id ?? 'no-header-selected'}
          label={props.node?.label ?? ''}
          description={props.node?.description ?? ''}
          disabled={!Boolean(props.node)}
          onUpdate={(update) => props.hooks?.onUpdate(props.node.id, update)}
        />
      </div>
      <div className="actions">{headerActions}</div>
    </div>
  );
};
