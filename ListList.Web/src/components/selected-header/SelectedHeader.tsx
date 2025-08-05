import React from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import {
  IconButton,
  IconButtonProps,
  IconType,
  LabelAndDescriptionEditor,
  ShareModal,
} from '..';
import { ApiListHeaderShare, SharedPermission } from '../../contracts';
import { ListHeader } from '../../models';
import { Listeners } from '../tree/SortableTree';

type Test = Pick<IconButtonProps, 'iconType' | 'size' | 'variant' | 'onClick'>;

interface SelectedHeaderAction {
  iconType: IconType;
  size?: 'sm' | 'lg';
  variant: ButtonVariant;
  onClick: () => void;
}

const createSecondary = (
  iconType: IconType,
  onClick: () => void
): SelectedHeaderAction => ({
  iconType,
  size: 'sm',
  variant: 'outline-secondary',
  onClick,
});

const createPrimary = (
  iconType: IconType,
  onClick: () => void
): SelectedHeaderAction => ({
  iconType,
  variant: 'secondary',
  onClick,
});

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

  const selectionHeaderActions = React.useMemo(
    () => [
      ...(props.header.isReadOnly
        ? []
        : [
            createSecondary('share', () =>
              setState((s) => ({ ...s, show: true }))
            ),
            createSecondary('kebab', () => {}),
          ]),
      createPrimary('backward', () => props.onBack?.()),
    ],
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
      <div className="actions">
        {selectionHeaderActions.map((a, i) => (
          <IconButton key={i} {...a} />
        ))}
      </div>
      <ShareModal
        show={state.show}
        shareLinks={props.header.shareLinks}
        onClose={() => setState((s) => ({ ...s, show: false }))}
      />
    </div>
  );
};
