import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { inputVariants } from './Input.variants';

// `inputSize` (not `size`) keeps the native <input size> attribute forwardable (§10 LSP).
export interface InputProps extends ComponentProps<'input'>, VariantProps<typeof inputVariants> {}
