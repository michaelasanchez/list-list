import { Api } from '.';
import { ApiToken } from '../contracts';

export class UserApi extends Api {
  constructor(token?: string) {
    super('user', token);
  }

  public Login = (authorizationCode: string): Promise<ApiToken> => {
    this.setActionPath('login');
    return this.executePost({ code: authorizationCode });
  };

  public Refresh = (refreshToken: string): Promise<ApiToken> => {
    this.setActionPath('refresh');
    return this.executePost({ token: refreshToken });
  }
}
