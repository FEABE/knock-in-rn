import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import {
  getMyReports,
  type BlockedUserItem,
  useAccountActions,
  useApi,
  useBlockedUsers,
} from '@/lib/api';

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
  const reportsState = useApi(['profile', 'reports'], () => getMyReports());
  const { requestUnblock } = useAccountActions();

  return {
    users: users ?? [],
    reports:
      reportsState.data?.reports?.map((report) => ({
        id: String(report.id ?? ''),
        title: report.title ?? '신고',
        reason: report.reason ?? '',
        dateLabel: formatDate(report.createdAt),
        statusLabel: reportStatusLabel(report.status),
        statusTone: reportStatusTone(report.status),
      })) ?? [],
    loading: loading || reportsState.loading,
    error: error ?? reportsState.error,
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

function reportStatusLabel(status?: 'PENDING' | 'NOACTION' | 'SUSPENDED' | 'HIDDEN') {
  if (status === 'NOACTION') return '조치 없음';
  if (status === 'SUSPENDED') return '이용 정지';
  if (status === 'HIDDEN') return '숨김 처리';
  return '검토중';
}

function reportStatusTone(
  status?: 'PENDING' | 'NOACTION' | 'SUSPENDED' | 'HIDDEN',
): ReportListItem['statusTone'] {
  if (status === 'PENDING') return 'reviewing';
  return 'done';
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
