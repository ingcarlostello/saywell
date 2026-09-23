import type { InstallStepsProps } from './InstallSteps.types';
import { INSTALL_STEP_ICONS } from './InstallSteps.variants';

// role="list": WebKit drops list semantics under list-style:none (Tailwind preflight), and this list only
// renders on iOS. The DOM order is the sequence; the icons are the markers.
export function InstallSteps({ steps }: InstallStepsProps) {
  return (
    <ol role="list" className="flex flex-col gap-2 text-sm">
      {steps.map(({ id, text }) => {
        const Icon = INSTALL_STEP_ICONS[id];
        return (
          <li key={id} className="flex items-start gap-2">
            <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{text}</span>
          </li>
        );
      })}
    </ol>
  );
}
