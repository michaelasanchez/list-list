import { map } from 'lodash';
import { ApiPartition, ApiNode, ApiShareLink } from '../contracts';
import { Partition, Node, ShareLink } from '../models';

const mapItem = (item: ApiNode, expanded?: string[]): Node => ({
  ...item,
  completedOn: item.completedOn,
  expanded: expanded ? expanded.includes(item.id) : false,
  pending: false,
});

const mapNodes = (items: ApiNode[], expanded?: string[]): Node[] =>
  items?.map((i) => mapItem(i, expanded)) ?? [];

const mapShareLinks = (links: ApiShareLink[]): ShareLink[] => links ?? [];

const mapHeader = (header: ApiPartition, expanded?: string[]): Partition => ({
  id: header.id,
  tokens: header.token ? [header.token] : null,
  checklist: header.checklist,
  owned: header.owned,
  readonly: header.readonly,
  label: header.label,
  description: header.description,
  order: header.order,
  nodes: mapNodes(header.nodes, expanded),
  pending: false,
  shareLinks: mapShareLinks(header.shareLinks),
});

const mapHeaders = (headers: ApiPartition[], expanded?: string[]): Partition[] =>
  map(headers, (h) => ({
    ...mapHeader(h, expanded),
  }));

export const ListItemMapper = {
  mapItem,
  mapItems: mapNodes,
  mapHeader,
  mapHeaders,
};
