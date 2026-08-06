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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 인증 코드는 숫자 6자리로 고정이다. 숫자가 아닌 문자는 입력에서 제거하고 6자로 제한한다. */
const CODE_LENGTH = 6;

function normalizeCode(next: string): string {
  return next.replace(/\D/g, '').slice(0, CODE_LENGTH);
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
  /** 화면 상단 큰 제목. 단계별로 문구가 다르다(이메일 입력/코드 입력/검토중/완료/반려). */
  heading: string;
  description: string;
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

  const shortLabel = props.kind === 'student' ? '학교' : '회사';
  const heading =
    step === 'entry'
      ? '이메일을 입력해주세요'
      : step === 'code'
        ? '인증 코드를 입력해주세요'
        : step === 'review'
          ? '신청하신 이메일을 검토하는 중이에요'
          : step === 'rejected'
            ? '인증 신청이 반려됐어요'
            : '인증이 완료됐어요';
  const description =
    step === 'entry'
      ? '인증 코드 발송을 위해 이메일을 입력해주세요'
      : step === 'code'
        ? '입력하신 이메일로 전송받으신 코드를 입력해주세요'
        : step === 'review'
          ? '처리까지 최대 3일까지 소요될 수 있어요\n완료되면 앱 내 알림으로 알려드릴게요'
          : step === 'rejected'
            ? '인증이 반려됐어요. 이메일을 다시 확인한 뒤 재신청해주세요.'
            : `이제 프로필에 ${shortLabel} 인증 뱃지가 표시돼요\n인증을 취소하려면 고객센터로 문의해주세요`;
  const timerLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`;
  const normalizedEmail = email.trim();
  const canSend = EMAIL_RE.test(normalizedEmail) && !loading;
  const canVerify = code.length === CODE_LENGTH && remainingSeconds > 0 && !loading;

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
    if (code.length !== CODE_LENGTH) {
      setState((current) => ({
        ...current,
        error: '인증 코드 6자리를 입력해주세요.',
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
    // review/complete 모두 '확인' 한 번으로 닫힌다. 인증 홈 화면은 스택에 남아있는 채로
    // 뒤로가기되므로 리마운트되지 않는데, 캐시를 무효화해두지 않으면 진입 때 받아온
    // 이전 상태가 그대로 남는다. 최신 검토 결과는 홈으로 돌아가 다시 조회한다.
    await queryClient.invalidateQueries({ queryKey: ['profile', 'verifications'] });
    props.onDone();
  };

  return {
    ...props,
    step,
    email,
    code,
    loading,
    error,
    heading,
    description,
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
  if (status?.status === 'ACCEPTED') return 'complete';
  return 'review';
}
