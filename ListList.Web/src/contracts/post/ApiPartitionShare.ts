import { SharedPermission } from '../enum';

export interface ApiPartitionShare {
  token?: string;
  permission: SharedPermission;
  expiresOn?: string;
}
