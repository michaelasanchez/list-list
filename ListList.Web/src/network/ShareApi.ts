import { Api } from '.';
import { ApiPartitionShare, ShareResult } from '../contracts';
import { ApiShareLinkPut } from '../contracts/put';

export class ShareApi extends Api {
  constructor() {
    super('share');
  }

  public Delete = (shareLinkId: string): Promise<void> =>
    this.executeDelete(shareLinkId);

  public Put = (shareLinkId: string, put: ApiShareLinkPut): Promise<void> =>
    this.executePut(put, shareLinkId);

  public Share = (
    headerId: string,
    share: ApiPartitionShare
  ): Promise<ShareResult> => {
    this.setActionPath(headerId);

    return this.executePost(share);
  };
}
