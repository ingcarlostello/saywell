export const LANGS = ['es', 'en'] as const;

export const LANG = { es: 'es', en: 'en' } as const;

export const DEFAULT_LANG = LANG.es;

// BCP 47 tags for Intl formatting ('es' + hour12 renders "12:34 p. m." like the mockup).
export const LANG_TAGS = { es: 'es', en: 'en-US' } as const;
