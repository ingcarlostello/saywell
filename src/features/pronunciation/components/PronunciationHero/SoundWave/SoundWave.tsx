import { useId } from 'react';
import type { SoundWaveProps } from './SoundWave.types';

// Decorative bars of the mockup: symmetric around the tallest one, violet at the edges and blue in the
// middle. The viewBox is 104 × 100; every bar is centred on y = 50.
export function SoundWave(props: SoundWaveProps) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 104 100" aria-hidden focusable="false" {...props}>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="104" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--color-brand-to)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--color-brand-text-from)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-to)' }} />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        <rect x="0" y="38" width="8" height="24" rx="4" />
        <rect x="16" y="28" width="8" height="44" rx="4" />
        <rect x="32" y="16" width="8" height="68" rx="4" />
        <rect x="48" y="2" width="8" height="96" rx="4" />
        <rect x="64" y="16" width="8" height="68" rx="4" />
        <rect x="80" y="28" width="8" height="44" rx="4" />
        <rect x="96" y="38" width="8" height="24" rx="4" />
      </g>
    </svg>
  );
}
