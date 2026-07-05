/**
 * 마이페이지/계정 설정 화면용 API 훅.
 */
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from './client';
import { logout, withdraw } from './auth';
import { getProfileAll, updateVisibility } from './profile';
import { getNotificationSettings, updateNotificationSetting } from './notification';
import { getBlocks, getVerifications, unblockUser as unblockUserRequest } from './verification';
import type { AsyncState } from './use-async';
import { useApi } from './use-async';

export type MyPageProfileSummary = {
  roomTypeLabel: string;
  regionLabel: string;
};

export type BlockedUserItem = {
  id: string;
  name: string;
  dateLabel: string;
};

export function useMyPageProfileSummary(enabled = true): AsyncState<MyPageProfileSummary> {
  const state = useApi(['profile', 'all'], () => getProfileAll(), { enabled });
  const summary = useMemo<MyPageProfileSummary | null>(() => {
    if (!state.data) return null;
    const regionLabel = state.data.region
      ?.map((item) => item.region)
      .filter(Boolean)
      .join(', ');
    const roomTypeLabel =
      state.data.roomProfile
        ?.map((item) => item.roomProfileName)
        .filter(Boolean)
        .join(', ') ?? '';

    return {
      roomTypeLabel: roomTypeLabel || (state.data.type === 'SEEKER' ? '방 찾는 중' : '방 있어요'),
      regionLabel: regionLabel || '-',
    };
  }, [state.data]);

  return { ...state, data: summary };
}

export function useMyVerificationSummary(enabled = true): AsyncState<{ verified: boolean }> {
  const state = useApi(['profile', 'verifications'], () => getVerifications(), { enabled });
  const summary = useMemo(
    () =>
      state.data
        ? {
            verified:
              isAccepted(state.data.studentAuth?.isAccepted) ||
              isAccepted(state.data.employeeAuth?.isAccepted),
          }
        : null,
    [state.data],
  );

  return { ...state, data: summary };
}

export function useNotificationSettingToggle(enabled = true) {
  const queryClient = useQueryClient();
  const state = useApi(['profile', 'notification-settings'], () => getNotificationSettings(), {
    enabled,
  });
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const settings = state.data?.alarmsSettings ?? [];
  const serverEnabled = settings.length
    ? settings.some((setting) => isAccepted(setting.isEnable))
    : true;
  const notificationEnabled = optimistic ?? serverEnabled;

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const targets = settings.length ? settings : [{ id: 1, name: '알림', isEnable: true }];
      const requests = targets.flatMap((setting) => {
        const settingId = Number(setting.id);
        return Number.isFinite(settingId) ? [{ settingId, enabled: next }] : [];
      });
      if (!requests.length) {
        throw new Error('알림 설정 ID를 확인하지 못했습니다.');
      }
      return Promise.all(requests.map(updateNotificationSetting));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'notification-settings'] });
    },
  });

  const setNotificationEnabled = useCallback(
    (next: boolean) => {
      setOptimistic(next);
      mutation.mutate(next, {
        onError: () => setOptimistic(null),
      });
    },
    [mutation],
  );

  return {
    notificationEnabled,
    setNotificationEnabled,
    notificationLoading: state.loading || mutation.isPending,
    notificationError: state.error,
    settings,
  };
}

export function useProfileVisibilityToggle() {
  const [profileVisible, setProfileVisibleState] = useState(true);
  const mutation = useMutation({
    mutationFn: (next: boolean) =>
      updateVisibility({
        status: next ? 'PUBLIC' : 'PRIVATE',
      }),
  });

  const setProfileVisible = useCallback(
    (next: boolean) => {
      setProfileVisibleState(next);
      mutation.mutate(next, {
        onError: () => setProfileVisibleState((prev) => !prev),
      });
    },
    [mutation],
  );

  return {
    profileVisible,
    setProfileVisible,
    profileVisibilityLoading: mutation.isPending,
  };
}

export function useBlockedUsers(enabled = Boolean(getAccessToken())): AsyncState<BlockedUserItem[]> {
  const state = useApi(['profile', 'blocks'], () => getBlocks(), { enabled });
  const users = useMemo<BlockedUserItem[] | null>(
    () =>
      state.data?.blocks?.map((block) => ({
        id: String(block.userId ?? ''),
        name: block.name ?? '사용자',
        dateLabel: formatDateLabel(block.createAt),
      })) ?? null,
    [state.data],
  );

  return { ...state, data: users };
}

export function useAccountActions() {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getAccessToken();
      if (!token) return null;
      return logout(token);
    },
  });
  const withdrawMutation = useMutation({
    mutationFn: () => withdraw(),
  });
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => unblockUserRequest(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'blocks'] });
    },
  });

  return {
    requestLogout: async () => {
      const res = await logoutMutation.mutateAsync();
      if (res && (res.status !== 200 || res.error)) {
        throw new Error(res.error?.message ?? '로그아웃에 실패했습니다.');
      }
    },
    requestWithdraw: async () => {
      const res = await withdrawMutation.mutateAsync();
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '탈퇴 처리에 실패했습니다.');
      }
    },
    requestUnblock: async (userId: string) => {
      const res = await unblockMutation.mutateAsync(userId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '차단 해제에 실패했습니다.');
      }
    },
    loggingOut: logoutMutation.isPending,
    withdrawing: withdrawMutation.isPending,
    unblocking: unblockMutation.isPending,
  };
}

function isAccepted(value: string | boolean | undefined): boolean {
  return value === true || value === 'true';
}

function formatDateLabel(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
