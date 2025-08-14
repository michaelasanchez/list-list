import React from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleQuestionMark,
  Copy,
  EllipsisVertical,
  ExternalLink,
  GripVertical,
  Moon,
  Plus,
  PlusSquare,
  Settings,
  Share2,
  Square,
  SquareCheckBig,
  Sun,
  Trash,
  X,
} from 'lucide-react';

const icons = {
  backward: ArrowLeft,
  check: Check,
  checked: SquareCheckBig,
  close: X,
  collapsed: ChevronUp,
  copy: Copy,
  create: Plus,
  createOutline: PlusSquare,
  delete: Trash,
  dark: Moon,
  expanded: ChevronDown,
  forward: ArrowRight,
  handle: GripVertical,
  kebab: EllipsisVertical,
  light: Sun,
  link: ExternalLink,
  question: CircleQuestionMark,
  settings: Settings,
  share: Share2,
  unchecked: Square,
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
