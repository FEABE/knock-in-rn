import { Redirect } from 'expo-router';

// 앱 진입(/)을 탐색 탭으로 보낸다. 탭바 기본 화면을 "탐색"으로 통일.
export default function Index() {
  return <Redirect href="/explore" />;
}
