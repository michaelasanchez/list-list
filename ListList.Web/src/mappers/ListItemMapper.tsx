import { filter, findIndex, includes, map, orderBy } from 'lodash';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListHeader } from '../models';
import { ListNode } from '../models/ListNode';

const mapChildNodes = (
  headerId: string,
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
      headerId,
      parentId: parentItem.id,
      isRoot: false,
      children: mapChildNodes(headerId, currentNode, currentChildren, expanded),
    });
  } while (index < items.length);

  return childNodes;
};

const mapRootNode = (
  headerId: string,
  items: ApiListItem[],
  expanded?: string[]
): ListNode => {
  const rootNodeIndex = findIndex(items, (i) => i.left == 1);

  const rootNode = items[rootNodeIndex];
  items.splice(rootNodeIndex, 1);

  const childNodes = mapChildNodes(
    headerId,
    rootNode,
    orderBy(items, (i) => i.left),
    expanded
  );

  return {
    ...rootNode,
    expanded: includes(expanded, rootNode.id),
    headerId,
    isRoot: true,
    children: childNodes,
  };
};

const mapHeaders = (
  headers: ApiListHeader[],
  expanded?: string[]
): ListHeader[] =>
  map(headers, (h) => ({
    id: h.id,
    order: h.order,
    root: mapRootNode(h.id, h.items, expanded),
  }));

const mapHeader = (header: ApiListHeader, expanded: string[]): ListHeader => ({
  id: header.id,
  order: header.order,
  root: mapRootNode(header.id, header.items, expanded),
});

// const mapNode = (
//   headerId: string,
//   item: ApiListItem,
//   expanded: string[]
// ): ListNode => ({
//   ...item,
//   expanded: includes(expanded, item.id),
//   headerId,
// });

export const ListItemMapper = {
  mapHeaders,
  mapHeader,
  // mapNode,
};
