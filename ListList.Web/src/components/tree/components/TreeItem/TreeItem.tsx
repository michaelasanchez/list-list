import classNames from 'classnames';
import { forwardRef, HTMLAttributes } from 'react';

import { Action, Handle, Remove } from '../../../Item';
import * as styles from './TreeItem.module.scss';

import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Succeeded } from '../../../../network';
import { LabelAndDescriptionEditor } from '../../../LabelAndDescriptionEditor';
import { ActionDropdown, DropdownAction } from '../../../action-dropdown';
import { Icon } from '../../../icon';
import { TreeItemData } from '../../types';

export interface Hooks {
  actions?: DropdownAction[];
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
  data: TreeItemData;
  name: string;
  hooks?: Hooks;
  pending?: boolean;
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
      collapsed,
      data,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      hooks,
      name,
      pending,
      style,
      onCheck,
      onCollapse,
      onRemove,
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
          pending && styles.pending,
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
              autoFocus={pending}
              name={name}
              label={data.label}
              description={data.description}
              onSaveDescription={hooks?.onSaveDescription}
              onSaveLabel={hooks?.onSaveLabel}
            />
          </div>
          <div className={styles.Actions}>
            {hooks.actions?.length > 0 && (
              <ActionDropdown actions={hooks.actions} variant="none" />
            )}
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
                  <div className={styles.SpinnerContainer}>
                    <Spinner className={styles.Spinner} size="sm" />
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
                <Icon type="collapsed" size={20} />
              </Action>
            ) : (
              onRemove && <Remove onClick={onRemove} />
            )}
          </div>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);
