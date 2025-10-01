import classNames from 'classnames';
import { isNil } from 'lodash';
import React from 'react';
import { Collapse, Spinner } from 'react-bootstrap';
import { LabelEditor } from '.';
import { Succeeded } from '../network';

interface Update {
  label?: string;
  description?: string;
}

interface LabelAndDescriptionEditorProps {
  name: string;
  label: string;
  description: string;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  placeholderDescription?: string;
  placeholderLabel?: string;
  onUpdate?: (update: Update) => Promise<Succeeded>;
}

interface LabelAndDescriptionEditorState {
  editingLabel: boolean;
  editingDescription: boolean;
  loading: boolean;
  pendingLabel?: string;
  pendingDescription?: string;
}

export const LabelAndDescriptionEditor: React.FC<
  LabelAndDescriptionEditorProps
> = (props) => {
  const [state, setState] = React.useState<LabelAndDescriptionEditorState>({
    editingDescription: false,
    editingLabel: false,
    loading: false,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleBlurContainer = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      e.relatedTarget &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      // focus just moved *within* the container → do nothing
      return;
    }

    const trimmedPendingLabel = state.pendingLabel?.trim();
    const trimmedPendingDescription = state.pendingDescription?.trim();

    const updateLabel =
      trimmedPendingLabel != null && trimmedPendingLabel !== props.label;
    const updateDescription =
      trimmedPendingDescription != null &&
      trimmedPendingDescription !== props.description;

    if (Boolean(props.onUpdate) && (updateLabel || updateDescription)) {
      const update: Update = {};

      if (updateLabel) {
        update.label = trimmedPendingLabel;
      }

      if (updateDescription) {
        update.description = trimmedPendingDescription;
      }

      setState((s) => ({ ...s, loading: true }));

      props.onUpdate?.(update).then(() =>
        setState({
          editingLabel: false,
          editingDescription: false,
          loading: false,
          pendingLabel: null,
          pendingDescription: null,
        })
      );
    } else {
      setState({
        editingLabel: false,
        editingDescription: false,
        loading: false,
        pendingLabel: null,
        pendingDescription: null,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onBlur={handleBlurContainer}
      tabIndex={-1} // required so the container can receive focus events
    >
      <LabelEditor
        autoFocus={props.autoFocus}
        disabled={props.disabled || state.loading}
        className={classNames('label', props.className)}
        name={`${props.name}-label`}
        label={isNil(state?.pendingLabel) ? props.label : state.pendingLabel}
        placeholder={props.placeholderLabel}
        onChange={(update: string) =>
          setState({ ...state, pendingLabel: update })
        }
        onFocus={() =>
          setState({
            ...state,
            editingLabel: true,
            pendingLabel: props.label ?? '',
          })
        }
      />
      {state.loading && (
        <Spinner
          animation="border"
          style={
            {
              marginLeft: '0.5em',
              '--bs-spinner-height': '1em',
              '--bs-spinner-width': '1em',
              '--bs-spinner-border-width': '0.2em',
            } as React.CSSProperties
          }
        />
      )}
      <Collapse
        className="description"
        in={
          !!props.description ||
          !!state.pendingDescription ||
          !!state.editingLabel ||
          !!state.editingDescription
        }
      >
        <div>
          <LabelEditor
            className={classNames('description', props.className)}
            disabled={props.disabled || state.loading}
            name={`${props.name}-description`}
            label={
              isNil(state.pendingDescription)
                ? props.description
                : state.pendingDescription
            }
            placeholder={props.placeholderDescription}
            onChange={(update: string) =>
              setState({ ...state, pendingDescription: update })
            }
            onFocus={() =>
              setState({
                ...state,
                editingDescription: true,
                pendingDescription: props.description ?? '',
              })
            }
          />
        </div>
      </Collapse>
    </div>
  );
};
