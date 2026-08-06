import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSupportFaqs, type SupportFaqItem } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goSupportInquiries, goSupportInquiryNew } from '@/lib/navigation/routes';

export type UseSupportHomeScreenReturn = {
  faqs: SupportFaqItem[];
  faqsLoading: boolean;
  faqsError: string | null;
  retryFaqs: () => void;
  /** 펼쳐진 FAQ id 집합. 디자인(3952:51504)에서 여러 항목이 동시에 열려 있다. */
  openFaqIds: string[];
  toggleFaq: (id: string) => void;
  operatingHoursLabel: string;
  onInquiryNew: () => void;
  onInquiryList: () => void;
};

export function useSupportHomeScreen(): UseSupportHomeScreenReturn {
  const router = useRouter();
  const { requireLogin } = useRequireLogin();
  const {
    data: faqs,
    loading: faqsLoading,
    error: faqsError,
    reload: retryFaqs,
  } = useSupportFaqs();
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqIds((prev) => (prev.includes(id) ? prev.filter((it) => it !== id) : [...prev, id]));
  }, []);

  return {
    faqs: faqs ?? [],
    faqsLoading,
    faqsError,
    retryFaqs,
    openFaqIds,
    toggleFaq,
    operatingHoursLabel: '평균 응답 시간은 1~2 영업일이에요',
    onInquiryNew: () =>
      requireLogin(() => goSupportInquiryNew(router), {
        title: '로그인 필요',
        message: '문의 접수는 로그인 후 이용할 수 있어요.',
      }),
    onInquiryList: () =>
      requireLogin(() => goSupportInquiries(router), {
        title: '로그인 필요',
        message: '문의내역은 로그인 후 확인할 수 있어요.',
      }),
  };
}
