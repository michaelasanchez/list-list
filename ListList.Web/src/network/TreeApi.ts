import { Api } from '.';
import { Guid } from '../contracts';

export interface TreeNodeRelocation {
  destinationPartitionId: Guid;
  parentId?: Guid | null;
  order: number;
}

export interface TreePartitionPosition {
  order: number;
}

export interface TreePartitionDemotion {
  destinationPartitionId: Guid;
  parentId?: Guid | null;
  order: number;
}

export class TreeApi extends Api {
  constructor() {
    super('tree');
  }

  public RelocateNode = (
    token: string,
    nodeId: Guid,
    relocation: TreeNodeRelocation,
  ): Promise<void> => {
    this.setActionPath(`${token}/node/${nodeId}/relocate`);

    return this.executePost(relocation, null, false);
  };

  public CopyNode = (
    token: string,
    nodeId: Guid,
    relocation: TreeNodeRelocation,
  ): Promise<Guid> => {
    this.setActionPath(`${token}/node/${nodeId}/copy`);

    return this.executePost(relocation, null, true);
  };

  public PromoteNode = (
    token: string,
    nodeId: Guid,
    position: TreePartitionPosition,
  ): Promise<Guid> => {
    this.setActionPath(`${token}/node/${nodeId}/promote`);

    return this.executePost(position, null, true);
  };

  public RelocatePartition = (
    token: string,
    position: TreePartitionPosition,
  ): Promise<void> => {
    this.setActionPath(`${token}/partition/relocate`);

    return this.executePost(position, null, false);
  };

  public CopyPartition = (
    token: string,
    position: TreePartitionPosition,
  ): Promise<Guid> => {
    this.setActionPath(`${token}/partition/copy`);

    return this.executePost(position, null, true);
  };

  public DemotePartition = (
    token: string,
    demotion: TreePartitionDemotion,
  ): Promise<void> => {
    this.setActionPath(`${token}/partition/demote`);

    return this.executePost(demotion, null, false);
  };
}
