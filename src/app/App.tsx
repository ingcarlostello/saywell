import { PreferenceContainer } from '@/features/preference';
import { PronunciationContainer } from '@/features/pronunciation';
import { AppHeader } from './layouts/AppHeader/AppHeader';
import { AppLayout } from './layouts/AppLayout/AppLayout';

// Features are composed here by slot, never through each other. The install card (phase 11) will arrive as
// PronunciationContainer's `aside`.
export function App() {
  return (
    <AppLayout header={<AppHeader actions={<PreferenceContainer />} />}>
      <PronunciationContainer />
    </AppLayout>
  );
}
