import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { usePreference } from '../hooks/usePreference';

export function PreferenceContainer() {
  const { language, theme } = usePreference();
  return (
    <>
      <LanguageSwitcher {...language} />
      <ThemeToggle {...theme} />
    </>
  );
}
