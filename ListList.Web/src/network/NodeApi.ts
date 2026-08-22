import { Api } from '.';
import { ApiNode, ApiNodePatch, ApiNodePut, Guid } from '../contracts';

export class NodeApi extends Api {
  constructor() {
    super('');
  }

  public Complete = (token: string, nodeId: Guid): Promise<void> => {
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
    put: ApiNodePut,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}`);

    return this.executePut(put);
  };

  public Relocate = (
    token: string,
    nodeId: string,
    overId: string,
    parentId: string,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}/relocate`);

    return this.executePost({ overId, parentId }, null, false);
  };

  public Relocate2 = (
    token: string,
    nodeId: string,
    order: number,
    parentId?: Guid | undefined,
    partitionId?: Guid | undefined,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}/relocate2`);

    return this.executePost({ order, parentId, partitionId }, null, false);
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
