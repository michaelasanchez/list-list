import React from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CircleQuestionMark,
  Copy,
  Edit,
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
  calendar: Calendar,
  cancel: X,
  check: Check,
  checked: SquareCheckBig,
  close: X,
  collapsed: ChevronUp,
  confirm: Check,
  copy: Copy,
  create: Plus,
  createOutline: PlusSquare,
  dark: Moon,
  delete: Trash,
  edit: Edit,
  expanded: ChevronDown,
  forward: ArrowRight,
  handle: GripVertical,
  kebab: EllipsisVertical,
  light: Sun,
  link: ExternalLink,
  question: CircleQuestionMark,
  settings: Settings,
  share: Share2,
  remove: X,
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
