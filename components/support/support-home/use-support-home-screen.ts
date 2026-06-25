import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { FAQ_ITEMS, INQUIRIES, NOTICES } from '@/lib/domain';
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

  const actions = useMemo<SupportHomeAction[]>(
    () => [
      {
        icon: 'help-circle-outline',
        title: '자주 묻는 질문',
        description: `${FAQ_ITEMS.length}개 질문`,
        onPress: () => goSupportFaq(router),
      },
      {
        icon: 'megaphone-outline',
        title: '공지사항',
        description: `${NOTICES.length}개 공지`,
        onPress: () => goSupportNotice(router),
      },
      {
        icon: 'chatbox-ellipses-outline',
        title: '문의내역',
        description: `${INQUIRIES.length}건의 문의`,
        onPress: () => goSupportInquiries(router),
      },
      {
        icon: 'create-outline',
        title: '문의하기',
        description: '새 문의를 작성해요',
        onPress: () => goSupportInquiryNew(router),
      },
    ],
    [router],
  );

  return {
    actions,
    operatingHoursLabel: '평일 10:00 - 18:00 접수된 문의는 순서대로 답변드려요.',
  };
}
