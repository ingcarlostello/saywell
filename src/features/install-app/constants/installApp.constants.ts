import type { Localized } from '@/shared/types/i18n.types';
import type { InstallAppTexts, InstallPromptState } from '../types/installApp.types';

export const INSTALL_MODE = { installable: 'installable', iosInstructions: 'ios-instructions', hidden: 'hidden' } as const;

export const INSTALL_PROMPT_STATUS = { unavailable: 'unavailable', ready: 'ready', installed: 'installed' } as const;

export const INSTALL_OUTCOME = { accepted: 'accepted', dismissed: 'dismissed' } as const;

export const INSTALL_STEP = { share: 'share', addToHome: 'add-to-home' } as const;

export const UNAVAILABLE_PROMPT_STATE = {
  status: INSTALL_PROMPT_STATUS.unavailable,
} as const satisfies InstallPromptState;

export const INSTALLED_PROMPT_STATE = {
  status: INSTALL_PROMPT_STATUS.installed,
} as const satisfies InstallPromptState;

// The manifest (phase 12) declares display: 'standalone' and no display_override. `fullscreen` stays out: it
// also matches a normal tab while the Fullscreen API is active.
export const STANDALONE_QUERY = '(display-mode: standalone)';

// iPadOS Safari identifies as a Mac; only touch tells them apart (Macs report 0 touch points).
export const IOS_DEVICE_PATTERN = /iPhone|iPad|iPod/;
export const MAC_DEVICE_PATTERN = /Macintosh/;
export const IPADOS_MIN_TOUCH_POINTS = 2;

// Safari, Chrome (CriOS), Firefox (FxiOS) and Edge (EdgiOS) carry the token and offer "Add to Home Screen"; a
// bare WKWebView (most in-app browsers) does not.
export const IOS_BROWSER_PATTERN = /Safari\//;

// Since iOS 16.4 "Add to Home Screen" is only in Safari and in apps with the web-browser entitlement (CriOS,
// FxiOS, EdgiOS): any other app whose web view still appends the Safari token is excluded by name.
export const IN_APP_BROWSER_PATTERN =
  /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|musical_ly|BytedanceWebview|Line\/|Snapchat|GSA\//;

// iOS labels: "Agregar a Inicio" (Latin America) and "Añadir a pantalla de inicio" (Spain); an iPhone in English
// shows "Add to Home Screen" even to an ES user, and the Share icon of the step still leads there. No "⋯"
// glyph: VoiceOver reads it as "midline horizontal ellipsis".
export const INSTALL_APP_TEXTS = {
  es: {
    title: 'Instala la app',
    description: 'Ábrela desde tu pantalla de inicio o tu escritorio, como una app más.',
    installLabel: 'Instalar app',
    iosDescription: 'Así la agregas a tu pantalla de inicio:',
    iosShareStep: 'Toca Compartir (si no lo ves, está en el menú de tres puntos).',
    iosAddStep: 'Busca “Agregar a Inicio” (o “Añadir a pantalla de inicio”) y confirma.',
  },
  en: {
    title: 'Install the app',
    description: 'Open it from your home screen or desktop, like any other app.',
    installLabel: 'Install app',
    iosDescription: "Here's how to add it to your Home Screen:",
    iosShareStep: "Tap Share (if you don't see it, it's in the three-dot menu).",
    iosAddStep: 'Find “Add to Home Screen” in the list and confirm.',
  },
} as const satisfies Localized<InstallAppTexts>;
