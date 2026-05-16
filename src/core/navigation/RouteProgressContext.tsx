import { createContext, useContext } from 'react';

interface RouteProgressContextValue {
  isNavigating: boolean;
}

export const RouteProgressContext = createContext<RouteProgressContextValue>({
  isNavigating: false,
});

export function useRouteProgress() {
  return useContext(RouteProgressContext);
}
