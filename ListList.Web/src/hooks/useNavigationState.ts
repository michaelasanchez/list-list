import React from 'react';
import { useLocation, useRoute, useSearch } from 'wouter';

interface NavigationState {
  token?: string;
  selectedId?: string;
  queryParams: Record<string, string>;
  // TODO: it would be nice to reign this in a bit
  navigate: (to: string) => void;
  setQueryParams: (patch: Record<string, string | null>) => void;
}

export interface RouteParameters extends Record<string, string | undefined> {}

export function useNavigationState(): NavigationState {
  const [match, params] = useRoute<RouteParameters>('/:token/:selectedId?');

  const [location, navigate] = useLocation();

  const searchString = useSearch();

  // Parse query parameters
  const queryParams = React.useMemo(() => {
    const paramsObj: Record<string, string> = {};
    const searchParams = new URLSearchParams(searchString);

    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value;
    }

    return paramsObj;
  }, [searchString]);

  // Function to update query parameters
  const setQueryParams = React.useCallback(
    (patch: Record<string, string | null>, replace = true) => {
      const searchParams = new URLSearchParams(window.location.search);

      for (const [key, value] of Object.entries(patch)) {
        if (value == null) searchParams.delete(key);
        else searchParams.set(key, value);
      }

      const basePath = location.split('?')[0];
      const newUrl = `${basePath}${
        searchParams.toString() ? '?' + searchParams.toString() : ''
      }`;

      navigate(newUrl, { replace });
    },
    [location, searchString, navigate],
  );

  // Compute derived state
  const navigationState = React.useMemo<NavigationState>(() => {
    return {
      token: match ? params?.token : undefined,
      selectedId: match ? params?.selectedId : undefined,
      queryParams,
      navigate,
      setQueryParams,
    };
  }, [match, params, queryParams, navigate, setQueryParams]);

  return navigationState;
}
