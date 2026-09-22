import { DEFAULT_LANG, LANGS } from '@/shared/constants/i18n.constants';
import type { Lang } from '@/shared/types/i18n.types';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

// Replaces `{key}` placeholders; unknown keys are left untouched so missing values are visible.
export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(PLACEHOLDER_PATTERN, (placeholder, key: string) => {
    const value = values[key];
    return value === undefined ? placeholder : String(value);
  });
}

// Persisted values come from JSON.parse unvalidated (§12.6 #4); anything unknown falls back to the default,
// like the boot script of index.html does.
export function toSupportedLang(value: unknown): Lang {
  return LANGS.find((lang) => lang === value) ?? DEFAULT_LANG;
}
