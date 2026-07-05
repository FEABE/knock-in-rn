import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useSupportCounts } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import {
  goSupportFaq,
  goSupportInquiries,
  goSupportInquiryNew,
  goSupportNotice,
} from '@/lib/navigation/routes';

export type SupportHomeAction = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
};

export type UseSupportHomeScreenReturn = {
  actions: SupportHomeAction[];
  operatingHoursLabel: string;
};

export function useSupportHomeScreen(): UseSupportHomeScreenReturn {
  const router = useRouter();
  const { session, requireLogin } = useRequireLogin();
  const { data: counts, loading } = useSupportCounts(Boolean(session));

  const actions = useMemo<SupportHomeAction[]>(
    () => [
      {
        icon: 'help-circle-outline',
        title: '자주 묻는 질문',
        description: loading ? '불러오는 중' : `${counts?.faqCount ?? 0}개 질문`,
        onPress: () => goSupportFaq(router),
      },
      {
        icon: 'megaphone-outline',
        title: '공지사항',
        description: loading ? '불러오는 중' : `${counts?.noticeCount ?? 0}개 공지`,
        onPress: () => goSupportNotice(router),
      },
      {
        icon: 'chatbox-ellipses-outline',
        title: '문의내역',
        description: loading ? '불러오는 중' : `${counts?.inquiryCount ?? 0}건의 문의`,
        onPress: () =>
          requireLogin(() => goSupportInquiries(router), {
            title: '로그인 필요',
            message: '문의내역은 로그인 후 확인할 수 있어요.',
          }),
      },
      {
        icon: 'create-outline',
        title: '문의하기',
        description: '새 문의를 작성해요',
        onPress: () =>
          requireLogin(() => goSupportInquiryNew(router), {
            title: '로그인 필요',
            message: '문의 접수는 로그인 후 이용할 수 있어요.',
          }),
      },
    ],
    [
      counts?.faqCount,
      counts?.inquiryCount,
      counts?.noticeCount,
      loading,
      requireLogin,
      router,
    ],
  );

  return {
    actions,
    operatingHoursLabel: '평일 10:00 - 18:00 접수된 문의는 순서대로 답변드려요.',
  };
}
