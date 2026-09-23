import { InstallAppContainer } from '@/features/install-app';
import { PreferenceContainer } from '@/features/preference';
import { PronunciationContainer } from '@/features/pronunciation';
import { AppHeader } from './layouts/AppHeader/AppHeader';
import { AppLayout } from './layouts/AppLayout/AppLayout';

// Features are composed here by slot, never through each other: the install card is PronunciationContainer's
// `aside`, under the history.
export function App() {
  return (
    <AppLayout header={<AppHeader actions={<PreferenceContainer />} />}>
      <PronunciationContainer aside={<InstallAppContainer />} />
    </AppLayout>
  );
}
