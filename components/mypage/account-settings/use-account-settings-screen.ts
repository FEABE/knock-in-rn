import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useAccountActions, useBlockedUsers } from '@/lib/api';
import { useSession } from '@/lib/domain';
import {
  goExplore,
  goMypageBlocked,
  goMypageWithdraw,
  goSupportTerms,
} from '@/lib/navigation/routes';

export type AccountSettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  tone?: 'default' | 'danger';
  onPress: () => void;
};

export type AccountSettingsSection = {
  title: string;
  rows: AccountSettingsRow[];
};

export type UseAccountSettingsScreenReturn = {
  sections: AccountSettingsSection[];
  onBack: () => void;
};

export function useAccountSettingsScreen(): UseAccountSettingsScreenReturn {
  const router = useRouter();
  const { signOut } = useSession();
  const { data: blockedUsers } = useBlockedUsers();
  const { requestLogout } = useAccountActions();

  const logout = () => {
    Alert.alert('로그아웃', '현재 계정에서 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestLogout();
          } catch {
            // 서버 로그아웃 실패가 기기 로그아웃을 막으면 사용자가 빠져나갈 수 없다.
          } finally {
            await signOut();
          }
          goExplore(router, 'replace');
        },
      },
    ]);
  };

  return {
    onBack: () => router.back(),
    sections: [
      {
        title: '약관 및 정책',
        rows: [
          {
            icon: 'document-text-outline',
            title: '이용약관',
            onPress: () => goSupportTerms(router),
          },
          {
            icon: 'lock-closed-outline',
            title: '개인정보처리방침',
            onPress: () => goSupportTerms(router),
          },
        ],
      },
      {
        title: '차단관리',
        rows: [
          {
            icon: 'shield-checkmark-outline',
            title: '차단 목록',
            description: `차단 ${blockedUsers?.length ?? 0}명`,
            onPress: () => goMypageBlocked(router),
          },
        ],
      },
      {
        title: '계정',
        rows: [
          {
            icon: 'log-out-outline',
            title: '로그아웃',
            onPress: logout,
          },
          {
            icon: 'trash-outline',
            title: '회원 탈퇴',
            tone: 'danger',
            onPress: () => goMypageWithdraw(router),
          },
        ],
      },
    ],
  };
}
