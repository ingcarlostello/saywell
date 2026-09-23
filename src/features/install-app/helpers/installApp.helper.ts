import {
  IN_APP_BROWSER_PATTERN,
  INSTALL_MODE,
  INSTALL_STEP,
  IOS_BROWSER_PATTERN,
  IOS_DEVICE_PATTERN,
  IPADOS_MIN_TOUCH_POINTS,
  MAC_DEVICE_PATTERN,
} from '../constants/installApp.constants';
import type {
  BeforeInstallPromptEvent,
  DevicePlatform,
  InstallAppTexts,
  InstallAppView,
  InstallMode,
  InstallModeContext,
} from '../types/installApp.types';

// The listener receives a plain Event (lib.dom does not map `beforeinstallprompt`).
export function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return (
    'prompt' in event &&
    typeof event.prompt === 'function' &&
    'userChoice' in event &&
    event.userChoice instanceof Promise
  );
}

// iOS has no install API: a browser that offers "Add to Home Screen" gets instructions. iPadOS is a Mac with
// touch; in-app browsers (Instagram, Facebook…) lack the action, so they get nothing.
export function supportsAddToHomeScreen({ userAgent, maxTouchPoints }: DevicePlatform): boolean {
  const isAppleTouchDevice =
    IOS_DEVICE_PATTERN.test(userAgent) ||
    (MAC_DEVICE_PATTERN.test(userAgent) && maxTouchPoints >= IPADOS_MIN_TOUCH_POINTS);
  return isAppleTouchDevice && IOS_BROWSER_PATTERN.test(userAgent) && !IN_APP_BROWSER_PATTERN.test(userAgent);
}

// Installed wins; then the real prompt (Chromium, including a Blink browser on iOS); then the iOS steps.
export function toInstallMode({ isStandalone, isInstalled, canPrompt, canAddToHomeScreen }: InstallModeContext): InstallMode {
  if (isStandalone || isInstalled) return INSTALL_MODE.hidden;
  if (canPrompt) return INSTALL_MODE.installable;
  return canAddToHomeScreen ? INSTALL_MODE.iosInstructions : INSTALL_MODE.hidden;
}

// `onInstall` is a closure the facade builds; the helper only places it.
export function toInstallAppView(mode: InstallMode, texts: InstallAppTexts, onInstall: () => void): InstallAppView {
  if (mode === INSTALL_MODE.installable) {
    return {
      kind: INSTALL_MODE.installable,
      card: { title: texts.title, description: texts.description },
      install: { label: texts.installLabel, onInstall },
    };
  }
  if (mode === INSTALL_MODE.iosInstructions) {
    return {
      kind: INSTALL_MODE.iosInstructions,
      card: { title: texts.title, description: texts.iosDescription },
      steps: [
        { id: INSTALL_STEP.share, text: texts.iosShareStep },
        { id: INSTALL_STEP.addToHome, text: texts.iosAddStep },
      ],
    };
  }
  return { kind: INSTALL_MODE.hidden };
}
