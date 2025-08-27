import React from 'react';
import {
  ActionDropdown,
  IconButton,
  LabelAndDescriptionEditor,
  ShareModal,
} from '..';
import {
  ApiHeaderPatch,
  ApiListHeaderShare,
  SharedPermission,
} from '../../contracts';
import { Header } from '../../models';
import { SortableTreeHooks } from '../tree/SortableTree';

export interface SelectedHeaderProps {
  header: Header;
  listeners?: SortableTreeHooks;
  onBack?: () => void;
  onPatch?: (patch: ApiHeaderPatch) => void;
}

interface State {
  show: boolean;
  pendingShare?: ApiListHeaderShare;
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
            onClick={() => setState((s) => ({ ...s, show: true }))}
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
          {/* <Dropdown className="menu">
            <Dropdown.Toggle size="sm" variant="outline-secondary">
              <Icon type="kebab" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() =>
                  props.onPatch?.({ checklist: !props.header.isChecklist })
                }
              >
                Checklist
                {props.header.isChecklist && <Icon type="check" />}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
          <IconButton
            iconType="backward"
            variant="secondary"
            onClick={() => props.onBack?.()}
          />
        </>
      ),
    [props.onBack]
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
      <ShareModal
        show={state.show}
        shareLinks={props.header.shareLinks}
        onClose={() => setState((s) => ({ ...s, show: false }))}
      />
    </div>
  );
};
