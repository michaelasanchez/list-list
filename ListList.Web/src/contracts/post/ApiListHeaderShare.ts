import { SharedPermission } from '../enum';

export interface ApiListHeaderShare {
  token?: string;
  permission: SharedPermission;
  expiresOn?: Date;
}
