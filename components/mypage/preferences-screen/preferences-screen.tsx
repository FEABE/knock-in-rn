import { PreferencesScreenView } from './preferences-screen.view';
import { usePreferencesScreen } from './use-preferences-screen';

export function PreferencesScreen() {
  const asks = usePreferencesScreen();
  return <PreferencesScreenView {...asks} />;
}
