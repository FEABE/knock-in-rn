import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useModeration, useSession } from '@/lib/domain';

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
  const { blockedUserIds, reports } = useModeration();

  const logout = () => {
    Alert.alert('로그아웃', '현재 계정에서 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/explore' as never);
        },
      },
    ]);
  };

  return {
    onBack: () => router.back(),
    sections: [
      {
        title: '계정 관리',
        rows: [
          {
            icon: 'shield-checkmark-outline',
            title: '차단 / 신고 관리',
            description: `차단 ${blockedUserIds.size}명 · 신고 ${reports.length}건`,
            onPress: () => router.push('/mypage/blocked' as never),
          },
          {
            icon: 'document-text-outline',
            title: '약관 및 개인정보 처리방침',
            description: '서비스 이용약관을 확인해요',
            onPress: () => router.push('/support/terms' as never),
          },
        ],
      },
      {
        title: '로그인',
        rows: [
          {
            icon: 'log-out-outline',
            title: '로그아웃',
            description: '현재 기기에서 로그아웃',
            onPress: logout,
          },
        ],
      },
      {
        title: '위험 구역',
        rows: [
          {
            icon: 'trash-outline',
            title: '탈퇴하기',
            description: '계정과 프로필 삭제를 요청해요',
            tone: 'danger',
            onPress: () => router.push('/mypage/withdraw' as never),
          },
        ],
      },
    ],
  };
}
