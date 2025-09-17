import React from 'react';
import { ActionDropdown, IconButton, LabelAndDescriptionEditor } from '..';
import { ApiHeaderPatch } from '../../contracts';
import { Header } from '../../models';
import { SortableTreeHooks } from '../tree/SortableTree';

export interface SelectedHeaderProps {
  header: Header;
  listeners?: SortableTreeHooks;
  onBack?: () => void;
  onShare?: () => void;
  onPatch?: (patch: ApiHeaderPatch) => void;
}

export const SelectedHeader: React.FC<SelectedHeaderProps> = (props) => {
  const headerActions = React.useMemo(
    () =>
      props.header.isReadonly ? (
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
              id: props.header.id,
              checklist: props.header.isChecklist,
            })}
          />
          <IconButton
            iconType="backward"
            variant="secondary"
            onClick={() => props.onBack?.()}
          />
        </>
      ),
    [props.header]
  );

  return (
    <div className="selected-header">
      <div className="content">
        <LabelAndDescriptionEditor
          name={props.header?.id ?? 'none'}
          label={props.header?.label ?? ''}
          description={props.header?.description ?? ''}
          onUpdate={(update) =>
            props.listeners?.onUpdate(props.header.id, update)
          }
        />
      </div>
      <div className="actions">{headerActions}</div>
    </div>
  );
};
