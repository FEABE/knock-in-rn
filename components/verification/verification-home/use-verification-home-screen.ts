import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { getVerifications, useApi } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goKakaoLogin, goVerificationCompany, goVerificationSchool } from '@/lib/navigation/routes';

export type VerificationHomeCard = {
  id: 'school' | 'company';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  verified: boolean;
  bullets: string[];
  onPress: () => void;
};

export type UseVerificationHomeScreenReturn = {
  cards: VerificationHomeCard[];
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onLogin: () => void;
  onRetry: () => void;
};

export function useVerificationHomeScreen(): UseVerificationHomeScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const { data, loading, error, reload } = useApi(
    ['profile', 'verifications'],
    () => getVerifications(),
    {
      enabled: !!session,
      retry: false,
    },
  );
  const schoolVerified = data?.studentAuth?.status === 'ACCEPTED';
  const companyVerified = data?.employeeAuth?.status === 'ACCEPTED';

  const cards = useMemo<VerificationHomeCard[]>(
    () => [
      {
        id: 'school',
        icon: 'school-outline',
        title: '학교 이메일 인증',
        description: '학교 이메일을 인증하면 학생 배지가 표시돼요.',
        verified: schoolVerified,
        bullets: ['학교 이메일(.ac.kr, .edu 등) 형식만 가능해요', '인증 코드는 5분간 유효해요'],
        onPress: () => goVerificationSchool(router),
      },
      {
        id: 'company',
        icon: 'business-outline',
        title: '회사 이메일 인증',
        description: '회사 이메일을 인증하면 직장인 배지가 표시돼요.',
        verified: companyVerified,
        bullets: [
          '개인 이메일은 인증이 제한될 수 있어요',
          '검토가 필요한 경우 대기 상태로 표시돼요',
        ],
        onPress: () => goVerificationCompany(router),
      },
    ],
    [companyVerified, router, schoolVerified],
  );

  return {
    cards,
    isLoggedIn: Boolean(session),
    loading,
    error,
    onBack: () => router.back(),
    onLogin: () => goKakaoLogin(router),
    onRetry: reload,
  };
}
