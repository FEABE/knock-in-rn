import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { confirmVerificationCode, sendVerificationCode, type VerificationKind } from '@/lib/api';

export type VerificationFlowStep = 'entry' | 'code' | 'review' | 'complete';
export type VerificationStatusTone = 'idle' | 'review' | 'complete';

export type UseVerificationFlowScreenProps = {
  kind: VerificationKind;
  title: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  defaultEmail: string;
  placeholder: string;
  onDone: () => void;
};

export type UseVerificationFlowScreenReturn = UseVerificationFlowScreenProps & {
  step: VerificationFlowStep;
  email: string;
  code: string;
  loading: boolean;
  error: string | null;
  statusLabel: string;
  statusTone: VerificationStatusTone;
  description: string;
  reviewTitle: string;
  setEmail: (next: string) => void;
  setCode: (next: string) => void;
  send: () => Promise<void>;
  verify: () => Promise<void>;
  completeReview: () => void;
};

export function useVerificationFlowScreen(
  props: UseVerificationFlowScreenProps,
): UseVerificationFlowScreenReturn {
  const [step, setStep] = useState<VerificationFlowStep>('entry');
  const [email, setEmail] = useState(props.defaultEmail);
  const [code, setCodeValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = step === 'complete' ? '인증 완료' : step === 'review' ? '검토중' : '미인증';
  const statusTone: VerificationStatusTone =
    step === 'complete' ? 'complete' : step === 'review' ? 'review' : 'idle';
  const description =
    step === 'entry'
      ? `사용 중인 ${props.label}을 입력하면 인증 코드를 보내드려요.`
      : step === 'code'
        ? '입력하신 이메일로 인증 코드를 발송했어요. 코드를 입력해주세요.'
        : step === 'review'
          ? '신청하신 이메일을 검토하는 중이에요. 완료되면 알림으로 알려드릴게요.'
          : `이제 프로필에 ${props.label} 인증 배지가 표시돼요.`;
  const reviewTitle =
    step === 'complete' ? `${props.label} 인증이 완료됐어요` : '인증 신청이 접수됐어요';

  const send = async () => {
    if (!email.includes('@')) {
      setError('이메일 형식을 확인해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await sendVerificationCode(props.kind, { email });
    setLoading(false);
    if (res.error || res.status !== 200) {
      setError(res.error?.message ?? '인증 코드를 발송하지 못했어요.');
      return;
    }
    setStep('code');
  };

  const verify = async () => {
    if (code.length < 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await confirmVerificationCode(props.kind, { email, authNo: code });
    setLoading(false);
    if (res.error || res.status !== 200) {
      setError(res.error?.message ?? '인증 코드를 확인하지 못했어요.');
      return;
    }
    setStep('review');
  };

  return {
    ...props,
    step,
    email,
    code,
    loading,
    error,
    statusLabel,
    statusTone,
    description,
    reviewTitle,
    setEmail,
    setCode: (next) => setCodeValue(next.replace(/\D/g, '').slice(0, 6)),
    send,
    verify,
    completeReview: () => {
      if (step === 'review') setStep('complete');
      else props.onDone();
    },
  };
}
