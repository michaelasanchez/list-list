import { Api } from '.';
import { UserProfile } from '../auth';

export class UserApi extends Api {
  constructor() {
    super('user');
  }

  public Me = (): Promise<UserProfile> => {
    this.setActionPath('me');
    return this.executeGet();
  };

  public Login = (code: string): Promise<UserProfile> => {
    this.setActionPath('login');
    return this.executePost(code);
  };

  public Logout = (): Promise<void> => {
    this.setActionPath('logout');
    return this.executePost();
  };

  public Refresh = (): Promise<void> => {
    this.setActionPath('refresh');
    return this.executePost();
  };
}
