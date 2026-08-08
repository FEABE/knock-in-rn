/**
 * 마이페이지/계정 설정 화면용 API 훅.
 */
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from './client';
import { formatKstDateLabel, parseServerDate } from './date-time';
import { logout, withdraw } from './auth';
import { getPreferenceAll, getProfileAll, updateVisibility } from './profile';
import { getNotificationSettings, updateNotificationSetting } from './notification';
import { getLifestylePatterns } from './meta';
import {
  blockUser as blockUserRequest,
  getBlocks,
  getVerifications,
  unblockUser as unblockUserRequest,
} from './verification';
import type { AsyncState } from './use-async';
import { useApi } from './use-async';

export type MyPageProfileSummary = {
  hasRoom: boolean;
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
    const hasRoom = state.data.type === 'OFFER';
    return {
      hasRoom,
      // 마이페이지 뱃지는 방 형태(원룸/아파트 등)가 아니라 방 조건 관리 데이터(type) 기준
      // 방 있음/방 없음만 표시한다.
      roomTypeLabel: hasRoom ? '방 있음' : '방 없음',
      regionLabel: regionLabel || '-',
    };
  }, [state.data]);

  return { ...state, data: summary };
}

/** 생활패턴/선호조건 한 줄. 문항명과 이미지는 서버 메타를 사용한다. */
export type LifestyleSummaryItem = {
  id: string;
  label: string;
  value: string;
  image?: string | null;
};

export type PreferencePrioritySummaryItem = {
  id: string;
  name: string;
  image?: string | null;
};

export type MyLifestyleOverview = {
  /** 내 생활패턴 (GET /users/me/profile/all). */
  lifestyles: LifestyleSummaryItem[];
  /** 선호 룸메이트 조건 (GET /users/me/preferences/all → lifestyles). */
  preferredLifestyles: LifestyleSummaryItem[];
  /** 우선순위 (GET /users/me/preferences/all → conditions). */
  importantConditions: PreferencePrioritySummaryItem[];
};

type RawLifestyleItem = {
  lifestyleId?: number;
  name?: string;
  value?: string;
  description?: string;
  imageUrl?: string;
};

type RawPriorityItem = {
  conditionsId?: number;
  name?: string;
  imageUrl?: string;
};

type LifestyleMetaItem = {
  patternId: number;
  label: string;
  image?: string | null;
};

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
  const lifestyleMeta = useApi(['meta', 'lifestyle-patterns'], () => getLifestylePatterns(), {
    enabled,
    retry: false,
  });
  const questions = useMemo(
    () =>
      (lifestyleMeta.data?.patterns ?? []).flatMap((pattern) => {
        const patternId = Number(pattern.id);
        const label = pattern.name?.trim();
        if (!Number.isFinite(patternId) || !label) return [];
        return [{ patternId, label, image: pattern.image?.trim() || null }];
      }),
    [lifestyleMeta.data?.patterns],
  );

  const overview = useMemo<MyLifestyleOverview | null>(() => {
    if (!profile.data && !preference.data) return null;
    return {
      lifestyles: toLifestyleSummaryItems(profile.data?.lifestyles, questions, true),
      preferredLifestyles: toLifestyleSummaryItems(preference.data?.lifestyles, questions, false),
      importantConditions: toPrioritySummaryItems(
        preference.data?.conditions as RawPriorityItem[] | undefined,
        questions,
      ),
    };
  }, [preference.data, profile.data, questions]);

  const { reload: reloadProfile } = profile;
  const { reload: reloadPreference } = preference;
  const { reload: reloadLifestyleMeta } = lifestyleMeta;
  const reload = useCallback(() => {
    reloadProfile();
    reloadPreference();
    reloadLifestyleMeta();
  }, [reloadLifestyleMeta, reloadPreference, reloadProfile]);

  return {
    data: overview,
    loading: profile.loading || preference.loading || lifestyleMeta.loading,
    refreshing: profile.refreshing || preference.refreshing,
    error: profile.error ?? preference.error ?? lifestyleMeta.error,
    reload,
  };
}

/** 저장값과 서버 메타를 결합한다. 프로필 화면은 메타 문항 전체를 노출한다. */
function toLifestyleSummaryItems(
  items: RawLifestyleItem[] | undefined,
  questions: LifestyleMetaItem[],
  includeAllQuestions: boolean,
): LifestyleSummaryItem[] {
  const source = items ?? [];
  if (includeAllQuestions && questions.length) {
    const fromMeta = questions.map((question) => {
      const item = source.find(
        (candidate) =>
          candidate.name?.trim() === question.label || candidate.lifestyleId === question.patternId,
      );
      return {
        id: String(question.patternId),
        label: question.label,
        value: lifestyleValue(item) ?? '미입력',
        image: item?.imageUrl?.trim() || question.image,
      };
    });
    const matchedNames = new Set(questions.map((question) => question.label));
    const matchedIds = new Set(questions.map((question) => question.patternId));
    const fromProfileOnly = source.flatMap((item, index) => {
      const label = item.name?.trim();
      if (
        !label ||
        matchedNames.has(label) ||
        (item.lifestyleId !== undefined && matchedIds.has(item.lifestyleId))
      ) {
        return [];
      }
      return [
        {
          id: String(item.lifestyleId ?? `profile-${index}`),
          label,
          value: lifestyleValue(item) ?? '미입력',
          image: item.imageUrl?.trim() || null,
        },
      ];
    });
    return [...fromMeta, ...fromProfileOnly];
  }

  return source.flatMap((item, index) => {
    const label = item.name?.trim();
    const value = lifestyleValue(item);
    if (!label || !value) return [];
    const question = questions.find(
      (candidate) => candidate.label === label || candidate.patternId === item.lifestyleId,
    );
    return [
      {
        id: String(question?.patternId ?? item.lifestyleId ?? index),
        label,
        value,
        image: item.imageUrl?.trim() || question?.image || null,
      },
    ];
  });
}

function lifestyleValue(item: RawLifestyleItem | undefined): string | undefined {
  return item?.description?.trim() || item?.value?.trim() || undefined;
}

function toPrioritySummaryItems(
  items: RawPriorityItem[] | undefined,
  questions: LifestyleMetaItem[],
): PreferencePrioritySummaryItem[] {
  return (items ?? []).flatMap((item, index) => {
    const question = questions.find(
      (candidate) =>
        candidate.patternId === item.conditionsId || candidate.label === item.name?.trim(),
    );
    const name = item.name?.trim() || question?.label;
    if (!name) return [];
    return [
      {
        id: String(item.conditionsId ?? question?.patternId ?? index),
        name,
        image: item.imageUrl?.trim() || question?.image || null,
      },
    ];
  });
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
