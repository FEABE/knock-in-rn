import { MyPageHomeScreenView } from './mypage-home-screen.view';
import { useMyPageHomeScreen } from './use-mypage-home-screen';

export function MyPageHomeScreen() {
  const asks = useMyPageHomeScreen();
  return <MyPageHomeScreenView {...asks} />;
}
