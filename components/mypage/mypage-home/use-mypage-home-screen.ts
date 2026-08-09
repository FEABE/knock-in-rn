import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';

import {
  useMyPageProfileSummary,
  useMyVerificationSummary,
  useNotificationSettingToggle,
  useProfileVisibilityToggle,
} from '@/lib/api';
import { useSession, type UserSummary } from '@/lib/domain';
import {
  goMypageAccount,
  goMypageBasicProfile,
  goMypageMyRooms,
  goMypagePreferences,
  goMypageProfile,
  goMypageRoommate,
  goSupport,
  goSupportNotice,
  goSupportTerms,
  goVerification,
} from '@/lib/navigation/routes';
import { useRequireLogin } from '@/lib/auth';

import { consumeMypageHomeToast } from './mypage-home-toast';

const TOAST_DURATION_MS = 2500;

/**
 * "협업 및 제휴 제안" 외부 링크(구글 폼). 환경변수로 덮어쓸 수 있게 남겨두되,
 * 기본값을 실제 폼 URL로 채워서 별도 설정 없이도 바로 열리게 한다.
 */
const PARTNERSHIP_URL =
  process.env.EXPO_PUBLIC_PARTNERSHIP_URL || 'https://forms.gle/MtNqe3w1gPyLb4Vx7';

async function openPartnershipLink() {
  if (!PARTNERSHIP_URL) {
    Alert.alert('준비 중이에요', '제휴 제안 페이지 준비 중이에요. 조금만 기다려주세요.');
    return;
  }
  try {
    await Linking.openURL(PARTNERSHIP_URL);
  } catch {
    Alert.alert('열 수 없어요', '제휴 제안 페이지를 열지 못했어요. 잠시 후 다시 시도해주세요.');
  }
}

export type MyPageMenuRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  badge?: string;
  onPress: () => void;
};

export type UseMyPageHomeScreenReturn = {
  user: UserSummary | null;
  verified: boolean;
  schoolVerified: boolean;
  companyVerified: boolean;
  profileVisible: boolean;
  notificationEnabled: boolean;
  notificationEditable: boolean;
  genderLabel: string;
  genderIcon: keyof typeof Ionicons.glyphMap | undefined;
  hasRoom: boolean;
  roomTypeLabel: string;
  matchingRows: MyPageMenuRow[];
  accountRows: MyPageMenuRow[];
  supportRows: MyPageMenuRow[];
  toast: string | null;
  onSignIn: () => void;
  onProfilePress: () => void;
  setProfileVisible: (next: boolean) => void;
  setNotificationEnabled: (next: boolean) => void;
};

export function useMyPageHomeScreen(): UseMyPageHomeScreenReturn {
  const router = useRouter();
  const { session, setVisibility, refreshSessionUser } = useSession();
  const { requireLogin } = useRequireLogin();
  const profile = useMyPageProfileSummary(!!session);
  const verification = useMyVerificationSummary(!!session);
  const { profileVisible, setProfileVisible } = useProfileVisibilityToggle(
    session?.visibility !== 'hidden',
    (next) => setVisibility(next ? 'public' : 'hidden'),
  );
  const { notificationEnabled, notificationEditable, setNotificationEnabled } =
    useNotificationSettingToggle(!!session);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 서버가 공개범위를 바꾸는 경우(매칭 성사 시 PRIVATE 전환 등)를 화면 진입 때 반영한다.
  const isLoggedIn = !!session;
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) void refreshSessionUser();
    }, [isLoggedIn, refreshSessionUser]),
  );

  useFocusEffect(
    useCallback(() => {
      const message = consumeMypageHomeToast();
      if (!message) return;
      setToast(message);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    }, []),
  );

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const user = session?.user ?? null;
  const verified = verification.data?.verified ?? (user?.badges.length ?? 0) > 0;
  const schoolVerified =
    verification.data?.schoolVerified ??
    user?.badges.some((badge) => badge.kind === 'school') ??
    false;
  const companyVerified =
    verification.data?.companyVerified ??
    user?.badges.some((badge) => badge.kind === 'company') ??
    false;
  const hasRoom = profile.data?.hasRoom ?? false;
  const roomTypeLabel = profile.data?.roomTypeLabel ?? '방 없음';

  const matchingRows = useMemo<MyPageMenuRow[]>(
    () => [
      {
        icon: 'moon-outline',
        label: '생활패턴 관리',
        sub: '생활패턴 수정',
        onPress: () => goMypageProfile(router, 'lifestyle'),
      },
      {
        icon: 'home-outline',
        label: '방 조건 관리',
        sub: '방 조건 수정',
        onPress: () => goMypageProfile(router, 'room'),
      },
      {
        icon: 'options-outline',
        label: '선호 룸메이트 관리',
        sub: '원하는 룸메이트 조건 설정',
        onPress: () => goMypagePreferences(router),
      },
      {
        icon: 'people-outline',
        label: '룸메이트 관리',
        sub: '내 룸메이트 확인 · 연결 해제',
        onPress: () => goMypageRoommate(router),
      },
      {
        icon: 'home-outline',
        label: '게시글 관리',
        sub: '방 게시글 등록 및 수정',
        onPress: () => goMypageMyRooms(router),
      },
    ],
    [router],
  );

  const accountRows = useMemo<MyPageMenuRow[]>(
    () => [
      {
        icon: 'shield-checkmark-outline',
        label: '신원 인증',
        sub: '학교 · 회사 이메일 인증',
        badge: verified ? undefined : '인증 필요',
        onPress: () => goVerification(router),
      },
      {
        icon: 'settings-outline',
        label: '계정 설정',
        onPress: () => goMypageAccount(router),
      },
    ],
    [router, verified],
  );

  const supportRows = useMemo<MyPageMenuRow[]>(
    () => [
      { icon: 'megaphone-outline', label: '공지사항', onPress: () => goSupportNotice(router) },
      { icon: 'help-circle-outline', label: '고객센터', onPress: () => goSupport(router) },
      {
        icon: 'document-text-outline',
        label: '약관 및 정책',
        onPress: () => goSupportTerms(router),
      },
      {
        icon: 'people-outline',
        label: '협업 및 제휴 제안',
        onPress: () => void openPartnershipLink(),
      },
    ],
    [router],
  );

  return {
    user,
    verified,
    schoolVerified,
    companyVerified,
    profileVisible,
    notificationEnabled,
    notificationEditable,
    genderLabel: genderLabel(user?.gender),
    genderIcon: genderIcon(user?.gender),
    hasRoom,
    roomTypeLabel,
    matchingRows,
    accountRows,
    supportRows,
    toast,
    onSignIn: () => requireLogin(() => undefined),
    onProfilePress: () => goMypageBasicProfile(router),
    setProfileVisible,
    setNotificationEnabled,
  };
}

function genderLabel(gender?: string): string {
  if (gender?.toLowerCase() === 'female') return '여성';
  if (gender?.toLowerCase() === 'male') return '남성';
  return '기타';
}

/** 디자인(3885:44372)의 나이·성별 뱃지 앞에 붙는 성별 기호. */
function genderIcon(gender?: string): keyof typeof Ionicons.glyphMap | undefined {
  if (gender?.toLowerCase() === 'female') return 'female';
  if (gender?.toLowerCase() === 'male') return 'male';
  return undefined;
}
