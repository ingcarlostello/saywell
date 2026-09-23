import { AppBrand } from './AppBrand/AppBrand';
import type { AppHeaderProps } from './AppHeader.types';

export function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header">
      {/* Fills the iOS status bar area in standalone mode (black-translucent): stays dark in both themes */}
      <div aria-hidden className="bg-status-bar pt-safe" />
      {/* min-h, not h: the row grows with user text spacing (WCAG 1.4.12) instead of clipping the brand. Its
          height is --header-row, which html's scroll-padding-top also reads (index.css) */}
      <div className="mx-auto flex min-h-(--header-row) max-w-7xl items-center justify-between gap-2 px-safe py-2 sm:gap-3">
        <AppBrand />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">{actions}</div>
      </div>
    </header>
  );
}
