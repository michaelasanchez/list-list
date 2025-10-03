import { TreeItem, TreeItems } from '../components/tree/types';
import { Header, Item } from '../models';

interface TreeItemWithParentId extends TreeItem {
  parentId: string;
}

function assignPaths(nodes: TreeItems, parentPath: number[] = []) {
  nodes.forEach((node, idx) => {
    node.path = [...parentPath, idx];
    if (node.children?.length) {
      assignPaths(node.children, node.path);
    }
  });
}

function findById(tree: TreeItems, id: string): TreeItem | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }

    if (node.children?.length) {
      const childPath = findById(node.children, id);

      if (childPath) {
        return childPath;
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
        isChecklist: header.isChecklist,
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
      path: [],
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

  assignPaths(roots);

  return roots;
}

function buildTreeFromSubItems(
  items: Item[],
  expanded: string[],
  selectedId: string
): TreeItems {
  const treeItems = buildTreeFromItems(items, expanded);

  const selected = findById(treeItems, selectedId);

  return selected?.children ?? [];
}

export const TreeMapper = {
  buildTreeFromHeaders,
  buildTreeFromItems,
  buildTreeFromSubItems,
};
