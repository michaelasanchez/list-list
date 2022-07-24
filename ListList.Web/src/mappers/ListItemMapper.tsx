import { ApiListItem } from '../models/api';
import { ListNode } from '../models/ListNode';

const mapToNode = (items: ApiListItem[]): ListNode => {
  return { ...items[0] };
};

export const ListItemMapper = {
  mapToNode,
};
