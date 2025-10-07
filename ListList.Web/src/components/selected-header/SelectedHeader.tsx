import React from 'react';
import { ActionDropdown, IconButton, LabelAndDescriptionEditor } from '..';
import { ApiHeaderPatch } from '../../contracts';
import { SelectedNode } from '../../views/app/App';
import { SortableTreeHooks } from '../tree/SortableTree';

export interface DetailsHeaderProps {
  node: SelectedNode;
  listeners?: SortableTreeHooks;
  onBack?: () => void;
  onShare?: () => void;
  onPatch?: (patch: ApiHeaderPatch) => void;
}

export const DetailsHeader: React.FC<DetailsHeaderProps> = (props) => {
  const headerActions = React.useMemo(
    () =>
      !Boolean(props.node) || props.node.isReadonly ? (
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
            actionGroups={props.listeners?.actions?.({
              id: props.node.id,
              checklist: props.node.isChecklist,
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
          onUpdate={(update) =>
            props.listeners?.onUpdate(props.node.id, update)
          }
        />
      </div>
      <div className="actions">{headerActions}</div>
    </div>
  );
};
