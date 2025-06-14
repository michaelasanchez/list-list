import classNames from 'classnames';
import { forwardRef, HTMLAttributes } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Icon } from '../Icon';
import React = require('react');

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

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    console.log(value, childCount);
    return (
      <li
        className={classNames({ parent: childCount > 0 })}
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
            paddingLeft: `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          // className={styles.TreeItem}
          ref={ref}
          style={style}
        >
          <Button variant="none" {...handleProps}>
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
          {clone && childCount && childCount > 1 ? (
            <Badge>{childCount}</Badge>
          ) : null}
        </div>
      </li>
    );
  }
);
