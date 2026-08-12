import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { Icon, IconType } from '../..';

export interface IconButtonProps extends ButtonProps {
  iconType: IconType;
  align?: 'start' | 'end';
}

const getIconSize = (size?: 'sm' | 'lg'): number => {
  switch (size) {
    case 'sm':
      return 12;
    case 'lg':
      return 20;
    default:
      return 16;
  }
};

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { children, iconType, align, ...rest } = props;

  const iconProps = { type: iconType, size: getIconSize(props.size) };

  return (
    <Button {...rest}>
      {/* className={classNames(styles.IconButton)}> */}
      {align == 'end' ? (
        <>
          {children}
          <Icon {...iconProps} />
        </>
      ) : (
        <>
          <Icon {...iconProps} />
          {children}
        </>
      )}
    </Button>
  );
};
