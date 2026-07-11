import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import {
  type SupportCategory,
  useCreateSupportInquiryAction,
  useSupportCategories,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';

export type UseInquiryFormScreenReturn = {
  title: string;
  body: string;
  categories: SupportCategory[];
  categoryId: string;
  loadingCategories: boolean;
  submitError: string | null;
  canSubmit: boolean;
  submitted: boolean;
  submitting: boolean;
  setCategoryId: (next: string) => void;
  setTitle: (next: string) => void;
  setBody: (next: string) => void;
  submit: () => Promise<void>;
};

export function useInquiryFormScreen(): UseInquiryFormScreenReturn {
  const [state, setState] = useState({
    title: '',
    body: '',
    submitted: false,
    categoryId: '',
    submitError: null as string | null,
  });
  const { title, body, submitted, categoryId, submitError } = state;
  const { session, requireLogin } = useRequireLogin();
  const { data: categories, loading: loadingCategories } = useSupportCategories(Boolean(session));
  const { submitInquiry, submitting } = useCreateSupportInquiryAction();
  const categoryList = useMemo(() => categories ?? [], [categories]);

  useEffect(() => {
    if (!categoryId && categoryList[0]?.id) {
      setState((current) => ({ ...current, categoryId: categoryList[0].id }));
    }
  }, [categoryId, categoryList]);

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
      setState((current) => ({
        ...current,
        submitted: true,
        title: '',
        body: '',
      }));
      Alert.alert('접수 완료', '운영자가 확인 후 답변드릴게요.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.';
      setState((current) => ({ ...current, submitError: message }));
      Alert.alert('접수 실패', message);
    }
  };

  return {
    title,
    body,
    categories: categoryList,
    categoryId,
    loadingCategories,
    submitError,
    canSubmit,
    submitted,
    submitting,
    setCategoryId: (next) => setState((current) => ({ ...current, categoryId: next })),
    setTitle: (next) => setState((current) => ({ ...current, title: next })),
    setBody: (next) => setState((current) => ({ ...current, body: next })),
    submit,
  };
}
