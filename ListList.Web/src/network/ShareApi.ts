import { Api } from '.';
import { ApiListHeaderShare, ShareResult } from '../contracts';

export class ShareApi extends Api {
  constructor(token?: string) {
    super('share', token);
  }

  public Share = (
    headerId: string,
    share: ApiListHeaderShare
  ): Promise<ShareResult> => {
    this.setActionPath(headerId);

    return this.executePost(share);
  };
}
