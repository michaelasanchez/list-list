import React from 'react';
import { ActionDropdown, IconButton, LabelAndDescriptionEditor } from '..';
import {
  ApiHeaderPatch,
  ApiHeaderShare,
  SharedPermission,
} from '../../contracts';
import { Header } from '../../models';
import { SortableTreeHooks } from '../tree/SortableTree';

export interface SelectedHeaderProps {
  header: Header;
  listeners?: SortableTreeHooks;
  onBack?: () => void;
  onShare?: () => void;
  onPatch?: (patch: ApiHeaderPatch) => void;
}

interface State {
  show: boolean;
  pendingShare?: ApiHeaderShare;
}

export const SelectedHeader: React.FC<SelectedHeaderProps> = (props) => {
  const [state, setState] = React.useState<State>({
    show: false,
    pendingShare: { permission: SharedPermission.View },
  });

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
            actions={[
              {
                icon: props.header.isChecklist ? 'check' : null,
                label: 'Checklist',
                action: (e) => {
                  e.stopPropagation();

                  props.onPatch?.({ checklist: !props.header.isChecklist });
                },
              },
            ]}
          />
          <IconButton
            iconType="backward"
            variant="secondary"
            onClick={() => props.onBack?.()}
          />
        </>
      ),
    [
      props.header
    ]
  );

  return (
    <div className="selected-header">
      <div className="content">
        <LabelAndDescriptionEditor
          name={props.header?.id ?? 'none'}
          label={props.header?.label ?? ''}
          description={props.header?.description ?? ''}
          onSaveLabel={(label) =>
            props.listeners?.onSaveLabel(props.header.id, label)
          }
          onSaveDescription={(description) =>
            props.listeners?.onSaveDescription(props.header.id, description)
          }
        />
      </div>
      <div className="actions">{headerActions}</div>
    </div>
  );
};
