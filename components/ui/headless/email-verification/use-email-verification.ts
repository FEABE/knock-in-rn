import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type EmailVerificationStep =
  | 'enter-email'
  | 'awaiting-code'
  | 'verified';

export type UseEmailVerificationProps = {
  domainSuffix?: string;
  codeLength?: number;
  resendCooldownSec?: number;
  sendCode?: (email: string) => Promise<void> | void;
  verifyCode?: (email: string, code: string) => Promise<boolean> | boolean;
  initialEmail?: string;
};

export type UseEmailVerificationReturn = {
  step: EmailVerificationStep;
  email: string;
  setEmail: (next: string) => void;
  isEmailValid: boolean;
  code: string;
  setCode: (next: string) => void;
  isCodeFilled: boolean;
  codeLength: number;
  sendCode: () => Promise<void>;
  verify: () => Promise<void>;
  resend: () => Promise<void>;
  reset: () => void;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  cooldown: number;
  canResend: boolean;
  isVerified: boolean;
};

function emailRegex(suffix?: string): RegExp {
  if (!suffix) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const safe = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[^\\s@]+@[^\\s@]*${safe}$`);
}

export function useEmailVerification({
  domainSuffix,
  codeLength = 6,
  resendCooldownSec = 60,
  sendCode: sendCodeImpl,
  verifyCode: verifyCodeImpl,
  initialEmail = '',
}: UseEmailVerificationProps = {}): UseEmailVerificationReturn {
  const [step, setStep] = useState<EmailVerificationStep>('enter-email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [isSending, setSending] = useState(false);
  const [isVerifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEmailValid = useMemo(
    () => emailRegex(domainSuffix).test(email),
    [email, domainSuffix],
  );

  const isCodeFilled = code.length === codeLength;

  const stopTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(resendCooldownSec);
    stopTimer();
    timer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          stopTimer();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [resendCooldownSec, stopTimer]);

  useEffect(() => stopTimer, [stopTimer]);

  const sendCode = useCallback(async () => {
    if (!isEmailValid) {
      setError('이메일 형식을 확인해주세요');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await sendCodeImpl?.(email);
      setStep('awaiting-code');
      startCooldown();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '인증코드 발송에 실패했어요');
    } finally {
      setSending(false);
    }
  }, [email, isEmailValid, sendCodeImpl, startCooldown]);

  const verify = useCallback(async () => {
    if (!isCodeFilled) {
      setError('인증코드를 정확히 입력해주세요');
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const ok = verifyCodeImpl ? await verifyCodeImpl(email, code) : true;
      if (ok) {
        setStep('verified');
        stopTimer();
      } else {
        setError('인증코드가 일치하지 않아요');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '인증에 실패했어요');
    } finally {
      setVerifying(false);
    }
  }, [code, email, isCodeFilled, stopTimer, verifyCodeImpl]);

  const resend = useCallback(async () => {
    if (cooldown > 0) return;
    setCode('');
    await sendCode();
  }, [cooldown, sendCode]);

  const reset = useCallback(() => {
    setStep('enter-email');
    setEmail(initialEmail);
    setCode('');
    setError(null);
    stopTimer();
    setCooldown(0);
  }, [initialEmail, stopTimer]);

  return {
    step,
    email,
    setEmail,
    isEmailValid,
    code,
    setCode,
    isCodeFilled,
    codeLength,
    sendCode,
    verify,
    resend,
    reset,
    isSending,
    isVerifying,
    error,
    cooldown,
    canResend: cooldown === 0 && step === 'awaiting-code',
    isVerified: step === 'verified',
  };
}
