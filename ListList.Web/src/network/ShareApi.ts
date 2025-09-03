import { Api } from '.';
import { ApiHeaderShare, ShareResult } from '../contracts';
import { ApiShareLinkPut } from '../contracts/put';

export class ShareApi extends Api {
  constructor(token?: string) {
    super('share', token);
  }

  public Delete = (shareLinkId: string): Promise<void> =>
    this.executeDelete(shareLinkId);

  public Put = (shareLinkId: string, put: ApiShareLinkPut): Promise<void> =>
    this.executePut(put, shareLinkId);

  public Share = (
    headerId: string,
    share: ApiHeaderShare
  ): Promise<ShareResult> => {
    this.setActionPath(headerId);

    return this.executePost(share);
  };
}
