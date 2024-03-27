import React = require('react');
import { Form } from 'react-bootstrap';
import { useClickOutside } from '../hooks';

export interface LabelEditorProps {
  label: string;
  placeholder?: string;
  onBlur?: () => void;
  onCancel?: () => void;
  onChange?: (update: string) => void;
  onFocus?: () => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = (props) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLTextAreaElement>();
  const cancelled = React.useRef<boolean>(false);

  useClickOutside(inputRef, () => setEditing(false));

  const handleOnClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (!editing) {
      setEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Enter') {
      inputRef.current.blur();
    }

    if (e.key == 'Escape') {
      cancelled.current = true;
      inputRef.current.blur();
    }
  };

  const handleBlur = () => {
    if (!cancelled) {
      props.onBlur();
    } else {
      cancelled.current = false;
      props.onChange(null);
    }
  };

  return (
    <div className={`label-editor${editing ? ' active' : ''}`}>
      <span>{props.label || props.placeholder || ''}</span>
      <Form.Control
        as="textarea"
        ref={inputRef}
        onClick={handleOnClick}
        plaintext={!editing}
        placeholder={props.placeholder}
        value={props.label || ''}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={props.onFocus}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
