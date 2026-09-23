import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DOM_EVENT } from '@/shared/constants/dom.constants';
import {
  INSTALL_OUTCOME,
  INSTALL_PROMPT_STATUS,
  INSTALLED_PROMPT_STATE,
  STANDALONE_QUERY,
  UNAVAILABLE_PROMPT_STATE,
} from '../constants/installApp.constants';
import { isBeforeInstallPromptEvent, supportsAddToHomeScreen, toInstallMode } from '../helpers/installApp.helper';
import type { BeforeInstallPromptEvent, InstallPromptController, InstallPromptState } from '../types/installApp.types';

// Running as the installed app. `navigator.standalone` is iOS-only and not in lib.dom: `in` narrows it, no cast.
const isStandaloneDisplay = (): boolean =>
  window.matchMedia(STANDALONE_QUERY).matches || ('standalone' in navigator && navigator.standalone === true);

// Desktop Chrome moves the page from the tab to the app window (and back): display-mode changes while mounted.
function subscribeToDisplayMode(onChange: () => void): () => void {
  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener(DOM_EVENT.change, onChange);
  return () => query.removeEventListener(DOM_EVENT.change, onChange);
}

export function useInstallPrompt(): InstallPromptController {
  const [state, setState] = useState<InstallPromptState>(UNAVAILABLE_PROMPT_STATE);
  const isPromptingRef = useRef(false);
  const isStandalone = useSyncExternalStore(subscribeToDisplayMode, isStandaloneDisplay);

  useEffect(() => {
    // preventDefault() keeps Chrome Android's mini-infobar from competing with the card. The newest event wins.
    const keepPrompt = (event: Event): void => {
      if (!isBeforeInstallPromptEvent(event)) return;
      event.preventDefault();
      setState({ status: INSTALL_PROMPT_STATUS.ready, event });
    };
    // Fires for every install path: this card, the omnibox icon or the browser menu.
    const markInstalled = (): void => setState(INSTALLED_PROMPT_STATE);
    window.addEventListener(DOM_EVENT.beforeInstallPrompt, keepPrompt);
    window.addEventListener(DOM_EVENT.appInstalled, markInstalled);
    return () => {
      window.removeEventListener(DOM_EVENT.beforeInstallPrompt, keepPrompt);
      window.removeEventListener(DOM_EVENT.appInstalled, markInstalled);
    };
  }, []);

  // Only if it is still the current event: Chrome may already have sent a newer one.
  const discard = (event: BeforeInstallPromptEvent): void =>
    setState((current) =>
      current.status === INSTALL_PROMPT_STATUS.ready && current.event === event ? UNAVAILABLE_PROMPT_STATE : current,
    );

  // prompt() runs synchronously inside the click, before any await: it consumes the user activation. A dismissal
  // keeps the spent event; Chrome sends a fresh one right after, which replaces it without unmounting the card,
  // so the focus stays on the button. A click on the spent event rejects, and that path discards it.
  const promptInstall = async (): Promise<void> => {
    if (state.status !== INSTALL_PROMPT_STATUS.ready || isPromptingRef.current) return;
    const { event } = state;
    isPromptingRef.current = true;
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === INSTALL_OUTCOME.accepted) setState(INSTALLED_PROMPT_STATE);
    } catch (error) {
      // InvalidStateError (event already used) or NotAllowedError (no user activation): reported, never
      // swallowed, and never an unhandled rejection of the facade's `void`ed call.
      reportError(error);
      discard(event);
    } finally {
      isPromptingRef.current = false;
    }
  };

  const mode = toInstallMode({
    isStandalone,
    isInstalled: state.status === INSTALL_PROMPT_STATUS.installed,
    canPrompt: state.status === INSTALL_PROMPT_STATUS.ready,
    canAddToHomeScreen: supportsAddToHomeScreen(navigator),
  });
  return { mode, promptInstall };
}
