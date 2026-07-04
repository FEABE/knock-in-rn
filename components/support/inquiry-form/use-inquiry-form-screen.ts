import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import {
  type SupportCategory,
  useCreateSupportInquiryAction,
  useSupportCategories,
} from '@/lib/api';

export type UseInquiryFormScreenReturn = {
  title: string;
  body: string;
  isPublic: boolean;
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
  setIsPublic: (next: boolean) => void;
  submit: () => Promise<void>;
};

export function useInquiryFormScreen(): UseInquiryFormScreenReturn {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: categories, loading: loadingCategories } = useSupportCategories();
  const { submitInquiry, submitting } = useCreateSupportInquiryAction();
  const categoryList = useMemo(() => categories ?? [], [categories]);

  useEffect(() => {
    if (!categoryId && categoryList[0]?.id) setCategoryId(categoryList[0].id);
  }, [categoryId, categoryList]);

  const canSubmit =
    title.trim().length > 0 && body.trim().length > 0 && !!categoryId && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await submitInquiry({
        categoryId,
        title: title.trim(),
        contents: `${body.trim()}\n\n공개 여부: ${isPublic ? '공개' : '비공개'}`,
      });
      setSubmitted(true);
      setTitle('');
      setBody('');
      Alert.alert('접수 완료', '운영자가 확인 후 답변드릴게요.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.';
      setSubmitError(message);
      Alert.alert('접수 실패', message);
    }
  };

  return {
    title,
    body,
    isPublic,
    categories: categoryList,
    categoryId,
    loadingCategories,
    submitError,
    canSubmit,
    submitted,
    submitting,
    setCategoryId,
    setTitle,
    setBody,
    setIsPublic,
    submit,
  };
}
