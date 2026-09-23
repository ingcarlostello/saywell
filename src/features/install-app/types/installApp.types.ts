import type {
  INSTALL_MODE,
  INSTALL_OUTCOME,
  INSTALL_PROMPT_STATUS,
  INSTALL_STEP,
} from '../constants/installApp.constants';

// ── Browser contract (Chromium only; lib.dom has neither the event nor the property) ───────────────────

export type InstallOutcome = (typeof INSTALL_OUTCOME)[keyof typeof INSTALL_OUTCOME];

export interface InstallChoice {
  outcome: InstallOutcome;
  platform: string;
}

// `prompt()` works once per event and only inside a user activation. Chromium also resolves it with the
// choice; `userChoice` is read instead because every implementation has it.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<InstallChoice>;
}

// What the platform check reads; `navigator` satisfies it as is.
export interface DevicePlatform {
  userAgent: string;
  maxTouchPoints: number;
}

// ── Internal hook ──────────────────────────────────────────────────────────────────────────────────────

// No event yet / an event ready to prompt / installed during this visit: mutually exclusive (§13.4).
export type InstallPromptState =
  | { status: typeof INSTALL_PROMPT_STATUS.unavailable }
  | { status: typeof INSTALL_PROMPT_STATUS.ready; event: BeforeInstallPromptEvent }
  | { status: typeof INSTALL_PROMPT_STATUS.installed };

export type InstallMode = (typeof INSTALL_MODE)[keyof typeof INSTALL_MODE];

export interface InstallModeContext {
  isStandalone: boolean;
  isInstalled: boolean;
  canPrompt: boolean;
  canAddToHomeScreen: boolean;
}

export interface InstallPromptController {
  mode: InstallMode;
  promptInstall: () => Promise<void>;
}

// ── Texts and views (facade → container) ───────────────────────────────────────────────────────────────

export interface InstallAppTexts {
  title: string;
  description: string;
  installLabel: string;
  iosDescription: string;
  iosShareStep: string;
  iosAddStep: string;
}

export type InstallStepId = (typeof INSTALL_STEP)[keyof typeof INSTALL_STEP];

export interface InstallCardView {
  title: string;
  description: string;
}

export interface InstallActionView {
  label: string;
  onInstall: () => void;
}

export interface InstallStepView {
  id: InstallStepId;
  text: string;
}

export type InstallAppView =
  | { kind: typeof INSTALL_MODE.installable; card: InstallCardView; install: InstallActionView }
  | { kind: typeof INSTALL_MODE.iosInstructions; card: InstallCardView; steps: readonly InstallStepView[] }
  | { kind: typeof INSTALL_MODE.hidden };

export interface InstallAppFacade {
  view: InstallAppView;
}
