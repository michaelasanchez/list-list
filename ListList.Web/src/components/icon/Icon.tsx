import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowLeft,
  faArrowRight,
  faChevronDown,
  faChevronUp,
  faGear,
  faGripVertical,
  faMoon,
  faPlus,
  faSun,
  faTrashCan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import * as styles from './Icon.module.scss';

const iconTypes = {
  backward: faArrowLeft,
  close: faXmark,
  collapsed: faChevronUp,
  create: faPlus,
  createOutline: faPlusSquare,
  expanded: faChevronDown,
  delete: faTrashCan,
  dark: faMoon,
  forward: faArrowRight,
  handle: faGripVertical,
  settings: faGear,
  light: faSun,
};

export interface IconProps {
  type: keyof typeof iconTypes;
  size?: SizeProp;
}

export const Icon: React.FC<IconProps> = (props) => {
  return (
    <FontAwesomeIcon
      className={styles.icon}
      icon={iconTypes[props.type]}
      size={props.size}
    />
  );
};

export const MemoizedIcon = React.memo(Icon);
