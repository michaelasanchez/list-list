import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Icon, LabelAndDescriptionEditor } from '.';
import { ListHeader } from '../models';
import { ListItemApi } from '../network';

export interface ListHeaderDisplayProps {
  token: string;
  header: ListHeader;
  selected: boolean;
  onSelect: () => void;
  reloadHeader: () => void;
}

interface ListHeaderState {
  editing: boolean;
  disableToggle?: boolean;
}

export const ListHeaderDisplay: React.FC<ListHeaderDisplayProps> = (props) => {
  const [state, setState] = useState<ListHeaderState>({ editing: false });

  const rootItem = props.header.items?.[0];

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

  const handleUpdateLabel = (pendingLabel: string) => {
    if (pendingLabel != rootItem?.label) {
      const listItemPut = {
        label: pendingLabel,
        description: rootItem.description,
      };

      new ListItemApi(props.token)
        .Put(rootItem.id, listItemPut)
        .then(() => props.reloadHeader());
    }
  };

  const handleUpdateDescription = (pendingDescription: string) => {
    if (pendingDescription != rootItem?.description) {
      const listItemPut = {
        label: rootItem.label,
        description: pendingDescription,
      };

      new ListItemApi(props.token)
        .Put(rootItem.id, listItemPut)
        .then(() => props.reloadHeader());
    }
  };

  return (
    <div
      className={`list-header${props.selected ? ' selected' : ''}`}
      onClick={props.onSelect}
    >
      <div className="header-left">
        {!props.selected && (
          <Button className="handle" variant="none">
            <Icon type="handle" />
          </Button>
        )}
      </div>
      <div className="header-title">
        <div className="heading">
          <LabelAndDescriptionEditor
            label={rootItem?.label}
            description={rootItem?.description}
            onEditingChange={(editing: boolean) =>
              setState((s) => ({ ...s, editing }))
            }
            onSaveDescription={handleUpdateDescription}
            onSaveLabel={handleUpdateLabel}
          />
        </div>
      </div>
      <div className="header-right">
        <Button className="open" variant="none">
          <Icon type={props.selected ? 'backward' : 'forward'} />
        </Button>
      </div>
    </div>
  );
};

export const MemoizedListHeaderDisplay = React.memo(ListHeaderDisplay);
