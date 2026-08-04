import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useSession } from '@/lib/domain';

const ALARM_QUERY_KEY = ['alarms'] as const;

/**
 * 앱이 열려 있을 때는 알림 데이터만 갱신한다.
 * 백그라운드 알림을 눌러 들어오면 알림 목록으로 연결한다.
 */
export function PushNotificationBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const initialMessageHandled = useRef(false);

  useEffect(() => {
    if (!session) return;

    const openNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
      router.push('/notifications');
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
      unsubscribeOpened = onNotificationOpenedApp(messaging, openNotifications);

      if (!initialMessageHandled.current) {
        initialMessageHandled.current = true;
        void getInitialNotification(messaging)
          .then((message) => {
            if (message) openNotifications();
          })
          .catch((error: unknown) => {
            if (__DEV__) {
              console.warn('[push] failed to read initial notification', pushErrorMessage(error));
            }
          });
      }
    } catch (error: unknown) {
      if (__DEV__) {
        console.warn('[push] notification bridge is unavailable', pushErrorMessage(error));
      }
    }

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [queryClient, router, session]);

  return null;
}

function pushErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown } | null;
  return typeof candidate?.message === 'string' ? candidate.message : '알 수 없는 오류';
}
