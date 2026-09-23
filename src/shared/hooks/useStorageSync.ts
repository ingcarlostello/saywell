import { useEffect } from 'react';
import { DOM_EVENT } from '@/shared/constants/dom.constants';

// The store is passed whole and `persist` is read only inside the listener: zustand leaves it undefined
// (whatever its types say) when createJSONStorage cannot reach localStorage — blocked site data, a sandboxed
// iframe — and the store then runs in memory only.
interface PersistedStore {
  persist?: { rehydrate: () => unknown };
}

// zustand's persist reads localStorage once, at import. Another tab (or the installed PWA next to a browser
// tab) writing the same key would otherwise be overwritten by this tab's stale copy on its next write.
export function useStorageSync(key: string, store: PersistedStore): void {
  useEffect(() => {
    const reloadOnChange = (event: StorageEvent): void => {
      if (event.key === key) void store.persist?.rehydrate();
    };
    window.addEventListener(DOM_EVENT.storage, reloadOnChange);
    return () => window.removeEventListener(DOM_EVENT.storage, reloadOnChange);
  }, [key, store]);
}
