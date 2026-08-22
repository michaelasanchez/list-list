import { PathItem } from '../components';
import { TreeItem, TreeItems } from '../components/tree/types';
import { Guid } from '../contracts';
import { Node, Partition } from '../models';

interface TreeItemWithParentId extends TreeItem {
  parentId: string | null;
}

function toPathItem(treeItem: TreeItem): PathItem {
  return {
    selectedId: treeItem.id as string,
    label: treeItem.data.label,
  };
}

function findById(
  tree: TreeItems,
  id: Guid,
): { item: TreeItem | null; path: PathItem[] } {
  for (const node of tree) {
    if (node.id === id) {
      return {
        item: node,
        path: [toPathItem(node)],
      };
    }

    if (node.children?.length) {
      const result = findById(node.children, id);

      if (result) {
        return {
          item: result.item,
          path: [toPathItem(node), ...result.path],
        };
      }
    }
  }

  return { item: null, path: [] };
}

function buildTreeFromHeaders(
  headers: Partition[],
  expanded: string[],
): TreeItems {
  return (
    headers.map<TreeItem>((partition) => ({
      id: partition.id,
      collapsed: !expanded.includes(partition.id),
      children: buildTreeFromItems(partition.nodes, expanded),
      data: {
        partitionId: partition.id,
        label: partition.label,
        description: partition.description,
        isChecklist: partition.checklist,
        index: partition.order,
      },
      pending: partition.pending,
    })) ?? []
  );
}

function buildTreeFromItems(
  items: Node[] | undefined,
  expanded: string[],
): TreeItems {
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
        partitionId: i.partitionId,
        label: i.label,
        description: i.description,
        complete: i.complete,
        completedOn: i.completedOn,
        index: i.index,
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
  items: Node[],
  expanded: string[],
  selectedId: string | null,
): { items: TreeItems; path: PathItem[] } | null {
  const treeItems = buildTreeFromItems(items, expanded);

  const selected = findById(treeItems, selectedId ?? '');

  return { items: selected.item?.children ?? [], path: selected.path };
}

export const TreeMapper = {
  buildTreeFromHeaders,
  buildTreeFromItems,
  buildTreeFromSubItems,
  // TODO: UTILITY
  findById,
};
