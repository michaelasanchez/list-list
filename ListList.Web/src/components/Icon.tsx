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
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React = require('react');

const iconTypes = {
  backward: faArrowLeft,
  collapsed: faChevronUp,
  create: faPlus,
  createOutline: faPlusSquare,
  expanded: faChevronDown,
  delete: faTrashCan,
  dark: faMoon,
  forward: faArrowRight,
  grip: faGripVertical,
  settings: faGear,
  light: faSun,
};

export interface IconProps {
  type: keyof typeof iconTypes;
}

export const Icon: React.FC<IconProps> = (props) => {
  return <FontAwesomeIcon className="icon" icon={iconTypes[props.type]} />;
};

export const MemoizedIcon = React.memo(Icon);
