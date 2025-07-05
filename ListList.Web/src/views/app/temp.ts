import { ApiListItem } from '../../contracts';

export interface ApiListItemWithChildren extends ApiListItem {
  index: number;
  collapsed: boolean;
  children: ApiListItemWithChildren[];
}

export function buildTree(
  items: ApiListItem[],
  expanded: string[]
): ApiListItemWithChildren[] {
  const itemMap = new Map<string, ApiListItemWithChildren>();
  const roots: ApiListItemWithChildren[] = [];

  // First, clone each item and add the extra fields
  items.forEach((item, index) => {
    itemMap.set(item.id, {
      ...item,
      index,
      collapsed: !expanded.includes(item.id),
      children: [],
    });
  });

  // Then link children to parents
  itemMap.forEach((item) => {
    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      }
    } else {
      // No parentId means it's a root item
      roots.push(item);
    }
  });

  return roots;
}
