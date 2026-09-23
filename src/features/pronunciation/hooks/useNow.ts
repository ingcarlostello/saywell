import { useEffect, useState } from 'react';
import { DOM_EVENT } from '@/shared/constants/dom.constants';

// The clock the views are derived from (countdown, "Hoy/Ayer"). It also ticks when the page becomes visible:
// a background tab throttles timers, and an installed PWA can be resumed an hour later.
export function useNow(tickMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = (): void => setNow(Date.now());
    const timer = setInterval(tick, tickMs);
    document.addEventListener(DOM_EVENT.visibilityChange, tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener(DOM_EVENT.visibilityChange, tick);
    };
  }, [tickMs]);

  return now;
}
