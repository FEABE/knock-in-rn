import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert } from 'react-native';

import { type AlarmItem, useAlarmActions, useAlarms } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goKakaoLogin } from '@/lib/navigation/routes';

export type UseNotificationScreenReturn = {
  alarms: AlarmItem[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  hasUnread: boolean;
  markingRead: boolean;
  onBack: () => void;
  onLogin: () => void;
  onRetry: () => void;
  onAlarmPress: (alarm: AlarmItem) => void;
  onReadAll: () => void;
};

export function useNotificationScreen(): UseNotificationScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const isLoggedIn = Boolean(session);
  const { data, loading, error, reload } = useAlarms(isLoggedIn);
  const { markRead, markAllRead, markingRead } = useAlarmActions();
  const alarms = useMemo(
    () => [...(data ?? [])].sort((a, b) => (b.createAt ?? '').localeCompare(a.createAt ?? '')),
    [data],
  );

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (actionError) {
      Alert.alert(
        '알림 처리 실패',
        actionError instanceof Error ? actionError.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  return {
    alarms,
    loading,
    error,
    isLoggedIn,
    hasUnread: alarms.some((alarm) => !alarm.isRead),
    markingRead,
    onBack: () => router.back(),
    onLogin: () => goKakaoLogin(router),
    onRetry: reload,
    onAlarmPress: (alarm) => {
      if (alarm.isRead || alarm.id == null) return;
      void run(() => markRead(String(alarm.id)));
    },
    onReadAll: () => void run(markAllRead),
  };
}
