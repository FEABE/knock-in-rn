import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type AlarmItem,
  type AlarmListData,
  getAlarms,
  readAlarm,
  readAllAlarms,
} from './notification';
import { type AsyncState, useApi } from './use-async';

const ALARM_QUERY_KEY = ['alarms'] as const;

export function useAlarms(enabled = true): AsyncState<AlarmItem[]> {
  const state = useApi(ALARM_QUERY_KEY, () => getAlarms(), { enabled });
  return { ...state, data: state.data?.alarms ?? null };
}

export function useAlarmActions() {
  const queryClient = useQueryClient();
  const readMutation = useMutation({ mutationFn: readAlarm });
  const readAllMutation = useMutation({ mutationFn: readAllAlarms });

  const updateCachedAlarms = (update: (alarm: AlarmItem) => AlarmItem) => {
    queryClient.setQueryData<AlarmListData>(ALARM_QUERY_KEY, (current) => ({
      ...current,
      alarms: current?.alarms?.map(update) ?? [],
    }));
  };

  return {
    markRead: async (id: string) => {
      updateCachedAlarms((alarm) => (String(alarm.id) === id ? { ...alarm, isRead: true } : alarm));
      const res = await readMutation.mutateAsync(id);
      if (res.status !== 200 || res.error) {
        await queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
        throw new Error(res.error?.message ?? '알림을 읽음 처리하지 못했습니다.');
      }
    },
    markAllRead: async () => {
      updateCachedAlarms((alarm) => ({ ...alarm, isRead: true }));
      const res = await readAllMutation.mutateAsync();
      if (res.status !== 200 || res.error) {
        await queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
        throw new Error(res.error?.message ?? '알림을 모두 읽음 처리하지 못했습니다.');
      }
    },
    markingRead: readMutation.isPending || readAllMutation.isPending,
  };
}
