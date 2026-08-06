import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { getVerifications, useApi } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goKakaoLogin, goVerificationCompany, goVerificationSchool } from '@/lib/navigation/routes';

export type VerificationCardId = 'school' | 'company';

export type VerificationHomeCard = {
  id: VerificationCardId;
  title: string;
  description: string;
  verified: boolean;
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
        title: '학교 이메일 인증',
        description: '발급한 학교 이메일로 인증',
        verified: schoolVerified,
        onPress: () => goVerificationSchool(router),
      },
      {
        id: 'company',
        title: '회사 이메일 인증',
        description: '현재 재직 중인 회사 이메일 인증',
        verified: companyVerified,
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
