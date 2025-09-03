import { SharedPermission } from '../enum';

export interface ApiShareLinkPut {
  token: string;
  permission: SharedPermission;
  expiresOn?: string;
  // isActive: boolean;
}
