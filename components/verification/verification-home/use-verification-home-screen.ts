import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useSession } from '@/lib/domain';
import { goVerificationCompany, goVerificationSchool } from '@/lib/navigation/routes';

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
  onBack: () => void;
};

export function useVerificationHomeScreen(): UseVerificationHomeScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const schoolVerified = session?.user.badges.some((badge) => badge.kind === 'school') ?? false;
  const companyVerified = session?.user.badges.some((badge) => badge.kind === 'company') ?? false;

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
    onBack: () => router.back(),
  };
}
