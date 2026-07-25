/**
 * 고객센터 화면용 데이터 훅.
 *
 * 화면은 이 훅만 바라보고, 실서버/테스트 데이터 전환은 client.ts 의 USE_MOCK 설정을 따른다.
 */
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createInquiry,
  getNoticeDetail,
  getNotices,
  getInquiries,
  getInquiryCategories,
  getInquiryDetail,
  type InquiryCreate,
  type InquiryItem,
} from './notification';
import { getFaqAll, getTermDetail, getTerms, type TermSummary } from './meta';
import type { AsyncState } from './use-async';
import { useApi } from './use-async';

export type SupportFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SupportNoticeItem = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
};

export type SupportInquiryListItem = {
  id: string;
  title: string;
  body: string;
  answer?: string;
  authorName: string;
  dateLabel: string;
  statusLabel: string;
  answered: boolean;
  categoryLabel: string;
};

export type SupportTermsSection = {
  id: string;
  title: string;
  body: string;
};

export type SupportCategory = {
  id: string;
  name: string;
};

export type SupportCounts = {
  faqCount: number;
  inquiryCount: number;
};

export function useSupportCounts(includePrivate = true): AsyncState<SupportCounts> {
  const faqs = useApi(['support', 'faqs'], () => getFaqAll());
  const inquiries = useApi(['support', 'inquiries'], () => getInquiries(), {
    enabled: includePrivate,
  });

  return {
    data: {
      faqCount: faqs.data?.faqInfoList?.length ?? 0,
      inquiryCount: includePrivate ? (inquiries.data?.inquiries?.length ?? 0) : 0,
    },
    loading: faqs.loading || (includePrivate && inquiries.loading),
    error: faqs.error ?? (includePrivate ? inquiries.error : null),
    reload: () => {
      faqs.reload();
      inquiries.reload();
    },
  };
}

export function useSupportFaqs(): AsyncState<SupportFaqItem[]> {
  const state = useApi(['support', 'faqs'], () => getFaqAll());
  const items = useMemo<SupportFaqItem[] | null>(
    () =>
      state.data?.faqInfoList?.map((faq) => ({
        id: String(faq.id ?? faq.title ?? ''),
        question: faq.title ?? '질문',
        answer: faq.contents ?? '',
      })) ?? null,
    [state.data],
  );

  return { ...state, data: items };
}

export function useSupportNotices(): AsyncState<SupportNoticeItem[]> {
  const query = useQuery({
    queryKey: ['support', 'notices', 'with-detail'],
    queryFn: async () => {
      const list = await getNotices({ page: 0, size: 20 });
      if (list.status !== 200 || list.error) {
        throw new Error(list.error?.message ?? `요청 실패 (status ${list.status})`);
      }

      return Promise.all(
        (list.data?.notices ?? []).map(async (notice) => {
          const id = String(notice.id ?? '');
          const detail = id ? await getNoticeDetail(id) : null;
          const detailNotice =
            detail?.status === 200 && !detail.error ? detail.data?.notice : undefined;
          return {
            id,
            title: detailNotice?.title ?? notice.title ?? '공지사항',
            body: String(detailNotice?.contents ?? ''),
            dateLabel: formatDateLabel(detailNotice?.createAt ?? notice.createAt),
          };
        }),
      );
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useSupportInquiries(enabled = true): AsyncState<SupportInquiryListItem[]> {
  const query = useQuery({
    queryKey: ['support', 'inquiries', 'with-detail'],
    enabled,
    queryFn: async () => {
      const list = await getInquiries();
      if (list.status !== 200 || list.error) {
        throw new Error(list.error?.message ?? `요청 실패 (status ${list.status})`);
      }

      const inquiries = list.data?.inquiries ?? [];
      const withDetail = await Promise.all(
        inquiries.map(async (inquiry) => {
          const id = String(inquiry.id ?? '');
          if (!id) return mapInquiryItem(inquiry);
          const detail = await getInquiryDetail(id);
          if (detail.status !== 200 || detail.error || !detail.data?.inquirie) {
            return mapInquiryItem(inquiry);
          }

          const source = detail.data.inquirie;
          const firstReply = source.reply?.[0];
          return {
            id,
            title: source.title ?? inquiry.title ?? '문의',
            body: source.contents ?? '',
            answer: firstReply?.contents,
            authorName: source.writer ?? inquiry.writer ?? '나',
            dateLabel: formatDateLabel(source.createAt ?? inquiry.createAt),
            statusLabel: statusLabel(source.status ?? inquiry.status),
            answered: !!firstReply || isAnswered(source.status ?? inquiry.status),
            categoryLabel: source.type ?? inquiry.type ?? '기타',
          };
        }),
      );

      return withDetail;
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useSupportTerms(): AsyncState<SupportTermsSection[]> {
  const query = useQuery({
    queryKey: ['support', 'terms', 'with-detail'],
    queryFn: async () => {
      const list = await getTerms();
      if (list.status !== 200 || list.error) {
        throw new Error(list.error?.message ?? `요청 실패 (status ${list.status})`);
      }

      const terms = list.data?.terms ?? [];
      return Promise.all(terms.map(loadTermSection));
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useSupportCategories(enabled = true): AsyncState<SupportCategory[]> {
  const state = useApi(['support', 'categories'], () => getInquiryCategories(), { enabled });
  const categories = useMemo<SupportCategory[] | null>(
    () =>
      state.data?.inquirieCategorys?.map((category) => ({
        id: String(category.id ?? ''),
        name: category.name ?? '기타',
      })) ?? null,
    [state.data],
  );

  return { ...state, data: categories };
}

export function useCreateSupportInquiryAction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: InquiryCreate) => createInquiry(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support', 'inquiries'] });
    },
  });

  return {
    submitInquiry: async (body: InquiryCreate) => {
      const res = await mutation.mutateAsync(body);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '문의 접수에 실패했습니다.');
      }
      return res.data;
    },
    submitting: mutation.isPending,
  };
}

async function loadTermSection(term: TermSummary): Promise<SupportTermsSection> {
  const id = String(term.id ?? '');
  const detail = id ? await getTermDetail(id) : null;
  const body =
    detail && detail.status === 200 && !detail.error ? (detail.data?.contents ?? '') : '';

  return {
    id,
    title: term.title ?? '약관',
    body,
  };
}

function mapInquiryItem(inquiry: InquiryItem): SupportInquiryListItem {
  return {
    id: String(inquiry.id ?? ''),
    title: inquiry.title ?? '문의',
    body: '',
    authorName: inquiry.writer ?? '나',
    dateLabel: formatDateLabel(inquiry.createAt),
    statusLabel: statusLabel(inquiry.status),
    answered: isAnswered(inquiry.status),
    categoryLabel: inquiry.type ?? '기타',
  };
}

function isAnswered(status?: string): boolean {
  const normalized = (status ?? '').toLowerCase();
  return (
    normalized.includes('answer') || normalized.includes('done') || normalized.includes('완료')
  );
}

function statusLabel(status?: string): string {
  if (isAnswered(status)) return '답변 완료';
  return '답변 대기';
}

function formatDateLabel(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
