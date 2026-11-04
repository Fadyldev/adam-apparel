import { useCallback, useSyncExternalStore } from 'react';

export function usePathname(): string {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('popstate', onChange);
      return () => window.removeEventListener('popstate', onChange);
    },
    () => window.location.pathname,
    () => '/',
  );
}

export function useNavigate() {
  return useCallback((path: string) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0 });
  }, []);
}
