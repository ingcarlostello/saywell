import { MoonIcon, SunIcon } from 'lucide-react';
import { ThemeOption } from './ThemeOption/ThemeOption';
import type { ThemeToggleProps } from './ThemeToggle.types';

export function ThemeToggle({ groupLabel, options }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="inline-flex items-center rounded-full border border-border bg-background/30"
    >
      <ThemeOption {...options.light} icon={<SunIcon className="size-5" aria-hidden />} />
      <ThemeOption {...options.dark} icon={<MoonIcon className="size-5" aria-hidden />} />
    </div>
  );
}
