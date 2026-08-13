import { Featured, PathItem } from '../components';
import { Props as SortableTreeProps } from '../components/tree/SortableTree';
import { TreeItems } from '../components/tree/types';
import { Partition } from '../models';
import { TreeMapper } from '../views';

export interface ViewModel {
  renderKey: string;
  token: string | null;
  headerId: string | null;
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
  headers: Partition[],
  expanded: string[],
): ViewModel {
  const header = token
    ? (headers.find((h) => h.id === token || h.tokens?.includes(token)) ?? null)
    : null;

  // Error states
  if (token && !header) {
    return {
      renderKey: '__not__found__key__',
      token: token === undefined ? null : token,
      headerId: null,
      selectedId: null,
      featured: null,
      items: null,
      depth: -1,
      path: null,
      readonly: null,
      treeProps: null,
    };
  }

  // Headers (Top-Level)
  if (!token) {
    const items = TreeMapper.buildTreeFromHeaders(
      headers.filter((h) => !h.isNotOwned),
    );

    return {
      renderKey: '__root__key__',
      token: null,
      headerId: null,
      selectedId: null,
      featured: null,
      items,
      depth: 0,
      path: null,
      readonly: null,
      treeProps: null,
    };
  }

  const treeProps: Omit<SortableTreeProps, 'defaultItems'> = {
    collapsible: true,
    indicator: true,
    removable: true,
    checklist: header?.checklist ?? false,
    readonly: header?.readonly,
  };

  // Surface
  if (!selectedId && header) {
    const featured = {
      id: header.id,
      label: header.label,
      description: header.description,
      checklist: header.checklist,
      readonly: header.readonly,
      shareLinks: header.shareLinks,
    };

    const nodes = TreeMapper.buildTreeFromItems(header?.nodes, expanded);

    return {
      renderKey: header.id,
      token,
      headerId: header.id,
      selectedId: null,
      featured,
      items: nodes,
      depth: 1,
      path: null,
      readonly: header.readonly,
      treeProps,
    };
  }

  // Nested
  if (header) {
    const treeResult = TreeMapper.buildTreeFromSubItems(
      header.nodes,
      expanded,
      selectedId,
    );

    const selected = header.nodes.find((i) => i.id == selectedId);

    if (treeResult && selected) {
      const featured: Featured = {
        id: selected.id,
        label: selected.label,
        description: selected.description,
        checklist: header.checklist,
        readonly: header.readonly,
        shareLinks: header.shareLinks,
      };

      const path = [
        { icon: 'home' } as PathItem,
        { headerId: header.id, label: header.label },
        ...treeResult.path.map((p) => ({ ...p, headerId: header.id })),
      ];

      path.pop();

      return {
        renderKey: selected.id,
        depth: selected.depth + 2,
        readonly: header.readonly,
        token,
        headerId: header.id,
        selectedId: selected.id,
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
    headerId: null,
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
