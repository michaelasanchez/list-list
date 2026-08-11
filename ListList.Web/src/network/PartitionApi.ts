import { Api } from '.';
import {
  ApiPartition,
  ApiPartitionPatch,
  ApiPartitionRestoral,
  ApiPartitionCreation,
  ApiPartitionPut,
  ApiPartitionRelocation,
  ApiNodeCreation,
} from '../contracts';

export class PartitionApi extends Api {
  constructor() {
    super('partition');
  }

  public CreatePartition = (creation: ApiPartitionCreation): Promise<string> => {
    return this.executePost(creation);
  };

  public CreateNode = (
    partitionId: string,
    creation: ApiNodeCreation
  ): Promise<string> => {
    this.setActionPath(`${partitionId}`);

    return this.executePost(creation);
  };

  public Delete = (partitionId: string): Promise<void> =>
    this.executeDelete(partitionId);

  public GetAll = (): Promise<ApiPartition[]> => {
    this.setActionPath();

    return this.executeGet();
  };

  public Get = (token: string): Promise<ApiPartition> => {
    this.setActionPath(token);

    return this.executeGet();
  };

  public Patch = (id: string, patch: ApiPartitionPatch): Promise<void> => {
    return this.executePatch(id, patch);
  };

  public Put = (id: string, put: ApiPartitionPut): Promise<void> => {
    return this.executePut(put, id);
  };

  public Relocate = (
    partitionId: string,
    relocation: ApiPartitionRelocation
  ): Promise<void> => {
    this.setActionPath(`${partitionId}/relocate`);

    return this.executePost(relocation, null, false);
  };

  public Restore = (
    partitionId: string,
    restoral: ApiPartitionRestoral
  ): Promise<void> => {
    this.setActionPath(`${partitionId}/restore`);

    return this.executePost(restoral, null, false);
  };

  public Update = (id: string, put: ApiPartitionPut): Promise<void> => {
    this.setActionPath(id);

    return this.executePost(put, null, false);
  };
}
