import { Card } from '@/shared/ui';
import type { ResultNoticeProps } from './ResultNotice.types';
import { NOTICE_ICONS, noticeIconVariants, noticeVariants } from './ResultNotice.variants';

// No role="alert": the single LiveRegion of the page already announces it.
export function ResultNotice({ tone, title, message, action }: ResultNoticeProps) {
  const Icon = NOTICE_ICONS[tone];
  return (
    <Card padding="lg" className={noticeVariants({ tone })}>
      <span aria-hidden className={noticeIconVariants({ tone })}>
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
        {action}
      </div>
    </Card>
  );
}
