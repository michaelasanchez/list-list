import { Featured, PathItem } from '../components';
import { Props as SortableTreeProps } from '../components/tree/SortableTree';
import { TreeItems } from '../components/tree/types';
import { Header } from '../models';
import { TreeMapper } from '../views';

export interface ViewModel {
  renderKey: string;
  token: string | null;
  headerId: string | null;
  selectedId: string | null;
  featured: Featured | null;
  items: TreeItems | null;
  depth: number;
  path?: PathItem[];
  readonly?: boolean;
  treeProps?: Omit<SortableTreeProps, 'defaultItems'>;
}

function getViewModel(
  token: string,
  selectedId: string,
  headers: Header[],
  expanded: string[]
): ViewModel {
  const header = token
    ? headers.find((h) => h.id === token || h.tokens?.includes(token)) ?? null
    : null;

  if (Boolean(token) && !Boolean(header)) {
    return {
      renderKey: '__not__found__key__',
      depth: -1,
      token: token === undefined ? null : token,
      headerId: null,
      selectedId: null,
      featured: null,
      items: null,
    };
  }

  // Headers (Top-Level)
  if (!Boolean(token)) {
    const items = TreeMapper.buildTreeFromHeaders(
      headers.filter((h) => !h.isNotOwned)
    );

    return {
      renderKey: '__root__key__',
      depth: 0,
      token: null,
      headerId: null,
      selectedId: null,
      featured: null,
      items,
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
  if (!Boolean(selectedId)) {
    const featured = !Boolean(header)
      ? null
      : {
          id: header.id,
          label: header.label,
          description: header.description,
          checklist: header.checklist,
          readonly: header.readonly,
          shareLinks: header.shareLinks,
        };

    const items = TreeMapper.buildTreeFromItems(header?.items, expanded);

    return {
      renderKey: header.id,
      depth: 1,
      readonly: header.readonly,
      token,
      headerId: header.id,
      selectedId: null,
      featured,
      items,
      treeProps,
    };
  }

  // Nested
  const treeResult = TreeMapper.buildTreeFromSubItems(
    header.items ?? [],
    expanded,
    selectedId
  );

  const selected = header.items.find((i) => i.id == selectedId);

  const featured = {
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

export const ViewMapper = {
  map: getViewModel,
};
