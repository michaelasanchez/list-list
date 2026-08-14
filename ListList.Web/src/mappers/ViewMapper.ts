import { Featured, PathItem } from '../components';
import { Props as SortableTreeProps } from '../components/tree/SortableTree';
import { TreeItems } from '../components/tree/types';
import { Partition } from '../models';
import { TreeMapper } from '../views';

export interface ViewModel {
  renderKey: string;
  token: string | null;
  partitionId: string | null;
  selectedId: string | null;
  featured: Featured | null;
  items: TreeItems | null;
  depth: number;
  path: PathItem[] | null;
  readonly: boolean | null;
  treeProps: Omit<SortableTreeProps, 'defaultItems'> | null;
}

function map(
  token: string | null,
  selectedId: string | null,
  partitions: Partition[],
  expanded: string[],
): ViewModel {
  const partition = token
    ? (partitions.find((p) => p.id === token || p.tokens?.includes(token)) ??
      null)
    : null;

  // Error state
  // TODO: should we handle this and just direct to top level?
  if (token && !partition) {
    return {
      renderKey: '__not__found__key__',
      token: token === undefined ? null : token,
      partitionId: null,
      selectedId: null,
      featured: null,
      items: null,
      depth: -1,
      path: null,
      readonly: null,
      treeProps: null,
    };
  }

  let treeProps: Omit<SortableTreeProps, 'defaultItems'> = {
    collapsible: true,
    indicator: true,
    removable: true,
  };

  // Headers (Top-Level)
  if (!token) {
    const items = TreeMapper.buildTreeFromHeaders(
      partitions.filter((h) => !h.isNotOwned),
      expanded,
    );

    return {
      renderKey: '__root__key__',
      token: null,
      partitionId: null,
      selectedId: null,
      featured: null,
      items,
      depth: 0,
      path: null,
      readonly: null,
      treeProps,
    };
  }

  treeProps = {
    ...treeProps,
    checklist: partition?.checklist ?? false,
    readonly: partition?.readonly,
  };

  // Surface
  if (!selectedId && partition) {
    const featured = {
      id: partition.id,
      label: partition.label,
      description: partition.description,
      checklist: partition.checklist,
      readonly: partition.readonly,
      shareLinks: partition.shareLinks,
    };

    const nodes = TreeMapper.buildTreeFromItems(partition?.nodes, expanded);

    return {
      renderKey: partition.id,
      token,
      partitionId: partition.id,
      selectedId: null,
      featured,
      items: nodes,
      depth: 1,
      path: null,
      readonly: partition.readonly,
      treeProps,
    };
  }

  // Nested
  if (partition) {
    const treeResult = TreeMapper.buildTreeFromSubItems(
      partition.nodes,
      expanded,
      selectedId,
    );

    const node = partition.nodes.find((i) => i.id == selectedId);

    if (treeResult && node) {
      const featured: Featured = {
        id: node.id,
        label: node.label,
        description: node.description,
        checklist: partition.checklist,
        readonly: partition.readonly,
        shareLinks: partition.shareLinks,
      };

      const path = [
        { icon: 'home' } as PathItem,
        { headerId: partition.id, label: partition.label },
        ...treeResult.path.map((p) => ({
          ...p,
          headerId: partition.id,
        })),
      ];

      path.pop();

      return {
        renderKey: node.id,
        depth: node.depth + 2,
        readonly: partition.readonly,
        token,
        partitionId: partition.id,
        selectedId: node.id,
        featured,
        items: treeResult.items,
        path,
        treeProps,
      };
    }
  }

  return {
    renderKey: '',
    token: null,
    partitionId: null,
    selectedId: null,
    featured: null,
    items: null,
    depth: 0,
    path: null,
    readonly: null,
    treeProps: null,
  };
}

export const ViewMapper = {
  map,
};
