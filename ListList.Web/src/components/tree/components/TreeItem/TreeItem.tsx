import cn from 'classnames';
import { forwardRef, HTMLAttributes } from 'react';

import { Action, Handle, Remove } from '../../../Item';
import * as styles from './TreeItem.module.scss';

import React from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { useLongPress } from '../../../../hooks';
import { Succeeded } from '../../../../network';
import { DateUtils } from '../../../../shared';
import { LabelAndDescriptionEditor } from '../../../LabelAndDescriptionEditor';
import { ActionDropdown, CustomAction } from '../../../action-dropdown';
import { Icon } from '../../../icon';
import { ItemUpdate } from '../../SortableTree';
import { TreeItemData } from '../../types';

export interface Actions {
  dropdown?: CustomAction[][];
  onUpdate?: (update: ItemUpdate) => Promise<Succeeded>;
}

export interface TreeItemProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'id'
> {
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
  hooks?: Actions;
  pending?: boolean;
  onCheck?(): Promise<Succeeded> | undefined;
  onCollapse?(): void;
  onRemove?(): void;
  onNavigate?(): void;
  //
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
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
      onNavigate,
      wrapperRef,
      ...props
    },
    ref,
  ) => {
    const [checkLoading, setCheckLoading] = React.useState<boolean>(false);

    const localRef = React.useRef<HTMLLIElement | null>(null);

    const setWrapperRef = React.useCallback(
      (node: HTMLLIElement | null) => {
        localRef.current = node;
        wrapperRef?.(node as HTMLLIElement);
      },
      [wrapperRef],
    );

    useLongPress(
      () => {
        onNavigate?.();
      },
      { current: localRef.current },
    );

    return (
      <li
        className={cn(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          childCount && styles.parent,
          pending && styles.pending,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
          data.complete && styles.complete,
        )}
        ref={setWrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
        // onDoubleClickCapture={(e) => {
        //   e.preventDefault();
        //   e.stopPropagation();

        //   onNavigate?.();
        // }}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          <Handle {...handleProps} />
          {data.numbered && (
            <Badge bg="secondary">{pending ? '+' : data.index + 1}</Badge>
          )}
          <div className={styles.Content}>
            <LabelAndDescriptionEditor
              className={styles.Editor}
              autoFocus={pending}
              name={name}
              label={data.label ?? ''}
              placeholderLabel={pending ? 'New Item' : undefined}
              description={data.description ?? ''}
              placeholderDescription="Add note"
              onUpdate={hooks?.onUpdate}
            />
            {data.completedOn && (
              <small>{DateUtils.timeAgo(data.completedOn)}</small>
            )}
          </div>
          <div className={styles.Actions}>
            {hooks?.dropdown && (
              <ActionDropdown actionGroups={hooks.dropdown} variant="none" />
            )}
            {/* Checkbox */}
            {checkbox && (
              <Action
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (onCheck) {
                    setCheckLoading(true);

                    const checkPromise = onCheck();
                    if (checkPromise) {
                      checkPromise.then(() => setCheckLoading(false));
                    } else {
                      setCheckLoading(false);
                    }
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
            {/* Collapse */}
            {onCollapse ? (
              <Action
                onClick={(e) => {
                  e.stopPropagation();
                  onCollapse();
                }}
                className={cn(styles.Collapse, collapsed && styles.collapsed)}
              >
                <Icon type="collapsed" size={20} />
              </Action>
            ) : (
              onRemove && (
                <Remove
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                />
              )
            )}
          </div>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  },
);
