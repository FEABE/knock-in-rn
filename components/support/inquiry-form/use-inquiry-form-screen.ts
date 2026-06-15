import { Alert } from 'react-native';
import { useState } from 'react';

export type UseInquiryFormScreenReturn = {
  title: string;
  body: string;
  isPublic: boolean;
  canSubmit: boolean;
  submitted: boolean;
  setTitle: (next: string) => void;
  setBody: (next: string) => void;
  setIsPublic: (next: boolean) => void;
  submit: () => void;
};

export function useInquiryFormScreen(): UseInquiryFormScreenReturn {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTitle('');
    setBody('');
    Alert.alert('접수 완료', '운영자가 확인 후 답변드릴게요.');
  };

  return {
    title,
    body,
    isPublic,
    canSubmit,
    submitted,
    setTitle,
    setBody,
    setIsPublic,
    submit,
  };
}
