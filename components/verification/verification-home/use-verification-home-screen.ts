import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { getVerifications, useApi } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goKakaoLogin, goVerificationCompany, goVerificationSchool } from '@/lib/navigation/routes';

export type VerificationCardId = 'school' | 'company';

export type VerificationHomeCard = {
  id: VerificationCardId;
  title: string;
  description: string;
  verified: boolean;
};

export type UseVerificationHomeScreenReturn = {
  cards: VerificationHomeCard[];
  selectedId: VerificationCardId | null;
  canProceed: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onLogin: () => void;
  onRetry: () => void;
  onSelectCard: (id: VerificationCardId) => void;
  onNext: () => void;
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
  const [selectedId, setSelectedId] = useState<VerificationCardId | null>(null);

  const cards = useMemo<VerificationHomeCard[]>(
    () => [
      {
        id: 'school',
        title: '학교 이메일 인증',
        description: '발급한 학교 이메일로 인증',
        verified: schoolVerified,
      },
      {
        id: 'company',
        title: '회사 이메일 인증',
        description: '현재 재직 중인 회사 이메일 인증',
        verified: companyVerified,
      },
    ],
    [companyVerified, schoolVerified],
  );

  return {
    cards,
    selectedId,
    canProceed: selectedId !== null,
    isLoggedIn: Boolean(session),
    loading,
    error,
    onBack: () => router.back(),
    onLogin: () => goKakaoLogin(router),
    onRetry: reload,
    onSelectCard: (id) => setSelectedId((current) => (current === id ? null : id)),
    onNext: () => {
      if (selectedId === 'school') goVerificationSchool(router);
      else if (selectedId === 'company') goVerificationCompany(router);
    },
  };
}
