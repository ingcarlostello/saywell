export const THEMES = ['light', 'dark'] as const;

export const THEME = { light: 'light', dark: 'dark' } as const;

export const DEFAULT_THEME = THEME.dark;

// `ui` is duplicated on purpose in the inline script of index.html (runs before React mounts);
// scripts/check-arch.mjs fails if they drift apart.
export const PERSIST_KEYS = { ui: 'saywell:ui' } as const;

export const PERSIST_VERSION = { ui: 1 } as const;
