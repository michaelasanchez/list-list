import { UniqueIdentifier } from '@dnd-kit/core';
import { PathItem } from '../components';
import { TreeItem, TreeItems } from '../components/tree/types';
import { Header, Item } from '../models';

interface TreeItemWithParentId extends TreeItem {
  parentId: string;
}

// TODO: UTILITY
function findById(
  tree: TreeItems,
  id: UniqueIdentifier
): { item: TreeItem; path: PathItem[] } | null {
  for (const node of tree) {
    if (node.id === id) {
      return {
        item: node,
        path: [{ selectedId: node.id, label: node.data.label }],
      };
    }

    if (node.children?.length) {
      const result = findById(node.children, id);
      if (result) {
        return {
          item: result.item,
          path: [
            { selectedId: node.id, label: node.data.label },
            ...result.path,
          ],
        };
      }
    }
  }

  return null;
}

function buildTreeFromHeaders(headers: Header[]): TreeItems {
  return (
    headers.map<TreeItem>((header, index) => ({
      id: header.id,
      index,
      collapsed: true,
      // TODO: need this to force parent class
      //  & child count badge when dragging
      children: header.items.map((item, index) => ({
        id: item.id,
        children: [],
        data: { label: item.label, description: item.description, index },
      })),
      data: {
        label: header.label,
        description: header.description,
        isChecklist: header.checklist,
        index: header.order,
      },
      pending: header.pending,
    })) ?? []
  );
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
        completedOn: i.completedOn,
        index: i.index,
        // TODO: DEBUG
        // numbered: true,
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

function buildTreeFromSubItems(
  items: Item[],
  expanded: string[],
  selectedId: string
): { items: TreeItems; path: PathItem[] } {
  const treeItems = buildTreeFromItems(items, expanded);

  const selected = findById(treeItems, selectedId);

  return !Boolean(selected)
    ? null
    : { items: selected.item.children, path: selected.path };
}

export const TreeMapper = {
  buildTreeFromHeaders,
  buildTreeFromItems,
  buildTreeFromSubItems,
  // TODO: UTILITY
  findById
};
