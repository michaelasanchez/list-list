import { TreeItem, TreeItems } from '../../components/tree/types';
import { ApiListItem } from '../../contracts';
import { ListHeader, ListItem } from '../../models';

export interface ApiListItemWithChildren extends ApiListItem {
  index: number;
  collapsed: boolean;
  children: ApiListItemWithChildren[];
}

function buildTreeFromHeaders(headers: ListHeader[]): TreeItems {
  return (
    headers?.map<TreeItem>((header, index) => ({
      ...header,
      index,
      on: header.description,
      collapsed: true,
      children: [],
    })) ?? []
  );
}

function buildTreeFromItems(items: ListItem[], expanded: string[]): TreeItems {
  if (!items?.length) return [];

  const itemMap = new Map<string, ApiListItemWithChildren>();
  const roots: TreeItems = [];

  items.forEach((item, index) => {
    itemMap.set(item.id, {
      ...item,
      index,
      collapsed: !expanded?.includes(item.id),
      children: [],
    });
  });

  itemMap.forEach((item) => {
    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      }
    } else {
      roots.push(item);
    }
  });

  return roots;
}

export const Temp = {
  buildTreeFromHeaders,
  buildTreeFromItems,
};
