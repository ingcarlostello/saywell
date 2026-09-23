import { InstallAppCard } from '../components/InstallAppCard/InstallAppCard';
import { InstallButton } from '../components/InstallButton/InstallButton';
import { InstallSteps } from '../components/InstallSteps/InstallSteps';
import { INSTALL_MODE } from '../constants/installApp.constants';
import { useInstallApp } from '../hooks/useInstallApp';

// `hidden` renders nothing. Accepting the install unmounts the card under the focus: the desktop app window or
// Android's own install UI takes over, and this feature has no other element to move the focus to.
export function InstallAppContainer() {
  const { view } = useInstallApp();
  return (
    <>
      {view.kind === INSTALL_MODE.installable && (
        <InstallAppCard {...view.card}>
          <InstallButton {...view.install} />
        </InstallAppCard>
      )}
      {view.kind === INSTALL_MODE.iosInstructions && (
        <InstallAppCard {...view.card}>
          <InstallSteps steps={view.steps} />
        </InstallAppCard>
      )}
    </>
  );
}
