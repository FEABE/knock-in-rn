import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  confirmVerificationCode,
  getVerifications,
  sendVerificationCode,
  type VerificationKind,
  type VerificationStatus,
} from '@/lib/api';

export type VerificationFlowStep = 'entry' | 'code' | 'review' | 'complete' | 'rejected';
export type VerificationStatusTone = 'idle' | 'review' | 'complete' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 서버가 보내는 인증 코드는 숫자 6자리가 아니라 길이가 정해지지 않은 영숫자 문자열이다.
 * 예전에는 입력값을 `replace(/\D/g,'').slice(0,6)` 로 잘라내서, 메일에서 코드를 복사해
 * 붙여넣으면 숫자만 남고 6자로 잘린 "전혀 다른 코드"가 입력되는 버그가 있었다.
 * 이제는 붙여넣기한 문자열을 그대로 두고 공백/개행만 제거한다.
 */
const MIN_CODE_LENGTH = 6;

function normalizeCode(next: string): string {
  return next.replace(/\s+/g, '');
}

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
  const queryClient = useQueryClient();
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
        step: verificationStep(status),
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

  const statusLabel =
    step === 'complete'
      ? '인증 완료'
      : step === 'review'
        ? '검토중'
        : step === 'rejected'
          ? '반려'
          : '미인증';
  const statusTone: VerificationStatusTone =
    step === 'complete'
      ? 'complete'
      : step === 'review'
        ? 'review'
        : step === 'rejected'
          ? 'error'
          : 'idle';
  const description =
    step === 'entry'
      ? `사용 중인 ${props.label}을 입력하면 인증 코드를 보내드려요.`
      : step === 'code'
        ? '입력하신 이메일로 인증 코드를 발송했어요. 코드를 입력해주세요.'
        : step === 'review'
          ? '신청하신 이메일을 검토하는 중이에요. 완료되면 알림으로 알려드릴게요.'
          : step === 'rejected'
            ? '인증이 반려됐어요. 이메일을 다시 확인한 뒤 재신청해주세요.'
            : `이제 프로필에 ${props.label} 인증 배지가 표시돼요.`;
  const reviewTitle =
    step === 'complete'
      ? `${props.label} 인증이 완료됐어요`
      : step === 'rejected'
        ? '인증 신청이 반려됐어요'
        : '인증 신청이 접수됐어요';
  const timerLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`;
  const normalizedEmail = email.trim();
  const canSend = EMAIL_RE.test(normalizedEmail) && !loading;
  const canVerify = code.length >= MIN_CODE_LENGTH && remainingSeconds > 0 && !loading;

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
    if (code.length < MIN_CODE_LENGTH) {
      setState((current) => ({
        ...current,
        error: '메일로 받은 인증 코드를 그대로 입력해주세요.',
      }));
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
      step: verificationStep(status),
      loading: false,
      error: null,
      expiresAt: null,
      remainingSeconds: 0,
    }));
  };

  const completeReview = async () => {
    if (step === 'rejected') {
      setState((current) => ({
        ...current,
        step: 'entry',
        code: '',
        error: null,
        expiresAt: null,
        remainingSeconds: 0,
      }));
      return;
    }
    if (step === 'complete') {
      // 인증 홈 화면은 스택에 남아있는 채로 뒤로가기되므로 리마운트되지 않는다.
      // 캐시를 무효화해두지 않으면 처음 진입 때 받아온 '미인증' 상태가 그대로 남는다.
      await queryClient.invalidateQueries({ queryKey: ['profile', 'verifications'] });
      props.onDone();
      return;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    const res = await getVerifications();
    const status =
      res.status === 200 && !res.error ? verificationForKind(props.kind, res.data) : null;
    setState((current) => ({
      ...current,
      step: verificationStep(status),
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
        code: normalizeCode(next),
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

function verificationStep(status?: VerificationStatus | null): VerificationFlowStep {
  if (status?.status === 'REJECT') return 'rejected';
  if (status?.isAccepted || status?.status === 'ACCEPTED') return 'complete';
  return 'review';
}
