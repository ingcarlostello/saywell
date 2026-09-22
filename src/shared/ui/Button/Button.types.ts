import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { buttonVariants } from './Button.variants';

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}
