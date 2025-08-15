import classNames from 'classnames';
import { forwardRef, HTMLAttributes } from 'react';

import { Action, Handle } from '../../../Item';
import * as styles from './TreeItem.module.scss';

import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Succeeded } from '../../../../views/app/App';
import { LabelAndDescriptionEditor } from '../../../LabelAndDescriptionEditor';
import { Icon } from '../../../icon';
import { TreeItemData } from '../../types';

export interface Listeners {
  onSaveDescription?: (updated: string) => void;
  onSaveLabel?: (updated: string) => void;
}

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  checkbox?: boolean;
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  //
  name: string;
  data: TreeItemData;
  listeners?: Listeners;
  onCheck?(): Promise<Succeeded>;
  onCollapse?(): void;
  onRemove?(): void;
  //
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      checkbox,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCheck,
      onCollapse,
      onRemove,
      style,
      name,
      data,
      listeners,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    const [checkLoading, setCheckLoading] = React.useState<boolean>(false);

    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          childCount && styles.parent,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          <Handle {...handleProps} />
          <div className={styles.Text}>
            <LabelAndDescriptionEditor
              name={name}
              label={data.label}
              description={data.description}
              onSaveDescription={listeners?.onSaveDescription}
              onSaveLabel={listeners?.onSaveLabel}
            />
          </div>
          <div className={styles.Actions}>
            {checkbox && (
              <Action
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (onCheck) {
                    setCheckLoading(true);

                    onCheck().then(() => setCheckLoading(false));
                  }
                }}
              >
                {checkLoading ? (
                // {data.complete ? (
                  <div className={styles.SpinnerContainer}>
                    <Spinner
                      className={styles.Spinner}
                      size="sm"
                    />
                  </div>
                ) : (
                  <Icon type={data.complete ? 'checked' : 'unchecked'} />
                )}
              </Action>
            )}
            {onCollapse ? (
              <Action
                onClick={onCollapse}
                className={classNames(
                  styles.Collapse,
                  collapsed && styles.collapsed
                )}
              >
                {collapseIcon}
              </Action>
            ) : (
              <Action />
            )}
            {/* {!clone && !childCount && onRemove && <Remove onClick={onRemove} />} */}
            {/* <Dropdown>
                <Dropdown.Toggle>
                  <Icon type="kebab" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {hooks.}
                </Dropdown.Menu>
              </Dropdown> */}
          </div>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);

const collapseIcon = (
  <Icon type="collapsed" size={20} />
  // <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
  //   <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  // </svg>
);
