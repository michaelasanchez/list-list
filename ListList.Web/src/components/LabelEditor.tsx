import React = require('react');
import { Form } from 'react-bootstrap';
import { useClickOutside } from '../hooks';

export interface LabelEditorProps {
  label: string;
}

export const LabelEditor: React.FC<LabelEditorProps> = (props) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  const ref = React.useRef();

  useClickOutside(ref, () => setEditing(false));

  return (
    <div className="label-editor">
      <Form.Control
        ref={ref}
        onClick={() => !editing && setEditing(true)}
        style={{
          width: `${props.label.length + 2 /*+ Number(editing)*/}ch`,
        }}
        plaintext={!editing}
        value={props.label}
        onChange={() => {}}
      />
    </div>
  );
};
