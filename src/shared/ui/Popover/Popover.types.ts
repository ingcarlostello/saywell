import type { ComponentProps } from 'react';
import type { Popover as PopoverPrimitive } from 'radix-ui';

export interface PopoverProps extends ComponentProps<typeof PopoverPrimitive.Root> {}

export interface PopoverTriggerProps extends ComponentProps<typeof PopoverPrimitive.Trigger> {}

export interface PopoverContentProps extends ComponentProps<typeof PopoverPrimitive.Content> {}
