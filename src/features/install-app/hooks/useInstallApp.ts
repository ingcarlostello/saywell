import { toSupportedLang } from '@/shared/utils/i18n.utils';
import { useUiStore } from '@/store';
import { INSTALL_APP_TEXTS } from '../constants/installApp.constants';
import { toInstallAppView } from '../helpers/installApp.helper';
import type { InstallAppFacade } from '../types/installApp.types';
import { useInstallPrompt } from './useInstallPrompt';

// FACADE: the only door from the UI to the install state. `onInstall` reaches prompt() synchronously.
export function useInstallApp(): InstallAppFacade {
  const lang = toSupportedLang(useUiStore((s) => s.lang));
  const installPrompt = useInstallPrompt();
  return {
    view: toInstallAppView(installPrompt.mode, INSTALL_APP_TEXTS[lang], () => {
      void installPrompt.promptInstall();
    }),
  };
}
