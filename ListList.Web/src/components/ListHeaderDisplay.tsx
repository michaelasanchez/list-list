import React = require('react');
import { useEffect, useState } from 'react';
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
    if (pendingLabel != props.header.root.label) {
      const listItemPut = {
        label: pendingLabel,
        description: props.header.root.description,
      };

      new ListItemApi(props.token)
        .Put(props.header.root.id, listItemPut)
        .then(() => props.reloadHeader());
    }
  };

  const handleUpdateDescription = (pendingDescription: string) => {
    if (pendingDescription != props.header.root.description) {
      const listItemPut = {
        label: props.header.root.label,
        description: pendingDescription,
      };

      new ListItemApi(props.token)
        .Put(props.header.root.id, listItemPut)
        .then(() => props.reloadHeader());
    }
  };

  return (
    <div className="list-header">
      <div className="header-left">
        {!props.selected && (
          <Button className="grip" variant="none">
            <Icon type="grip" />
          </Button>
        )}
      </div>
      <div className="header-title">
        <div className="heading">
          <LabelAndDescriptionEditor
            label={props.header.root.label}
            description={props.header.root.description}
            onEditingChange={(editing: boolean) =>
              setState((s) => ({ ...s, editing }))
            }
            onSaveDescription={handleUpdateDescription}
            onSaveLabel={handleUpdateLabel}
          />
        </div>
      </div>
      <div className="header-right">
        <Button className="open" variant="none" onClick={props.onSelect}>
          <Icon type={props.selected ? 'backward' : 'forward'} />
        </Button>
      </div>
    </div>
  );
};

export const MemoizedListHeaderDisplay = React.memo(ListHeaderDisplay);
