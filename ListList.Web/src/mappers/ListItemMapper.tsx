import { filter, findIndex } from 'lodash';
import { ApiListItem } from '../models/contracts';
import { ListNode } from '../models/ListNode';

const mapChildNodes = (
  parentItem: ApiListItem,
  items: ApiListItem[]
): ListNode[] => {
  const childNodes: ListNode[] = [];

  if (!items?.length) return childNodes;

  let index = 0;

  do {
    const childItem = items[index];

    const grandChildren = filter(
      items,
      (i) => i.left > childItem.left && i.right < childItem.right
    );

    index += grandChildren.length + 1;

    childNodes.push({
      ...childItem,
      expanded: false,
      parentId: parentItem.id,
      children: mapChildNodes(childItem, grandChildren),
    });
  } while (index < items.length);

  return childNodes;
};

const mapToNode = (items: ApiListItem[]): ListNode => {
  const userNodeIndex = findIndex(items, (i) => i.left == 1);

  const userItem = items[userNodeIndex];
  items.splice(userNodeIndex, 1);

  const userNodes = mapChildNodes(userItem, items);

  return {
    ...userItem,
    label: 'Root',
    expanded: false,
    children: userNodes,
  };
};

export const ListItemMapper = {
  mapToNode,
};
