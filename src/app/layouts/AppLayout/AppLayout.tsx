import type { AppLayoutProps } from './AppLayout.types';

export function AppLayout({ header, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="mx-auto w-full max-w-7xl flex-1 px-safe pt-6 pb-safe sm:pt-8 lg:pt-10">{children}</main>
    </div>
  );
}
