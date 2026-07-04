import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { type BlockedUserItem, useAccountActions, useBlockedUsers } from '@/lib/api';

export type ReportListItem = {
  id: string;
  title: string;
  reason: string;
  dateLabel: string;
  statusLabel: string;
  statusTone: 'done' | 'reviewing' | 'pending';
};

export type UseBlockedListScreenReturn = {
  users: BlockedUserItem[];
  reports: ReportListItem[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onUnblock: (user: BlockedUserItem) => void;
};

export function useBlockedListScreen(): UseBlockedListScreenReturn {
  const router = useRouter();
  const { data: users, loading, error } = useBlockedUsers();
  const { requestUnblock } = useAccountActions();

  return {
    users: users ?? [],
    reports: [],
    loading,
    error,
    onBack: () => router.back(),
    onUnblock: (user) =>
      Alert.alert('차단 해제', `${user.name}님을 차단 해제할까요?`, [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          onPress: () => {
            void requestUnblock(user.id).catch((unblockError) => {
              Alert.alert(
                '차단 해제 실패',
                unblockError instanceof Error ? unblockError.message : '잠시 후 다시 시도해주세요.',
              );
            });
          },
        },
      ]),
  };
}
