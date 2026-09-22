import { PreferenceContainer } from '@/features/preference';
import { AppHeader } from './layouts/AppHeader/AppHeader';
import { AppLayout } from './layouts/AppLayout/AppLayout';

export function App() {
  return <AppLayout header={<AppHeader actions={<PreferenceContainer />} />} />;
}
