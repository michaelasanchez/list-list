import { useEffect, useState } from 'react';
import { useLocalStorage } from '.';
import { ApiToken, AuthorizationCodeReponse } from '../contracts';
import { Payload } from '../models';
import { UserApi } from '../network';

const DEBUG = false;
const VERBOSE = true;

const debug = (message: string, obj?: any) =>
  DEBUG &&
  (Boolean(obj) && VERBOSE ? console.log(message, obj) : console.log(message));

declare global {
  interface Window {
    google: any;
  }
}

export interface AuthState {
  authenticated: boolean;
  initialized: boolean;
  loading: boolean;
  token?: string;
  picture?: string;
  login?: () => void;
  logout?: () => void;
  refresh?: () => void;
}
// in seconds
const refreshThreshold = 5 * 60;

const expiresWithinThreshold = (expiry: Date, threshold: number): boolean => {
  const now = new Date();
  const remaining = (expiry.getTime() - now.getTime()) / 1000;

  return remaining < threshold;
};

const parseJwt = (token: string): Payload => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload) as Payload;
};

const userApi = new UserApi();

export const useAuth = (clientId: string) => {
  const tokenStorage = useLocalStorage('ll-token');

  const [state, setState] = useState<AuthState>({
    authenticated: false,
    initialized: false,
    loading: false,
  });

  // Try to restore previous session exists
  useEffect(() => refresh(), []);

  // Initialize code client when google script has loaded
  useEffect(() => {
    if (window.google) {
      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        // NOTE: userinfo.profile if no email is needed
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
        ux_mode: 'popup',
        // TODO: does this need error handling? (probably)
        callback: (response: AuthorizationCodeReponse) => {
          debug('CALLBACK', response);

          setState((s) => ({ ...s, loading: true }));

          userApi.Login(response.code).then((token: ApiToken) => {
            const tokenString = JSON.stringify(token);
            tokenStorage.commit(tokenString);

            const parsedToken = parseJwt(token.idToken);

            debug('LOGIN', parsedToken);

            setState((s) => ({
              ...s,
              authenticated: true,
              loading: false,
              token: token.idToken,
              picture: parsedToken.picture,
            }));
          });
        },
      });

      debug('INIT', state);

      setState((s) => ({
        ...s,
        initialized: true,
        login: () => codeClient.requestCode(),
        logout,
      }));
    }
  }, [window.google]);

  // Check if token is near expiration every minute
  useEffect(() => {
    if (state.authenticated) {
      const intervalId = setInterval(() => refresh(), 60000);

      return () => clearInterval(intervalId);
    }
  }, [state.authenticated]);

  const logout = () => {
    localStorage.clear();

    debug('LOGOUT', state);

    setState((s) => ({
      ...s,
      authenticated: false,
      token: null,
    }));
  };

  const refresh = () => {
    if (tokenStorage.exists()) {
      const storedTokenString = tokenStorage.fetch();
      const storedToken = JSON.parse(storedTokenString) as ApiToken;

      const isStale =
        !storedToken.expiry ||
        expiresWithinThreshold(new Date(storedToken.expiry), refreshThreshold);

      if (isStale) {
        debug('IS STALE', storedToken);

        setState((s) => ({ ...s, loading: true }));

        userApi
          .Refresh(storedToken.refreshToken)
          .then((token: ApiToken) => {
            const refreshedToken = {
              idToken: token.idToken,
              expiry: token.expiry,
              refreshToken: storedToken.refreshToken,
            };

            const tokenString = JSON.stringify(refreshedToken);
            tokenStorage.commit(tokenString);

            const parsedToken = parseJwt(storedToken.idToken);

            debug('REFRESHED', parsedToken);

            setState((s) => ({
              ...s,
              authenticated: true,
              loading: false,
              token: token.idToken,
              picture: parsedToken.picture ?? state.picture,
            }));
          })
          .catch((e) => {
            debug('ERROR', e);

            setState((s) => ({
              ...s,
              authenticated: false,
              loading: false,
              token: null,
            }));
          });
      } else {
        const parsedToken = parseJwt(storedToken.idToken);

        debug('RECOVERED (FROM CACHE)', parsedToken);

        setState((s) => ({
          ...s,
          authenticated: true,
          loading: false,
          token: storedToken.idToken,
          picture: parsedToken.picture,
        }));
      }
    }
  };

  return state;
};
