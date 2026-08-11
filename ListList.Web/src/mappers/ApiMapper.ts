import { map } from 'lodash';
import { ApiPartition, ApiNode, ApiShareLink } from '../contracts';
import { Header, Item, ShareLink } from '../models';

const mapItem = (item: ApiNode, expanded?: string[]): Item => ({
  ...item,
  completedOn: item.completedOn,
  expanded: expanded ? expanded.includes(item.id) : false,
  pending: false,
});

const mapItems = (items: ApiNode[], expanded?: string[]): Item[] =>
  items?.map((i) => mapItem(i, expanded)) ?? [];

const mapShareLinks = (links: ApiShareLink[]): ShareLink[] => links ?? [];

const mapHeader = (header: ApiPartition, expanded?: string[]): Header => ({
  id: header.id,
  tokens: header.token ? [header.token] : null,
  checklist: header.checklist,
  owned: header.owned,
  readonly: header.readonly,
  label: header.label,
  description: header.description,
  order: header.order,
  items: mapItems(header.items, expanded),
  pending: false,
  shareLinks: mapShareLinks(header.shareLinks),
});

const mapHeaders = (headers: ApiPartition[], expanded?: string[]): Header[] =>
  map(headers, (h) => ({
    ...mapHeader(h, expanded),
  }));

export const ListItemMapper = {
  mapItem,
  mapItems,
  mapHeader,
  mapHeaders,
};
