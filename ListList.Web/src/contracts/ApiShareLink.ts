import { SharedPermission } from "./enum";

export interface ApiShareLink {
  id: string;
  token: string;
  permission: SharedPermission;
  expiresOn?: string;
  isActive: boolean;
}