// American English at a learner's pace (1 is the browser's normal rate).
export const SPEECH = { lang: 'en-US', rate: 0.85 } as const;

// Android reports voice languages as `en_US`; BCP 47 (and every other platform) uses `en-US`.
export const VOICE_LANG_SEPARATOR = { android: '_', bcp47: '-' } as const;
