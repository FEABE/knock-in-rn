import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import {
  confirmVerificationCode,
  getVerifications,
  sendVerificationCode,
  type VerificationKind,
  type VerificationStatus,
} from '@/lib/api';

export type VerificationFlowStep = 'entry' | 'code' | 'review' | 'complete';
export type VerificationStatusTone = 'idle' | 'review' | 'complete';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  timerLabel: string;
  canSend: boolean;
  canVerify: boolean;
  setEmail: (next: string) => void;
  setCode: (next: string) => void;
  send: () => Promise<void>;
  verify: () => Promise<void>;
  completeReview: () => Promise<void>;
};

export function useVerificationFlowScreen(
  props: UseVerificationFlowScreenProps,
): UseVerificationFlowScreenReturn {
  const [state, setState] = useState<VerificationFlowState>({
    step: 'entry',
    email: props.defaultEmail,
    code: '',
    loading: false,
    error: null,
    expiresAt: null,
    remainingSeconds: 0,
  });
  const { step, email, code, loading, error, expiresAt, remainingSeconds } = state;

  useEffect(() => {
    let mounted = true;
    getVerifications().then((res) => {
      if (!mounted || res.error || res.status !== 200) return;
      const status = verificationForKind(props.kind, res.data);
      if (!status?.email) return;
      setState((current) => ({
        ...current,
        email: status.email ?? current.email,
        step: status.isAccepted ? 'complete' : 'review',
      }));
    });
    return () => {
      mounted = false;
    };
  }, [props.kind]);

  useEffect(() => {
    if (step !== 'code' || !expiresAt) return;
    const updateRemaining = () => {
      const next = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setState((current) => ({
        ...current,
        remainingSeconds: next,
        error:
          next === 0 && !current.error
            ? '인증 코드가 만료됐어요. 다시 발송해주세요.'
            : current.error,
      }));
    };
    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, step]);

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
  const timerLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`;
  const normalizedEmail = email.trim();
  const canSend = EMAIL_RE.test(normalizedEmail) && !loading;
  const canVerify = code.length === 6 && remainingSeconds > 0 && !loading;

  const send = async () => {
    if (!EMAIL_RE.test(normalizedEmail)) {
      setState((current) => ({ ...current, error: '이메일 형식을 확인해주세요.' }));
      return;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    const res = await sendVerificationCode(props.kind, { email: normalizedEmail });
    if (res.error || res.status !== 200) {
      setState((current) => ({
        ...current,
        loading: false,
        error: res.error?.message ?? '인증 코드를 발송하지 못했어요.',
      }));
      return;
    }
    setState((current) => ({
      ...current,
      step: 'code',
      loading: false,
      error: null,
      code: '',
      email: normalizedEmail,
      expiresAt: Date.now() + 5 * 60 * 1000,
      remainingSeconds: 5 * 60,
    }));
  };

  const verify = async () => {
    if (remainingSeconds <= 0) {
      setState((current) => ({
        ...current,
        error: '인증 코드가 만료됐어요. 다시 발송해주세요.',
      }));
      return;
    }
    if (code.length < 6) {
      setState((current) => ({ ...current, error: '6자리 인증 코드를 입력해주세요.' }));
      return;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    const res = await confirmVerificationCode(props.kind, { email, authNo: code });
    if (res.error || res.status !== 200) {
      setState((current) => ({
        ...current,
        loading: false,
        error: res.error?.message ?? '인증 코드를 확인하지 못했어요.',
      }));
      return;
    }
    const verificationRes = await getVerifications();
    const status =
      verificationRes.status === 200 && !verificationRes.error
        ? verificationForKind(props.kind, verificationRes.data)
        : undefined;
    setState((current) => ({
      ...current,
      step: status?.isAccepted ? 'complete' : 'review',
      loading: false,
      error: null,
      expiresAt: null,
      remainingSeconds: 0,
    }));
  };

  const completeReview = async () => {
    if (step === 'complete') {
      props.onDone();
      return;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    const res = await getVerifications();
    const status =
      res.status === 200 && !res.error ? verificationForKind(props.kind, res.data) : null;
    setState((current) => ({
      ...current,
      step: status?.isAccepted ? 'complete' : 'review',
      loading: false,
      error: status?.isAccepted
        ? null
        : (res.error?.message ?? '아직 인증 검토가 완료되지 않았어요.'),
    }));
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
    timerLabel,
    canSend,
    canVerify,
    setEmail: (next) => setState((current) => ({ ...current, email: next, error: null })),
    setCode: (next) =>
      setState((current) => ({
        ...current,
        code: next.replace(/\D/g, '').slice(0, 6),
        error: null,
      })),
    send,
    verify,
    completeReview,
  };
}

type VerificationFlowState = {
  step: VerificationFlowStep;
  email: string;
  code: string;
  loading: boolean;
  error: string | null;
  expiresAt: number | null;
  remainingSeconds: number;
};

function verificationForKind(
  kind: VerificationKind,
  data: { studentAuth?: VerificationStatus; employeeAuth?: VerificationStatus },
) {
  return kind === 'student' ? data.studentAuth : data.employeeAuth;
}
