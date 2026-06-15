import { AccountSettingsScreenView } from './account-settings-screen.view';
import { useAccountSettingsScreen } from './use-account-settings-screen';

export function AccountSettingsScreen() {
  const asks = useAccountSettingsScreen();
  return <AccountSettingsScreenView {...asks} />;
}
