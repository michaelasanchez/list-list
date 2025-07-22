import { map } from 'lodash';
import { ApiListHeader, ApiListItem } from '../contracts';
import { ListHeader } from '../models';
import { ListItem } from '../models/ListItem';

// const mapChildNodes = (
//   items: ApiListItem[],
//   expanded?: string[]
// ): ListItem[] => {
//   const childNodes: ListItem[] = [];

//   if (!items?.length) return childNodes;

//   let index = 0;

//   do {
//     const currentNode = items[index];

//     const currentChildren = filter(
//       items,
//       (i) => i.left > currentNode.left && i.right < currentNode.right
//     );

//     index += currentChildren.length + 1;

//     childNodes.push({
//       ...currentNode,
//       expanded: includes(expanded, currentNode.id),
//       // children: mapChildNodes(currentChildren, expanded),
//     });
//   } while (index < items.length);

//   return childNodes;
// };

// const mapRootNode = (items: ApiListItem[], expanded?: string[]): ListItem => {
//   const rootNodeIndex = findIndex(items, (i) => i.left == 1);

//   const rootNode = items[rootNodeIndex];
//   items.splice(rootNodeIndex, 1);

//   const childNodes = mapChildNodes(
//     orderBy(items, (i) => i.left),
//     expanded
//   );

//   return {
//     ...rootNode,
//     expanded: includes(expanded, rootNode.id),
//     // children: childNodes,
//   };
// };

const mapItems = (items: ApiListItem[], expanded: string[]): ListItem[] =>
  items?.map((i) => ({
    ...i,
    expanded: expanded.includes(i.id),
    // children: [],
  }));

const mapHeaders = (
  headers: ApiListHeader[],
  expanded?: string[]
): ListHeader[] =>
  map(headers, (h) => ({
    id: h.id,
    label: h.label,
    description: h.description,
    order: h.order,
    items: mapItems(h.items, expanded),
  }));

const mapHeader = (header: ApiListHeader, expanded: string[]): ListHeader => ({
  id: header.id,
  label: header.label,
  description: header.description,
  order: header.order,
  items: mapItems(header.items, expanded),
});

export const ListItemMapper = {
  mapHeaders,
  mapHeader,
};
