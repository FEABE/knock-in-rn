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
import { formatKstDateLabel, parseServerDate } from './date-time';
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
  dateLabel: string;
  /** 목록 카드에 2줄로 보여줄 본문 미리보기. 상세 조회 실패 시 빈 문자열. */
  bodyPreview: string;
};

export type SupportNoticeDetail = {
  id: string;
  title: string;
  dateLabel: string;
  body: string;
  /** 상세 본문을 받아오지 못하고 목록 정보만으로 채운 경우 true. */
  bodyUnavailable: boolean;
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

/** 문의 상세는 목록 카드와 같은 필드 구성이라 타입을 그대로 재사용한다. */
export type SupportInquiryDetail = SupportInquiryListItem;

/**
 * 문의 상세 단건 조회.
 *
 * 목록(`useSupportInquiries`)도 카드 미리보기를 채우려고 항목마다 이 상세를 이미 불러오지만,
 * 딥링크/새로고침으로 상세 화면에 바로 들어오는 경우를 위해 단독으로도 조회할 수 있게 한다.
 */
export function useSupportInquiryDetail(id: string): AsyncState<SupportInquiryDetail> {
  const query = useQuery({
    queryKey: ['support', 'inquiries', id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      const detail = await getInquiryDetail(id);
      if (detail.status !== 200 || detail.error || !detail.data?.inquirie) {
        throw new Error(detail.error?.message ?? `요청 실패 (status ${detail.status})`);
      }

      const source = detail.data.inquirie;
      const firstReply = source.reply?.[0];
      return {
        id,
        title: source.title ?? '문의',
        body: source.contents ?? '',
        answer: firstReply?.contents,
        authorName: source.writer ?? '나',
        dateLabel: formatDateLabel(source.createAt),
        statusLabel: statusLabel(source.status),
        answered: !!firstReply || isAnswered(source.status),
        categoryLabel: source.type ?? '기타',
      };
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

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
  const faqs = useApi(['support', 'faqs'], () => getFaqAll(), { retry: false });
  const inquiries = useApi(['support', 'inquiries'], () => getInquiries(), {
    enabled: includePrivate,
    retry: false,
  });

  return {
    data: {
      faqCount: faqs.data?.faqInfoList?.length ?? 0,
      inquiryCount: includePrivate ? (inquiries.data?.inquiries?.length ?? 0) : 0,
    },
    loading: faqs.loading || (includePrivate && inquiries.loading),
    refreshing: faqs.refreshing || (includePrivate && inquiries.refreshing),
    error: faqs.error ?? (includePrivate ? inquiries.error : null),
    reload: () => {
      faqs.reload();
      inquiries.reload();
    },
  };
}

export function useSupportFaqs(): AsyncState<SupportFaqItem[]> {
  const state = useApi(['support', 'faqs'], () => getFaqAll(), { retry: false });
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
    queryKey: ['support', 'notices', 'with-preview'],
    retry: false,
    queryFn: async () => {
      const list = await getNotices({ page: 0, size: 20 });
      if (list.status !== 200 || list.error) {
        throw new Error(list.error?.message ?? `요청 실패 (status ${list.status})`);
      }

      const notices = list.data?.notices ?? [];
      return Promise.all(
        notices.map(async (notice) => {
          const id = String(notice.id ?? '');
          const detail = id ? await getNoticeDetail(id) : null;
          const contents =
            detail && detail.status === 200 && !detail.error
              ? (detail.data?.notice?.contents ?? '')
              : '';
          return {
            id,
            title: notice.title ?? '공지사항',
            dateLabel: formatDateLabel(notice.createAt),
            bodyPreview: contents,
          };
        }),
      );
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

/**
 * 공지 상세.
 *
 * `GET /users/me/notices/{id}` 를 우선 호출하고, 실패하면 목록(`GET /users/me/notices`)에서
 * 같은 id 를 찾아 제목/날짜만이라도 채운다. (상세 엔드포인트 배포 전 대비)
 */
export function useSupportNoticeDetail(id: string): AsyncState<SupportNoticeDetail> {
  const query = useQuery({
    queryKey: ['support', 'notices', id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      const detail = await getNoticeDetail(id);
      const notice = detail.data?.notice;
      if (detail.status === 200 && !detail.error && notice) {
        return {
          id: String(notice.id ?? id),
          title: notice.title ?? '공지사항',
          dateLabel: formatDateLabel(notice.createAt),
          body: notice.contents ?? '',
          bodyUnavailable: false,
        };
      }

      const list = await getNotices({ page: 0, size: 100 });
      const item = (list.data?.notices ?? []).find((each) => String(each.id ?? '') === id);
      if (!item) {
        throw new Error(detail.error?.message ?? `요청 실패 (status ${detail.status})`);
      }

      return {
        id,
        title: item.title ?? '공지사항',
        dateLabel: formatDateLabel(item.createAt),
        body: '',
        bodyUnavailable: true,
      };
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching,
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
    retry: false,
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
    loading: query.isLoading,
    refreshing: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useSupportTerms(): AsyncState<SupportTermsSection[]> {
  const query = useQuery({
    queryKey: ['support', 'terms', 'with-detail'],
    retry: false,
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
    loading: query.isLoading,
    refreshing: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useSupportCategories(enabled = true): AsyncState<SupportCategory[]> {
  const state = useApi(['support', 'categories'], () => getInquiryCategories(), {
    enabled,
    retry: false,
  });
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
  return '접수';
}

function formatDateLabel(value?: string): string {
  if (!value) return '-';
  const d = parseServerDate(value);
  return d ? formatKstDateLabel(d) : value;
}
