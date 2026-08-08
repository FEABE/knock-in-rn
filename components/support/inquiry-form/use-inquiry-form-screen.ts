import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';

import { type SupportCategory, useCreateSupportInquiryAction } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { setMypageHomeToast } from '@/components/mypage/mypage-home/mypage-home-toast';
import { resetToMypage } from '@/lib/navigation/routes';

/**
 * 문의 유형은 서버 enum 고정값이라 `GET /inquiries/categorys`로 받아오지 않는다.
 * id는 디자인(3748:79225)의 노출 순서와 백엔드 enum 순서가 일치한다는 전제로 1~5를 쓴다.
 */
export const INQUIRY_CATEGORIES: SupportCategory[] = [
  { id: '1', name: '매칭/채팅' },
  { id: '2', name: '계정/인증' },
  { id: '3', name: '신고/차단' },
  { id: '4', name: '기타' },
  { id: '5', name: '의견 남기기' },
];

export type UseInquiryFormScreenReturn = {
  title: string;
  body: string;
  categories: SupportCategory[];
  categoryId: string;
  submitError: string | null;
  canSubmit: boolean;
  submitting: boolean;
  setCategoryId: (next: string) => void;
  setTitle: (next: string) => void;
  setBody: (next: string) => void;
  submit: () => Promise<void>;
};

export function useInquiryFormScreen(): UseInquiryFormScreenReturn {
  const router = useRouter();
  const [state, setState] = useState({
    title: '',
    body: '',
    categoryId: INQUIRY_CATEGORIES[0].id,
    submitError: null as string | null,
  });
  const { title, body, categoryId, submitError } = state;
  const { session, requireLogin } = useRequireLogin();
  const { submitInquiry, submitting } = useCreateSupportInquiryAction();

  const canSubmit =
    Boolean(session) &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    !!categoryId &&
    !submitting;

  const submit = async () => {
    if (!session) {
      const message = '문의 접수는 로그인 후 이용할 수 있어요.';
      setState((current) => ({ ...current, submitError: message }));
      requireLogin(() => undefined, { title: '로그인 필요', message });
      return;
    }
    if (!canSubmit) return;
    const numericCategoryId = Number(categoryId);
    if (!Number.isFinite(numericCategoryId)) {
      const message = '문의 유형을 다시 선택해주세요.';
      setState((current) => ({ ...current, submitError: message }));
      Alert.alert('접수 실패', message);
      return;
    }
    setState((current) => ({ ...current, submitError: null }));
    try {
      await submitInquiry({
        categoryId: numericCategoryId,
        title: title.trim(),
        contents: body.trim(),
      });
      // 제출 후엔 문의 폼에 머무르지 않고 마이페이지로 돌아가 토스트로 알린다.
      setMypageHomeToast('문의가 제출되었어요');
      resetToMypage(router);
    } catch (error) {
      const message = error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.';
      setState((current) => ({ ...current, submitError: message }));
      Alert.alert('접수 실패', message);
    }
  };

  return {
    title,
    body,
    categories: INQUIRY_CATEGORIES,
    categoryId,
    submitError,
    canSubmit,
    submitting,
    setCategoryId: (next) => setState((current) => ({ ...current, categoryId: next })),
    setTitle: (next) => setState((current) => ({ ...current, title: next })),
    setBody: (next) => setState((current) => ({ ...current, body: next })),
    submit,
  };
}
