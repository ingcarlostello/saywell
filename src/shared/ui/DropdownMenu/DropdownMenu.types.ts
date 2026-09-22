import type { ComponentProps } from 'react';
import type { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';

export interface DropdownMenuProps extends ComponentProps<typeof DropdownMenuPrimitive.Root> {}

export interface DropdownMenuTriggerProps extends ComponentProps<typeof DropdownMenuPrimitive.Trigger> {}

export interface DropdownMenuContentProps extends ComponentProps<typeof DropdownMenuPrimitive.Content> {}

export interface DropdownMenuRadioGroupProps extends ComponentProps<typeof DropdownMenuPrimitive.RadioGroup> {}

export interface DropdownMenuRadioItemProps extends ComponentProps<typeof DropdownMenuPrimitive.RadioItem> {}
