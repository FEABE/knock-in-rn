import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import {
  useMyPageProfileSummary,
  useMyVerificationSummary,
  useNotificationSettingToggle,
  useProfileVisibilityToggle,
} from '@/lib/api';
import { useSession, type UserSummary } from '@/lib/domain';
import {
  goKakaoLogin,
  goMypageAccount,
  goMypageMyRooms,
  goMypagePreferences,
  goMypageProfile,
  goMypageRoommate,
  goSupport,
  goVerification,
} from '@/lib/navigation/routes';

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
  profileRegionLabel: string;
  roomTypeLabel: string;
  matchingRows: MyPageMenuRow[];
  accountRows: MyPageMenuRow[];
  onSignIn: () => void;
  setProfileVisible: (next: boolean) => void;
  setNotificationEnabled: (next: boolean) => void;
};

export function useMyPageHomeScreen(): UseMyPageHomeScreenReturn {
  const router = useRouter();
  const { session, setVisibility } = useSession();
  const profile = useMyPageProfileSummary(!!session);
  const verification = useMyVerificationSummary(!!session);
  const { profileVisible, setProfileVisible } = useProfileVisibilityToggle(
    session?.visibility !== 'hidden',
    (next) => setVisibility(next ? 'public' : 'hidden'),
  );
  const { notificationEnabled, notificationEditable, setNotificationEnabled } =
    useNotificationSettingToggle(!!session);

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
  const profileRegionLabel =
    profile.data?.regionLabel ??
    (user ? `${user.region.city} ${user.region.district}`.trim() : '-');
  const roomTypeLabel = profile.data?.roomTypeLabel ?? '방 없어요';

  const matchingRows = useMemo<MyPageMenuRow[]>(
    () => [
      {
        icon: 'person-outline',
        label: '내 프로필',
        sub: '생활패턴 · 방 조건 수정',
        onPress: () => goMypageProfile(router),
      },
      {
        icon: 'options-outline',
        label: '선호 조건',
        sub: '원하는 룸메이트 조건 설정',
        onPress: () => goMypagePreferences(router),
      },
      {
        icon: 'home-outline',
        label: '내 방 관리',
        sub: '방 게시글 등록 · 수정',
        onPress: () => goMypageMyRooms(router),
      },
      {
        icon: 'people-outline',
        label: '내 룸메이트',
        sub: '공동생활 합의서 · 캘린더',
        onPress: () => goMypageRoommate(router),
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
        badge: verified ? undefined : '미인증',
        onPress: () => goVerification(router),
      },
      {
        icon: 'help-circle-outline',
        label: '고객센터',
        onPress: () => goSupport(router),
      },
      {
        icon: 'settings-outline',
        label: '계정 설정',
        onPress: () => goMypageAccount(router),
      },
    ],
    [router, verified],
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
    profileRegionLabel,
    roomTypeLabel,
    matchingRows,
    accountRows,
    onSignIn: () => goKakaoLogin(router),
    setProfileVisible,
    setNotificationEnabled,
  };
}

function genderLabel(gender?: string): string {
  if (gender === 'female') return '여성';
  if (gender === 'male') return '남성';
  return '기타';
}
