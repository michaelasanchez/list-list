import React from 'react';

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  GripVertical,
  Moon,
  Plus,
  PlusSquare,
  Settings,
  Share,
  Sun,
  Trash,
  X,
} from 'lucide-react';

const icons = {
  backward: ArrowLeft,
  close: X,
  collapsed: ChevronUp,
  create: Plus,
  createOutline: PlusSquare,
  expanded: ChevronDown,
  delete: Trash,
  dark: Moon,
  forward: ArrowRight,
  handle: GripVertical,
  kebab: EllipsisVertical,
  light: Sun,
  settings: Settings,
  share: Share,
};

export type IconType = keyof typeof icons;

export interface IconProps {
  type: IconType;
  // size?: SizeProp;
  size?: number;
}

export const Icon: React.FC<IconProps> = (props) => {
  const Icon = icons[props.type];

  return <Icon size={props.size ?? 16} />;
};

export const MemoizedIcon = React.memo(Icon);
