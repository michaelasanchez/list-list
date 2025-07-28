import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { Icon, IconType } from '../..';

import classNames from 'classnames';
import * as styles from './IconButton.module.scss';

export interface IconButtonProps extends ButtonProps {
  iconType: IconType;
  align?: 'start' | 'end';
}

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { children, iconType, align, ...rest } = props;

  return (
    <Button {...rest} className={classNames(styles.IconButton)}>
      {align == 'end' ? (
        <>
          {children}
          <Icon type={iconType} />
        </>
      ) : (
        <>
          <Icon type={iconType} />
          {children}
        </>
      )}
    </Button>
  );
};
