import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo } from 'react';

import { MOCK_USERS, useModeration, type UserSummary } from '@/lib/domain';

export type ReportListItem = {
  id: string;
  title: string;
  reason: string;
  dateLabel: string;
  statusLabel: string;
  statusTone: 'done' | 'reviewing' | 'pending';
};

export type UseBlockedListScreenReturn = {
  users: UserSummary[];
  reports: ReportListItem[];
  onBack: () => void;
  onUnblock: (user: UserSummary) => void;
};

export function useBlockedListScreen(): UseBlockedListScreenReturn {
  const router = useRouter();
  const { blockedUserIds, unblockUser, reports } = useModeration();

  const users = useMemo(
    () =>
      Array.from(blockedUserIds)
        .map((id) => MOCK_USERS.find((user) => user.id === id))
        .filter(Boolean) as UserSummary[],
    [blockedUserIds],
  );

  const reportItems = useMemo<ReportListItem[]>(
    () =>
      reports.map((report, index) => ({
        id: `${report.kind}-${report.id}-${index}`,
        title: report.kind === 'post' ? '게시글 신고' : '사용자 신고',
        reason: report.reason,
        dateLabel: fmtDate(report.createdAt),
        statusLabel:
          report.status === 'resolved'
            ? '처리 완료'
            : report.status === 'reviewing'
              ? '검토 중'
              : '접수',
        statusTone:
          report.status === 'resolved'
            ? 'done'
            : report.status === 'reviewing'
              ? 'reviewing'
              : 'pending',
      })),
    [reports],
  );

  return {
    users,
    reports: reportItems,
    onBack: () => router.back(),
    onUnblock: (user) =>
      Alert.alert('차단 해제', `${user.name}님을 차단 해제할까요?`, [
        { text: '취소', style: 'cancel' },
        { text: '해제', onPress: () => unblockUser(user.id) },
      ]),
  };
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
