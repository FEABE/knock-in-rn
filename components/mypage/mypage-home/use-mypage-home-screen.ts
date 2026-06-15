import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useSession, type UserSummary } from '@/lib/domain';

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
  profileVisible: boolean;
  notificationEnabled: boolean;
  genderLabel: string;
  matchingRows: MyPageMenuRow[];
  accountRows: MyPageMenuRow[];
  onSignIn: () => void;
  setProfileVisible: (next: boolean) => void;
  setNotificationEnabled: (next: boolean) => void;
};

export function useMyPageHomeScreen(): UseMyPageHomeScreenReturn {
  const router = useRouter();
  const { session, signIn } = useSession();
  const [profileVisible, setProfileVisible] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const user = session?.user ?? null;
  const verified = (user?.badges.length ?? 0) > 0;

  const matchingRows = useMemo<MyPageMenuRow[]>(
    () => [
      {
        icon: 'person-outline',
        label: '내 프로필',
        sub: '생활패턴 · 방 조건 수정',
        onPress: () => router.push('/mypage/profile' as never),
      },
      {
        icon: 'options-outline',
        label: '선호 조건',
        sub: '원하는 룸메이트 조건 설정',
        onPress: () => router.push('/mypage/preferences' as never),
      },
      {
        icon: 'home-outline',
        label: '내 방 관리',
        sub: '방 게시글 등록 · 수정',
        onPress: () => router.push('/mypage/my-rooms' as never),
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
        onPress: () => router.push('/verification' as never),
      },
      {
        icon: 'help-circle-outline',
        label: '고객센터',
        onPress: () => router.push('/support' as never),
      },
      {
        icon: 'settings-outline',
        label: '계정 설정',
        onPress: () => router.push('/mypage/account' as never),
      },
    ],
    [router, verified],
  );

  return {
    user,
    verified,
    profileVisible,
    notificationEnabled,
    genderLabel: genderLabel(user?.gender),
    matchingRows,
    accountRows,
    onSignIn: signIn,
    setProfileVisible,
    setNotificationEnabled,
  };
}

function genderLabel(gender?: string): string {
  if (gender === 'female') return '여성';
  if (gender === 'male') return '남성';
  return '기타';
}
