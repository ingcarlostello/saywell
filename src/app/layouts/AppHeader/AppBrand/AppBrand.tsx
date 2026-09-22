import { APP_BRAND } from '@/app/app.constants';
import { AppLogo } from '../AppLogo/AppLogo';

export function AppBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {/* Below 360 px the name needs the room; the mark is decorative */}
      <AppLogo className="h-9 w-6.5 shrink-0 max-[22.5rem]:hidden sm:h-11 sm:w-8 lg:h-15 lg:w-11" />
      <span className="min-w-0">
        <span className="block text-lg font-bold wrap-break-word sm:text-xl lg:text-2xl">{APP_BRAND.name}</span>
        <span className="block text-sm text-muted-foreground wrap-break-word sm:text-base lg:text-lg">
          {APP_BRAND.tagline}
        </span>
      </span>
    </div>
  );
}
