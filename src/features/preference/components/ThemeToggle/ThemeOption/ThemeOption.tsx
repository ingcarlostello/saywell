import { Button } from '@/shared/ui';
import type { ThemeOptionProps } from './ThemeOption.types';

// 44 px hit area; `bg-clip-content` + `p-0.5` paints the pressed state as the 40 px disc of the mockup.
export function ThemeOption({ label, isActive, onSelect, icon }: ThemeOptionProps) {
  return (
    <Button
      variant="segment"
      size="icon"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onSelect}
      className="bg-clip-content p-0.5"
    >
      {icon}
    </Button>
  );
}
