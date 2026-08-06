import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { type AlarmItem, useAlarmActions, useAlarms } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goKakaoLogin } from '@/lib/navigation/routes';

export type UseNotificationScreenReturn = {
  alarms: AlarmItem[];
  loading: boolean;
  refreshing: boolean;
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
  const { data, loading, refreshing, error, reload } = useAlarms(isLoggedIn);
  const { markRead, markAllRead, markingRead } = useAlarmActions();
  const alarms = useMemo(
    () => [...(data ?? [])].sort((a, b) => (b.createAt ?? '').localeCompare(a.createAt ?? '')),
    [data],
  );

  // useAlarms는 15초마다 자동 재조회하므로 refreshing을 그대로 쓰면 당겨서 새로고침 스피너가
  // 사용자가 당기지 않아도 주기적으로 깜빡인다. 수동으로 당겼을 때만 표시한다.
  const [manualRefreshing, setManualRefreshing] = useState(false);
  useEffect(() => {
    if (!refreshing) setManualRefreshing(false);
  }, [refreshing]);
  const onManualRefresh = () => {
    setManualRefreshing(true);
    reload();
  };

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
    refreshing: manualRefreshing,
    error,
    isLoggedIn,
    hasUnread: alarms.some((alarm) => !alarm.isRead),
    markingRead,
    onBack: () => router.back(),
    onLogin: () => goKakaoLogin(router),
    onRetry: onManualRefresh,
    onAlarmPress: (alarm) => {
      if (alarm.isRead || alarm.id == null) return;
      void run(() => markRead(String(alarm.id)));
    },
    onReadAll: () => void run(markAllRead),
  };
}
