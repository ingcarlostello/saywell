import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { badgeVariants } from './Badge.variants';

export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export type BadgeVariant = NonNullable<BadgeProps['variant']>;
