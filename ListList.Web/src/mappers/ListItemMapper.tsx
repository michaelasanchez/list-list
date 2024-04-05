import { filter, findIndex, includes, map, orderBy } from 'lodash';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListHeader } from '../models';
import { ListNode } from '../models/ListNode';

const mapChildNodes = (
  parentItem: ApiListItem,
  items: ApiListItem[],
  expanded?: string[]
): ListNode[] => {
  const childNodes: ListNode[] = [];

  if (!items?.length) return childNodes;

  let index = 0;

  do {
    const currentNode = items[index];

    const currentChildren = filter(
      items,
      (i) => i.left > currentNode.left && i.right < currentNode.right
    );

    index += currentChildren.length + 1;

    childNodes.push({
      ...currentNode,
      expanded: includes(expanded, currentNode.id),
      parentId: parentItem.id,
      children: mapChildNodes(currentNode, currentChildren, expanded),
    });
  } while (index < items.length);

  return childNodes;
};

const mapRootNode = (items: ApiListItem[], expanded?: string[]): ListNode => {
  const rootNodeIndex = findIndex(items, (i) => i.left == 1);

  const rootNode = items[rootNodeIndex];
  items.splice(rootNodeIndex, 1);

  const childNodes = mapChildNodes(
    rootNode,
    orderBy(items, (i) => i.left),
    expanded
  );

  return {
    ...rootNode,
    expanded: includes(expanded, rootNode.id),
    children: childNodes,
  };
};

const mapHeaders = (
  headers: ApiListHeader[],
  expanded?: string[]
): ListHeader[] =>
  map(headers, (h) => ({
    order: h.order,
    root: mapRootNode(h.items, expanded),
  }));

export const ListItemMapper = {
  mapHeaders,
};
