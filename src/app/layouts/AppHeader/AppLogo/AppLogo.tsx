import { useId } from 'react';
import type { AppLogoProps } from './AppLogo.types';

// Decorative microphone mark (the brand name next to it carries the meaning). The viewBox is cropped to
// the glyph (32 × 44), so size it at that aspect ratio. public/favicon.svg repeats the glyph with fixed colors.
export function AppLogo(props: AppLogoProps) {
  const gradientId = useId();
  const paint = `url(#${gradientId})`;

  return (
    <svg viewBox="8 2 32 44" fill="none" aria-hidden focusable="false" {...props}>
      <defs>
        {/* userSpaceOnUse: the straight stand strokes have a zero-size bounding box */}
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="24" y1="4" x2="24" y2="44">
          <stop offset="0" style={{ stopColor: 'var(--color-brand-text-from)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-to)' }} />
        </linearGradient>
      </defs>
      <rect x="16" y="4" width="16" height="26" rx="8" fill={paint} />
      <path d="M24 10v10" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 22a14 14 0 0 0 28 0M24 36v7M17 44h14" stroke={paint} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
