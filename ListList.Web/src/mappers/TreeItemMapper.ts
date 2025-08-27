import { TreeItem, TreeItems } from '../components/tree/types';
import { Header, Item } from '../models';

function buildTreeFromHeaders(headers: Header[]): TreeItems {
  return (
    headers.map<TreeItem>((header, index) => ({
      id: header.id,
      index,
      collapsed: true,
      // children: [],
      children: [
        {
          id: '',
          children: [],
          data: { label: '', description: '' },
          pending: false,
        },
      ],
      data: {
        label: header.label,
        description: header.description,
      },
    })) ?? []
  );
}

interface TreeItemWithParentId extends TreeItem {
  parentId: string;
}

function buildTreeFromItems(items: Item[], expanded: string[]): TreeItems {
  if (!items?.length) return [];

  const itemMap = new Map<string, TreeItemWithParentId>();
  const roots: TreeItems = [];

  items.forEach((i) => {
    itemMap.set(i.id, {
      id: i.id,
      collapsed: !expanded?.includes(i.id),
      children: [],
      parentId: i.parentId,
      pending: i.pending,
      data: {
        label: i.label,
        description: i.description,
        complete: i.complete,
      },
    });
  });

  itemMap.forEach((item) => {
    const { parentId, ...rest } = item;

    if (parentId) {
      const parent = itemMap.get(parentId);

      if (parent) {
        parent.children.push(rest);
      }
    } else {
      roots.push(rest);
    }
  });

  return roots;
}

export const Temp = {
  buildTreeFromHeaders,
  buildTreeFromItems,
};
