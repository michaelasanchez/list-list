import { map } from 'lodash';
import { ApiListHeader, ApiListItem, ApiShareLink } from '../contracts';
import { ListHeader, ListItem, ShareLink } from '../models';

const mapItems = (items: ApiListItem[], expanded: string[]): ListItem[] =>
  items?.map((i) => ({
    ...i,
    expanded: expanded.includes(i.id),
  }));

const mapShareLinks = (links: ApiShareLink[]): ShareLink[] =>
  links?.map((l) => ({
    ...l,
    expiresOn: l.expiresOn ? new Date(l.expiresOn) : null,
  }));

const mapHeader = (header: ApiListHeader, expanded: string[]): ListHeader => ({
  id: header.id,
  tokens: !!header.token ? [header.token] : null,
  isReadOnly: header.isReadOnly,
  label: header.label,
  description: header.description,
  order: header.order,
  items: mapItems(header.items, expanded),
  shareLinks: mapShareLinks(header.shareLinks),
});

const mapHeaders = (
  headers: ApiListHeader[],
  expanded?: string[]
): ListHeader[] =>
  map(headers, (h) => ({
    ...mapHeader(h, expanded),
  }));

export const ListItemMapper = {
  mapHeader,
  mapHeaders,
};
