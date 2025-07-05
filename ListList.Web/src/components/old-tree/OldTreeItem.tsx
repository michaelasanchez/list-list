import classNames from 'classnames';
import React, { forwardRef, HTMLAttributes } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Icon } from '../icon';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
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
  value: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const OldTreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      collapsed,
      depth,
      disableInteraction,
      disableSelection,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    const parent = childCount > 0;
    // console.log(value, collapsed)

    return (
      <li
        className={classNames({
          parent,
          clone,
          ghost,
          indicator,
          disableSelection,
          disableInteraction,
        })}
        // className={classNames(
        //   styles.Wrapper,
        //   clone && styles.clone,
        //   ghost && styles.ghost,
        //   indicator && styles.indicator,
        //   disableSelection && styles.disableSelection,
        //   disableInteraction && styles.disableInteraction
        // )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          // className={styles.TreeItem}
          className="tree-item"
          ref={ref}
          style={style}
        >
          <Button className="handle" variant="none" {...handleProps}>
            <Icon type="handle" />
          </Button>
          {onCollapse && (
            <Button variant="none" onClick={onCollapse}>
              <Icon type={collapsed ? 'collapsed' : 'expanded'} />
            </Button>
          )}
          <span
          // className={styles.Text}
          >
            {value}
          </span>
          {/* {!clone && onRemove && <Remove onClick={onRemove} />} */}
          {!clone && onRemove && (
            <Button variant="none" onClick={onRemove}>
              <Icon type="delete" />
            </Button>
          )}
          {clone && parent ? <Badge>{childCount}</Badge> : null}
        </div>
      </li>
    );
  }
);
