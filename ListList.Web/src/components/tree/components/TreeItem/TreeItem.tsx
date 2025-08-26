import classNames from 'classnames';
import { forwardRef, HTMLAttributes } from 'react';

import { Action, Handle, Remove } from '../../../Item';
import * as styles from './TreeItem.module.scss';

import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useSwipe } from '../../../../hooks';
import { Succeeded } from '../../../../network';
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
  data: TreeItemData;
  name: string;
  listeners?: Listeners;
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
      listeners,
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

    const handlers = useSwipe(
      () => console.log('Swiped left!'),
      () => console.log('Swiped right!')
    );

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
        {...handlers}
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
            <Action>
              <Icon type="kebab" />
            </Action>
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
              <Remove onClick={onRemove} />
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
