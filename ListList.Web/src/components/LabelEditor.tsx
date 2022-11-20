import React = require('react');
import { Form } from 'react-bootstrap';
import { useClickOutside } from '../hooks';

export interface LabelEditorProps {
  label: string;
  placeholder?: string;
  onBlur?: () => void;
  onChange?: (update: string) => void;
  onFocus?: () => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = (props) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  const ref = React.useRef();

  useClickOutside(ref, () => setEditing(false));

  const handleOnClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('why');
    e.stopPropagation();
    if (!editing) {
      setEditing(true);
    }
  };

  return (
    <div className={`label-editor${editing ? ' active' : ''}`}>
      <span>{props.label || props.placeholder || ''}</span>
      <Form.Control
        ref={ref}
        onClick={handleOnClick}
        plaintext={!editing}
        placeholder={props.placeholder}
        value={props.label || ''}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
    </div>
  );
};
