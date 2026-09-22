import { ChevronDownIcon, GlobeIcon } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import type { LanguageSwitcherProps } from './LanguageSwitcher.types';

export function LanguageSwitcher({ value, code, triggerLabel, options }: LanguageSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={triggerLabel}
          className="group h-11.5 gap-1.5 rounded-full bg-background/30 px-2.5 sm:px-4"
        >
          <GlobeIcon className="hidden size-5 sm:block" aria-hidden />
          <span>{code}</span>
          <ChevronDownIcon
            className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id} lang={option.id} onSelect={option.onSelect}>
              {option.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
