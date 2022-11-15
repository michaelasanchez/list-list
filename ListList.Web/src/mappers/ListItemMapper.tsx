import { filter, findIndex, map, orderBy, reverse } from 'lodash';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListHeader } from '../models';
import { ListNode } from '../models/ListNode';

const mapChildNodes = (
  parentItem: ApiListItem,
  items: ApiListItem[]
): ListNode[] => {
  const childNodes: ListNode[] = [];

  if (!items?.length) return childNodes;

  let index = 0;

  do {
    const currentItem = items[index];

    const currentChildren = filter(
      items,
      (i) => i.left > currentItem.left && i.right < currentItem.right
    );

    index += currentChildren.length + 1;

    childNodes.push({
      ...currentItem,
      expanded: false,
      parentId: parentItem.id,
      children: mapChildNodes(currentItem, currentChildren),
    });
  } while (index < items.length);

  return childNodes;
};

const mapHeaders = (headers: ApiListHeader[]): ListHeader[] => {
  return map(headers, (h) => ({
    title: h.title,
    nodes: mapListItems(h.items),
  }));
};

const mapListItems = (items: ApiListItem[]): ListNode => {
  const userNodeIndex = findIndex(items, (i) => i.left == 1);

  const userItem = items[userNodeIndex];
  items.splice(userNodeIndex, 1);

  const userNodes = mapChildNodes(
    userItem,
    orderBy(items, (i) => i.left)
  );

  return {
    ...userItem,
    label: '',
    expanded: true,
    children: reverse(userNodes),
  };
};

export const ListItemMapper = {
  mapHeaders,
};
