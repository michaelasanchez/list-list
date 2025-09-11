import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AlignType, ButtonVariant } from 'react-bootstrap/esm/types';
import { Icon, IconType } from '..';
import * as styles from './ActionDropdown.module.scss';

export interface DropdownAction {
  label: string;
  icon?: IconType;
  fade?: boolean;
  keepOpen?: boolean;
  action: (e: React.MouseEvent) => void;
}

export interface ActionDropdownProps {
  actionGroups: DropdownAction[][];
  align?: AlignType;
  icon?: IconType;
  size?: 'sm' | 'lg';
  variant?: ButtonVariant;
}

const FecalPellets: React.FC<DropdownAction> = (a) => (
  <Dropdown.Item
    className={classNames(styles.ActionItem, a.fade && styles.fade)}
    onClick={(e) => {
      a.keepOpen && e.stopPropagation();
      a.action(e);
    }}
  >
    <span>{a.label}</span>
    {a.icon && <Icon type={a.icon} />}
  </Dropdown.Item>
);

const intersperseGroups = (
  groups: DropdownAction[][],
  divider: ReactNode
): ReactNode => {
  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group, i) => (
        <React.Fragment key={i}>
          {i > 0 && divider}
          {group.map((g, i) => (
            <FecalPellets key={i} {...g} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

export const ActionDropdown: React.FC<ActionDropdownProps> = (props) => {
  const {
    actionGroups = [],
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
        {intersperseGroups(actionGroups, <Dropdown.Divider />)}
      </Dropdown.Menu>
    </Dropdown>
  );
};
