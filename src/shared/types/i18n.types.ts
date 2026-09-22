import type { LANGS } from '@/shared/constants/i18n.constants';

export type Lang = (typeof LANGS)[number];

export type Localized<T> = Readonly<Record<Lang, T>>;
