import { Api } from '.';
import { ApiNodePut as ApiItemPut, ApiNode } from '../contracts';
import { ApiNodePatch } from '../contracts/patch/ApiNodePatch';

export class NodeApi extends Api {
  constructor() {
    super('');
  }

  public Complete = (token: string, nodeId: string): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}/complete`);

    return this.executePost(null, null, false);
  };

  public Delete = (token: string, nodeId: string): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}`);

    return this.executeDelete(nodeId);
  };

  public GetById = (token: string, nodeId: string): Promise<ApiNode> => {
    this.setActionPath(`${token}/node/${nodeId}`);

    return this.executeGet();
  };

  public Patch = (
    token: string,
    nodeId: string,
    patch: ApiNodePatch,
    recursive?: boolean,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}`);

    if (recursive) {
      this.setQueryParameters({ recursive });
    }

    return this.executePatch(nodeId, patch);
  };

  public Put = (
    token: string,
    nodeId: string,
    put: ApiItemPut,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}`);

    return this.executePut(put);
  };

  public Relocate = (
    token: string,
    activeId: string,
    overId: string,
    parentId: string,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${activeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };

  public Restore = (
    token: string,
    nodeId: string,
    overId?: string | null,
    parentId?: string | null,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}/restore`);

    return this.executePost({ overId, parentId }, null, false);
  };
}
