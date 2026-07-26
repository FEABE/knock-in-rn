import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { useSession } from '@/lib/domain';

const ALARM_QUERY_KEY = ['alarms'] as const;

/**
 * FCM은 기기 등록만 해서는 화면에 보이지 않는다.
 * 앱이 열려 있을 때는 직접 알림을 보여주고, 알림을 눌러 들어오면 알림 목록으로 연결한다.
 */
export function PushNotificationBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const initialMessageHandled = useRef(false);

  useEffect(() => {
    if (!session) return;

    const messaging = getMessaging();
    const openNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
      router.push('/notifications');
    };
    const refreshAlarms = () => queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });

    const unsubscribeForeground = onMessage(messaging, (message) => {
      void refreshAlarms();
      const title = message.notification?.title ?? pushText(message.data?.title) ?? '새 알림';
      const body = message.notification?.body ?? pushText(message.data?.body);

      Alert.alert(title, body, [
        { text: '닫기', style: 'cancel' },
        { text: '알림 보기', onPress: openNotifications },
      ]);
    });
    const unsubscribeOpened = onNotificationOpenedApp(messaging, openNotifications);

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

function pushText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
