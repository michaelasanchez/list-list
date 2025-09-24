import { map } from 'lodash';
import { ApiHeader, ApiItem, ApiShareLink } from '../contracts';
import { Header, Item, ShareLink } from '../models';

const mapItem = (item: ApiItem, expanded: string[] = null): Item => ({
  ...item,
  completedOn: item.completedOn,
  expanded: !expanded ? expanded.includes(item.id) : false,
  pending: false,
});

const mapItems = (items: ApiItem[], expanded: string[]): Item[] =>
  items?.map((i) => mapItem(i, expanded)) ?? [];

const mapShareLinks = (links: ApiShareLink[]): ShareLink[] => links ?? [];

const mapHeader = (header: ApiHeader, expanded: string[]): Header => ({
  id: header.id,
  tokens: !!header.token ? [header.token] : null,
  isChecklist: header.checklist,
  isReadonly: header.readonly,
  label: header.label,
  description: header.description,
  order: header.order,
  items: mapItems(header.items, expanded),
  pending: false,
  shareLinks: mapShareLinks(header.shareLinks),
});

const mapHeaders = (headers: ApiHeader[], expanded?: string[]): Header[] =>
  map(headers, (h) => ({
    ...mapHeader(h, expanded),
  }));

export const ListItemMapper = {
  mapItem,
  mapItems,
  mapHeader,
  mapHeaders,
};
