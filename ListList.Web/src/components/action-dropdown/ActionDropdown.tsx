import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { AlignType, ButtonVariant } from 'react-bootstrap/esm/types';
import { Icon, IconType } from '..';
import * as styles from './ActionDropdown.module.scss';

export interface DropdownAction {
  label: string;
  icon?: IconType;
  action: (e: React.MouseEvent) => void;
}

export interface ActionDropdownProps {
  actions: DropdownAction[];
  align?: AlignType;
  icon?: IconType;
  size?: 'sm' | 'lg';
  variant?: ButtonVariant;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = (props) => {
  const {
    actions = [],
    align = 'end',
    icon: iconType = 'kebab',
    size,
    variant = 'outline-secondary',
  } = props;

  return (
    <Dropdown
      className={styles.ActionDropdown}
      onToggle={(isOpen, event) => {
        event?.originalEvent.stopPropagation();
      }}
    >
      <Dropdown.Toggle className={styles.Toggle} size={size} variant={variant}>
        <Icon type={iconType} />
      </Dropdown.Toggle>
      <Dropdown.Menu align={align}>
        {actions.map((a, i) => (
          <Dropdown.Item
            key={i}
            className={styles.ActionItem}
            onClick={a.action}
          >
            <span>{a.label}</span>
            {a.icon && <Icon type={a.icon} />}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
