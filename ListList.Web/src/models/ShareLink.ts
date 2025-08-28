import { SharedPermission } from "../contracts";

export interface ShareLink {
  id: string;
  token: string;
  permission: SharedPermission;
  isActive: boolean;
  expiresOn?: Date;
}