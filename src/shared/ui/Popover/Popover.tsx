import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/shared/utils/cn.utils';
import type { PopoverContentProps, PopoverProps, PopoverTriggerProps } from './Popover.types';

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

// `collisionPadding` keeps the panel off the screen edges by the page's own 16 px gutter.
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  collisionPadding = 16,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none',
          'focus-visible:outline-none',
          // motion-safe gates the animation itself: a motion-reduce override loses on specificity
          'motion-safe:data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'motion-safe:data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
