import { Api } from '.';
import { ApiItem, ApiListItemPut as ApiItemPut } from '../contracts';
import { ApiItemPatch } from '../contracts/patch/ApiItemPatch';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('', token);
  }

  public Complete = (token: string, itemId: string): Promise<void> => {
    this.setActionPath(`${token}/item/${itemId}/complete`);

    return this.executePost(null, null, false);
  };

  public Delete = (token: string, itemId: string): Promise<void> => {
    this.setActionPath(`${token}/item/${itemId}`);

    return this.executeDelete(itemId);
  };

  public GetById = (token: string, itemId: string): Promise<ApiItem> => {
    this.setActionPath(`${token}/item/${itemId}`);

    return this.executeGet();
  };

  public Patch = (
    token: string,
    itemId: string,
    patch: ApiItemPatch,
    recursive?: boolean
  ): Promise<void> => {
    this.setActionPath(`${token}/item/${itemId}`);

    if (recursive) {
      this.setQueryParameters({ recursive });
    }

    return this.executePatch(itemId, patch);
  };

  public Put = (
    token: string,
    itemId: string,
    put: ApiItemPut
  ): Promise<void> => {
    this.setActionPath(`${token}/item/${itemId}`);

    return this.executePut(put, itemId);
  };

  public Relocate = (
    token: string,
    activeId: string,
    overId: string,
    parentId: string
  ): Promise<void> => {
    this.setActionPath(`${token}/item/${activeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };

  public Restore = (
    token: string,
    itemId: string,
    overId: string,
    parentId: string
  ): Promise<void> => {
    this.setActionPath(`${token}/item/${itemId}/restore`);

    return this.executePost({ overId, parentId }, null, false);
  };
}
