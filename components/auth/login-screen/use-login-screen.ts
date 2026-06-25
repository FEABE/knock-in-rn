import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import type { SocialProvider } from '@/lib/api';
import { useSession, type SignInFailureKind } from '@/lib/domain';

export type LoginScreenStatus = 'idle' | 'loading' | 'success' | SignInFailureKind;

export type UseLoginScreenReturn = {
  status: LoginScreenStatus;
  activeProvider: SocialProvider | null;
  message: string | null;
  onProviderPress: (provider: SocialProvider) => void;
  onRetry: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function useLoginScreen(): UseLoginScreenReturn {
  const router = useRouter();
  const { signIn } = useSession();
  const [status, setStatus] = useState<LoginScreenStatus>('idle');
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lastProviderRef = useRef<SocialProvider>('kakao');
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const redirectAfterSuccess = useCallback(
    (isProfileComplete: boolean) => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        router.replace((isProfileComplete ? '/explore' : '/onboarding') as never);
      }, 450);
    },
    [router],
  );

  const start = useCallback(
    async (provider: SocialProvider) => {
      if (status === 'loading') return;

      lastProviderRef.current = provider;
      setActiveProvider(provider);
      setStatus('loading');
      setMessage(null);

      const result = await signIn(provider);

      if (result.status === 'success') {
        setStatus('success');
        setMessage('로그인됐어요. 잠시 후 이동합니다.');
        redirectAfterSuccess(result.isProfileComplete);
        return;
      }

      setStatus(result.status);
      setMessage(toUserMessage(result.status, result.message));
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, {
        screen_name: 'login',
        error_code: result.code ?? result.status,
      });
    },
    [redirectAfterSuccess, signIn, status],
  );

  return {
    status,
    activeProvider,
    message,
    onProviderPress: start,
    onRetry: () => start(lastProviderRef.current),
    onSkip: () => router.replace('/explore' as never),
    onBack: () => {
      if (router.canGoBack()) router.back();
      else router.replace('/explore' as never);
    },
  };
}

function toUserMessage(status: SignInFailureKind, fallback: string): string {
  if (status === 'cancelled') return '로그인이 취소됐어요.';
  if (status === 'network') return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
  return fallback || '로그인에 실패했어요. 잠시 후 다시 시도해주세요.';
}
