import { Redirect } from 'expo-router';

/** 이전 알림·딥링크로 들어와도 deprecated 채팅 요청 API를 호출하지 않는다. */
export default function DeprecatedChatRequestRoute() {
  return <Redirect href="/chat" />;
}
