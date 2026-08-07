import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useSession } from '@/lib/domain';

const ALARM_QUERY_KEY = ['alarms'] as const;
const CHAT_DEEP_LINK_PATTERN = /^knockinrn:\/\/chat\/([^/?#]+)(?:[?#].*)?$/i;

/**
 * 앱이 열려 있을 때는 알림 데이터만 갱신한다.
 * 백그라운드 알림을 눌러 들어오면 채팅 딥링크는 채팅방으로, 나머지는 알림 목록으로 연결한다.
 */
export function PushNotificationBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const initialMessageHandled = useRef(false);

  useEffect(() => {
    if (!session) return;

    const openNotification = (message: RemoteMessage) => {
      void queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
      const chatRoomPath = chatRoomPathFromMessage(message);
      router.push((chatRoomPath ?? '/notifications') as never);
    };
    const refreshAlarms = () => queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
    let unsubscribeForeground = () => {};
    let unsubscribeOpened = () => {};

    try {
      const messaging = getMessaging();
      unsubscribeForeground = onMessage(messaging, () => {
        // 앱을 보고 있을 때는 iOS와 Android 모두 팝업을 띄우지 않고 알림 목록만 최신화한다.
        void refreshAlarms();
      });
      unsubscribeOpened = onNotificationOpenedApp(messaging, openNotification);

      if (!initialMessageHandled.current) {
        initialMessageHandled.current = true;
        void getInitialNotification(messaging)
          .then((message) => {
            if (message) openNotification(message);
          })
          .catch(() => {});
      }
    } catch {
      // Firebase가 초기화되지 않은 환경에서는 알림 브릿지 없이 앱을 계속 실행한다.
    }

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [queryClient, router, session]);

  return null;
}

function chatRoomPathFromMessage(message: RemoteMessage): string | null {
  for (const value of Object.values(message.data ?? {})) {
    if (typeof value !== 'string') continue;

    const match = CHAT_DEEP_LINK_PATTERN.exec(value.trim());
    if (!match) continue;

    const chatRoomId = decodeURIComponentSafely(match[1]);
    if (!chatRoomId) return null;
    return `/chat/${encodeURIComponent(chatRoomId)}`;
  }

  return null;
}

function decodeURIComponentSafely(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
