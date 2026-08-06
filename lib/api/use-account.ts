/**
 * 마이페이지/계정 설정 화면용 API 훅.
 */
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  EMBEDDED_PREFERENCE_PRIORITIES,
  embeddedPriorityIdFromLabel,
} from '@/lib/domain/preference-priorities';

import { getAccessToken } from './client';
import { formatKstDateLabel, parseServerDate } from './date-time';
import { logout, withdraw } from './auth';
import { getPreferenceAll, getProfileAll, updateVisibility } from './profile';
import { getNotificationSettings, updateNotificationSetting } from './notification';
import {
  blockUser as blockUserRequest,
  getBlocks,
  getVerifications,
  unblockUser as unblockUserRequest,
} from './verification';
import type { AsyncState } from './use-async';
import { useApi } from './use-async';

export type MyPageProfileSummary = {
  roomTypeLabel: string;
  regionLabel: string;
};

export type BlockedUserItem = {
  id: string;
  userId: string;
  name: string;
  dateLabel: string;
};

export function useMyPageProfileSummary(enabled = true): AsyncState<MyPageProfileSummary> {
  const state = useApi(['profile', 'all'], () => getProfileAll(), { enabled, retry: false });
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
      roomTypeLabel:
        roomTypeLabel ||
        (state.data.type === 'SEEKER'
          ? '방 찾는 중'
          : state.data.type === 'OFFER'
            ? '방 있음'
            : '방 없음'),
      regionLabel: regionLabel || '-',
    };
  }, [state.data]);

  return { ...state, data: summary };
}

/** 생활패턴/선호조건 한 줄. `id`는 매칭된 내장 우선순위 키(sleep/cleanliness/…)다. */
export type LifestyleSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type MyLifestyleOverview = {
  /** 내 생활패턴 (GET /users/me/profile/all). */
  lifestyles: LifestyleSummaryItem[];
  /** 선호 룸메이트 조건 (GET /users/me/preferences/all → lifestyles). */
  preferredLifestyles: LifestyleSummaryItem[];
  /** 중요 조건 (GET /users/me/preferences/all → conditions). */
  importantConditions: string[];
};

type RawLifestyleItem = {
  lifestyleId?: number;
  name?: string;
  value?: string;
  description?: string;
};

const PRIORITY_ORDER: readonly string[] = EMBEDDED_PREFERENCE_PRIORITIES.map(
  (priority) => priority.value,
);

/**
 * 내 생활패턴 + 선호 룸메이트 조건 조회.
 *
 * 세션(`session.user.lifestyle`)에는 생활패턴이 담기지 않으므로, 프로필 요약이
 * 필요한 화면은 이 훅으로 서버에서 직접 읽어야 한다.
 */
export function useMyLifestyleOverview(
  enabled = Boolean(getAccessToken()),
): AsyncState<MyLifestyleOverview> {
  const profile = useApi(['profile', 'all'], () => getProfileAll(), { enabled, retry: false });
  const preference = useApi(['profile', 'preferences', 'all'], () => getPreferenceAll(), {
    enabled,
    retry: false,
  });

  const overview = useMemo<MyLifestyleOverview | null>(() => {
    if (!profile.data && !preference.data) return null;
    return {
      lifestyles: toLifestyleSummaryItems(profile.data?.lifestyles),
      preferredLifestyles: toLifestyleSummaryItems(preference.data?.lifestyles),
      importantConditions: (preference.data?.conditions ?? []).flatMap((condition) => {
        const name = condition.name?.trim();
        return name ? [name] : [];
      }),
    };
  }, [preference.data, profile.data]);

  const { reload: reloadProfile } = profile;
  const { reload: reloadPreference } = preference;
  const reload = useCallback(() => {
    reloadProfile();
    reloadPreference();
  }, [reloadPreference, reloadProfile]);

  return {
    data: overview,
    loading: profile.loading || preference.loading,
    refreshing: profile.refreshing || preference.refreshing,
    error: profile.error ?? preference.error,
    reload,
  };
}

/** 서버 생활패턴 항목을 화면용 라벨/값으로 정규화하고 온보딩 질문 순서대로 정렬한다. */
function toLifestyleSummaryItems(items?: RawLifestyleItem[]): LifestyleSummaryItem[] {
  return (items ?? [])
    .flatMap((item) => {
      const label = item.name?.trim();
      if (!label) return [];
      const value = item.description?.trim() || item.value?.trim();
      if (!value) return [];
      return [
        {
          id: embeddedPriorityIdFromLabel(label) ?? `pattern-${item.lifestyleId ?? label}`,
          label,
          value,
        },
      ];
    })
    .sort((a, b) => priorityRank(a.id) - priorityRank(b.id));
}

function priorityRank(id: string): number {
  const index = PRIORITY_ORDER.indexOf(id);
  return index === -1 ? PRIORITY_ORDER.length : index;
}

export type MyVerificationSummary = {
  verified: boolean;
  schoolVerified: boolean;
  companyVerified: boolean;
};

export function useMyVerificationSummary(enabled = true): AsyncState<MyVerificationSummary> {
  const state = useApi(['profile', 'verifications'], () => getVerifications(), {
    enabled,
    retry: false,
  });
  const summary = useMemo(
    () =>
      state.data
        ? (() => {
            const schoolVerified = state.data.studentAuth?.status === 'ACCEPTED';
            const companyVerified = state.data.employeeAuth?.status === 'ACCEPTED';
            return {
              verified: schoolVerified || companyVerified,
              schoolVerified,
              companyVerified,
            };
          })()
        : null,
    [state.data],
  );

  return { ...state, data: summary };
}

export function useNotificationSettingToggle(enabled = true) {
  const queryClient = useQueryClient();
  const state = useApi(['profile', 'notification-settings'], () => getNotificationSettings(), {
    enabled,
    retry: false,
  });
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const settings = state.data?.alarmsSettings ?? [];
  const serverEnabled = settings.some((setting) => isAccepted(setting.isEnable));
  const notificationEnabled = optimistic ?? serverEnabled;

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const requests = settings.flatMap((setting) => {
        const settingId = Number(setting.id);
        return Number.isFinite(settingId) ? [{ settingId, enabled: next }] : [];
      });
      if (!requests.length) {
        throw new Error('알림 설정 ID를 확인하지 못했습니다.');
      }
      const responses = await Promise.all(requests.map(updateNotificationSetting));
      const failed = responses.find((response) => response.status !== 200 || response.error);
      if (failed) {
        throw new Error(failed.error?.message ?? '알림 설정을 저장하지 못했습니다.');
      }
      return responses;
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
    notificationEditable: settings.length > 0 && !state.loading && !mutation.isPending,
    notificationError: state.error,
    settings,
  };
}

export function useProfileVisibilityToggle(
  initialVisible = true,
  onChanged?: (next: boolean) => void,
) {
  const [profileVisible, setProfileVisibleState] = useState(initialVisible);
  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const response = await updateVisibility({
        status: next ? 'PUBLIC' : 'PRIVATE',
      });
      if (response.status !== 200 || response.error) {
        throw new Error(response.error?.message ?? '프로필 공개 설정을 저장하지 못했습니다.');
      }
      return response;
    },
  });

  const setProfileVisible = useCallback(
    (next: boolean) => {
      setProfileVisibleState(next);
      mutation.mutate(next, {
        onSuccess: () => onChanged?.(next),
        onError: () => setProfileVisibleState(!next),
      });
    },
    [mutation, onChanged],
  );

  return {
    profileVisible,
    setProfileVisible,
    profileVisibilityLoading: mutation.isPending,
  };
}

export function useBlockedUsers(
  enabled = Boolean(getAccessToken()),
): AsyncState<BlockedUserItem[]> {
  const state = useApi(['profile', 'blocks'], () => getBlocks(), { enabled, retry: false });
  const users = useMemo<BlockedUserItem[] | null>(
    () =>
      state.data?.blocks?.map((block) => ({
        // 현재 차단 해제 API는 URL의 값을 차단 레코드 ID가 아니라 상대 회원 ID로 사용한다.
        id: String(block.blockId ?? block.userId ?? ''),
        userId: String(block.userId ?? ''),
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
    mutationFn: (blockId: string) => unblockUserRequest(blockId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'blocks'] });
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'matches'] });
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'boards'] });
    },
  });
  const blockMutation = useMutation({
    mutationFn: (userId: number) => blockUserRequest({ userId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'blocks'] });
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'matches'] });
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'boards'] });
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
    requestBlock: async (userId: number) => {
      const res = await blockMutation.mutateAsync(userId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '차단에 실패했습니다.');
      }
    },
    requestUnblock: async (blockId: string) => {
      const res = await unblockMutation.mutateAsync(blockId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '차단 해제에 실패했습니다.');
      }
    },
    loggingOut: logoutMutation.isPending,
    withdrawing: withdrawMutation.isPending,
    blocking: blockMutation.isPending,
    unblocking: unblockMutation.isPending,
  };
}

function isAccepted(value: string | boolean | undefined): boolean {
  return value === true || value === 'true';
}

function formatDateLabel(value?: string): string {
  if (!value) return '-';
  const d = parseServerDate(value);
  return d ? formatKstDateLabel(d) : value;
}
