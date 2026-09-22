import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { cardVariants } from './Card.variants';

export interface CardProps extends ComponentProps<'div'>, VariantProps<typeof cardVariants> {}
