import React from 'react';

import {
  ArrowLeft,
  ArrowRight,
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
  Sun,
  Trash,
  X,
} from 'lucide-react';

const icons = {
  backward: ArrowLeft,
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
