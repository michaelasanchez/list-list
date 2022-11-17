// import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React = require('react');

const iconTypes = {
  create: faPlusSquare,
  remove: faTrashCan,
};

export interface IconProps {
  type: keyof typeof iconTypes;
}

export const Icon: React.FC<IconProps> = (props) => {
  return <FontAwesomeIcon className="icon" icon={iconTypes[props.type]} />;
};

export const MemoizedIcon = React.memo(Icon);
