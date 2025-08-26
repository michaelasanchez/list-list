import { isNil } from 'lodash';
import React from 'react';
import { Collapse } from 'react-bootstrap';
import { LabelEditor } from '.';

interface LabelAndDescriptionEditorProps {
  name: string;
  label: string;
  description: string;
  onEditingChange?: (editing: boolean) => void;
  onSaveDescription?: (description: string) => void;
  onSaveLabel?: (label: string) => void;
}

interface LabelAndDescriptionEditorState {
  editingLabel: boolean;
  editingDescription: boolean;
  pendingLabel?: string;
  pendingDescription?: string;
}

export const LabelAndDescriptionEditor: React.FC<
  LabelAndDescriptionEditorProps
> = (props) => {
  const [state, setState] = React.useState<LabelAndDescriptionEditorState>({
    editingDescription: false,
    editingLabel: false,
  });

  const handleBeginDescriptionUpdate = () => {
    props.onEditingChange?.(true);

    setState({
      ...state,
      editingDescription: true,
      pendingDescription: props.description ?? '',
    });
  };

  const handleEndDescriptionUpdate = () => {
    const trimmedPendingDescription = state.pendingDescription.trim();

    if (trimmedPendingDescription != props.description) {
      props.onSaveDescription?.(trimmedPendingDescription);
    }

    props.onEditingChange?.(false);

    setState((s) => ({
      ...s,
      editingDescription: false,
      pendingDescription: null,
    }));
  };

  const handleBeginUpdateLabel = () => {
    props.onEditingChange?.(true);

    setState({
      ...state,
      editingLabel: true,
      pendingLabel: props.label ?? '',
    });
  };

  const handleEndUpdateLabel = () => {
    const trimmedPendingLabel = state.pendingLabel.trim();

    if (trimmedPendingLabel != props.label) {
      props.onSaveLabel?.(trimmedPendingLabel);
    }

    props.onEditingChange?.(false);

    setState((s) => ({ ...s, editingLabel: false, pendingLabel: null }));
  };

  return (
    <>
      <LabelEditor
        className="label"
        name={`${props.name}-label`}
        label={isNil(state?.pendingLabel) ? props.label : state.pendingLabel}
        placeholder="New Item"
        onFocus={handleBeginUpdateLabel}
        onBlur={handleEndUpdateLabel}
        onChange={(update: string) =>
          setState({ ...state, pendingLabel: update })
        }
      />
      <Collapse
        in={
          !!props.description ||
          !!state.pendingDescription ||
          !!state.editingLabel ||
          !!state.editingDescription
        }
      >
        <div>
          <LabelEditor
            className="description"
            name={`${props.name}-description`}
            label={
              isNil(state.pendingDescription)
                ? props.description
                : state.pendingDescription
            }
            placeholder="Add note"
            onFocus={handleBeginDescriptionUpdate}
            onBlur={handleEndDescriptionUpdate}
            onChange={(update: string) =>
              setState({ ...state, pendingDescription: update })
            }
          />
        </div>
      </Collapse>
    </>
  );
};
