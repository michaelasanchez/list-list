import { ApiListHeader, ApiListItem } from '../../contracts';

export interface ApiListItemWithChildren extends ApiListItem {
  index: number;
  collapsed: boolean;
  children: ApiListItemWithChildren[];
}

function buildTreeFromHeaders(
  headers: ApiListHeader[]
): ApiListItemWithChildren[] {
  return (
    headers?.map<ApiListItemWithChildren>((header, index) => ({
      ...{ ...header.items[0], id: header.id },
      index,
      collapsed: true,
      children: [],
    })) ?? []
  );
}

function buildTreeFromItems(
  items: ApiListItem[],
  expanded: string[]
): ApiListItemWithChildren[] {
  if (!items?.length) return [];

  const itemMap = new Map<string, ApiListItemWithChildren>();
  const roots: ApiListItemWithChildren[] = [];

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
