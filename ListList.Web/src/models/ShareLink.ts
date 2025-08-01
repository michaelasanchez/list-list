import { SharedPermission } from "../contracts";

export interface ShareLink {
  id: string;
  token: string;
  permission: SharedPermission;
  expiresOn?: Date;
  isActive: boolean;
}