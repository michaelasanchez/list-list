import { Api } from '.';
import { ApiItem, ApiListItemPut as ApiItemPut } from '../contracts';
import { ApiItemPatch } from '../contracts/patch/ApiItemPatch';
import { ApiListItemCreation } from '../contracts/post/ApiListItemCreation';

export class ListItemApi extends Api {
  constructor(token?: string) {
    super('item', token);
  }

  public Complete = (listItemId: string): Promise<void> => {
    this.setActionPath(`${listItemId}/complete`);

    return this.executePost(null, null, false);
  };

  public Delete = (itemId: string): Promise<void> => {
    return this.executeDelete(itemId);
  };

  public GetById = (itemId: string): Promise<ApiItem> => {
    this.setActionPath(`${itemId}`);

    return this.executeGet();
  };

  public Patch = (
    itemId: string,
    patch: ApiItemPatch,
    recursive?: boolean
  ): Promise<void> => {
    if (recursive) {
      this.setQueryParameters({ recursive });
    }

    return this.executePatch(itemId, patch);
  };

  public Put = (itemId: string, put: ApiItemPut): Promise<void> => {
    return this.executePut(put, itemId);
  };

  public Relocate = (
    activeId: string,
    overId: string,
    parentId: string
  ): Promise<void> => {
    this.setActionPath(`${activeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };
}
