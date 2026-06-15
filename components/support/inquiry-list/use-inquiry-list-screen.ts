import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { INQUIRIES } from '@/lib/domain';

export type InquiryListItem = {
  id: string;
  title: string;
  body: string;
  answer?: string;
  authorName: string;
  dateLabel: string;
  statusLabel: string;
  answered: boolean;
  isPublic: boolean;
};

export type UseInquiryListScreenReturn = {
  inquiries: InquiryListItem[];
  publicCount: number;
  onCreatePress: () => void;
};

export function useInquiryListScreen(): UseInquiryListScreenReturn {
  const router = useRouter();

  const inquiries = useMemo<InquiryListItem[]>(
    () =>
      INQUIRIES.map((inquiry) => ({
        id: inquiry.id,
        title: inquiry.title,
        body: inquiry.body,
        answer: inquiry.answer,
        authorName: inquiry.authorName,
        dateLabel: fmtDate(inquiry.createdAt),
        statusLabel: inquiry.answer ? '답변 완료' : '답변 대기',
        answered: !!inquiry.answer,
        isPublic: inquiry.isPublic,
      })),
    [],
  );

  return {
    inquiries,
    publicCount: inquiries.filter((inquiry) => inquiry.isPublic).length,
    onCreatePress: () => router.push('/support/inquiry-new' as never),
  };
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
