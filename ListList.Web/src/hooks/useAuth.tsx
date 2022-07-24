import { useState } from 'react';
import {
  GoogleLoginResponse,
  useGoogleLogin,
  useGoogleLogout,
} from 'react-google-login';
import { GoogleProfile, User } from '../models/auth';
import { config } from '../shared';

export interface useAuthState {
  loading: boolean;
  user: User;
  signIn: () => void;
  signOut: () => void;
}

const getRefreshTiming = (expires_in: any) => {
  return (expires_in || 3600 - 5 * 60) * 1000;
};

const refreshTokenSetup = (res: any) => {
  let refreshTiming = getRefreshTiming(res.tokenObj.expires_in);

  const refreshToken = async () => {
    const newAuthRes = await res.reloadAuthResponse();
    refreshTiming = getRefreshTiming(newAuthRes.expires_in);

    setTimeout(refreshToken, refreshTiming);
  };
};

export const useAuth = (): useAuthState => {
  const [user, setUser] = useState<User>();

  /* Sign in */
  const handleSignInSuccess = (response: GoogleLoginResponse) => {
    const profile = response.profileObj as GoogleProfile;

    setUser({
      username: profile.email.substring(0, profile.email.indexOf('@')),
      tokenId: response.tokenId,
    });

    refreshTokenSetup(response);
  };

  const handleSignInFailure = (response: any) => {
    console.error('[Login failed]:', response);
  };

  const { signIn, loaded: signInLoaded } = useGoogleLogin({
    clientId: config.clientId,
    cookiePolicy: config.cookiePolicy,
    isSignedIn: true,
    onSuccess: handleSignInSuccess,
    onFailure: handleSignInFailure,
    onAutoLoadFinished: (success: boolean) => console.log('[Login finished]:', success),
  });

  /* Sign out */
  const handleSignoutSuccess = (error?: any) => {
    setUser(null);
  };

  const { signOut, loaded: signOutLoaded } = useGoogleLogout({
    clientId: config.clientId,
    onLogoutSuccess: () => handleSignoutSuccess(),
  });

  return {
    loading: !signInLoaded || !signOutLoaded,
    user,
    signIn,
    signOut,
  };
};
