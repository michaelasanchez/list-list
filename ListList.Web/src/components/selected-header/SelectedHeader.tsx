import React from 'react';
import { IconButton, LabelAndDescriptionEditor, ShareModal } from '..';
import { ApiListHeaderShare, SharedPermission } from '../../contracts';
import { ListHeader } from '../../models';
import { Listeners } from '../tree/SortableTree';

export interface SelectedHeaderProps {
  header: ListHeader;
  listeners?: Listeners;
  onBack?: () => void;
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

  const handleClose = React.useCallback(
    () => setState((s) => ({ ...s, show: false })),
    [state.show]
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
      <div className="actions">
        <IconButton
          iconType="share"
          size="sm"
          variant="outline-secondary"
          onClick={() => setState((s) => ({ ...s, show: true }))}
        />
        <IconButton iconType="kebab" size="sm" variant="outline-secondary" />
        <IconButton
          iconType="backward"
          variant="secondary"
          onClick={() => props.onBack?.()}
        />
      </div>
      <ShareModal
        show={state.show}
        shareLinks={props.header.shareLinks}
        onClose={handleClose}
      />
    </div>
  );
};
