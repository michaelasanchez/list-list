import React from 'react';
import { Form } from 'react-bootstrap';
import { useClickOutside } from '../hooks';

export interface LabelEditorProps {
  name: string;
  label: string;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
  onBlur?: () => void;
  onCancel?: () => void;
  onChange?: (update: string) => void;
  onFocus?: () => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = (props) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
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
    if (!cancelled.current) {
      props.onBlur && props.onBlur();
    } else {
      cancelled.current = false;
      props.onChange && props.onChange(null);
    }
  };

  return (
    <div
      className={`label-editor${props.className ? ` ${props.className}` : ''}${
        editing ? ' active' : ''
      }`}
    >
      <span>{props.label || props.placeholder || ''}</span>
      <Form.Control
        as="textarea"
        autoFocus={props.autoFocus}
        name={`${props.name}-label-editor`}
        plaintext={!editing}
        placeholder={props.placeholder}
        ref={inputRef}
        value={props.label || ''}
        onBlur={handleBlur}
        onChange={(e) => props.onChange(e.target.value)}
        onClick={handleOnClick}
        onFocus={props.onFocus}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
