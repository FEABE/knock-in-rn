import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import type { SocialProvider } from '@/lib/api';
import { useSession, type SignInFailureKind } from '@/lib/domain';
import { goExplore, resetToExplore, resetToOnboarding } from '@/lib/navigation/routes';

export type LoginScreenStatus = 'idle' | 'loading' | 'success' | SignInFailureKind;

export type LoginErrorDialogKind = 'failed' | 'withdrawn' | 'suspended';

export type LoginErrorDialogState = {
  kind: LoginErrorDialogKind;
  description: string;
};

export type UseLoginScreenReturn = {
  status: LoginScreenStatus;
  activeProvider: SocialProvider | null;
  message: string | null;
  errorDialog: LoginErrorDialogState | null;
  onErrorDialogConfirm: () => void;
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
  const [errorDialog, setErrorDialog] = useState<LoginErrorDialogState | null>(null);
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
        if (isProfileComplete) resetToExplore(router);
        else resetToOnboarding(router);
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
      setErrorDialog(null);

      const result = await signIn(provider);

      if (result.status === 'success') {
        setStatus('success');
        setMessage('로그인됐어요. 잠시 후 이동합니다.');
        redirectAfterSuccess(result.isProfileComplete);
        return;
      }

      // 취소는 사용자가 스스로 닫은 것이므로 모달 없이 조용히 초기 상태로 돌린다.
      if (result.status === 'cancelled') {
        setStatus('idle');
        return;
      }

      setStatus(result.status);
      if (result.status === 'network') {
        setMessage('네트워크 연결을 확인한 뒤 다시 시도해주세요.');
      } else {
        setErrorDialog({
          kind: result.status,
          description: toDialogDescription(result.status, result.message),
        });
      }
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
    errorDialog,
    onErrorDialogConfirm: () => {
      setErrorDialog(null);
      setStatus('idle');
    },
    onProviderPress: start,
    onRetry: () => start(lastProviderRef.current),
    onSkip: () => resetToExplore(router),
    onBack: () => {
      if (router.canGoBack()) router.back();
      else goExplore(router, 'replace');
    },
  };
}

function toDialogDescription(kind: LoginErrorDialogKind, serverMessage: string): string {
  if (kind === 'withdrawn') return '탈퇴 후 3일이 지나면 재가입할 수 있어요';
  if (kind === 'suspended') {
    // 서버가 내려주는 정지 사유를 그대로 보여주고, 없으면 기본 문구를 쓴다.
    return (
      serverMessage.trim() ||
      '서비스 이용이 제한된 계정이에요\n자세한 내용은 고객센터로 문의해주세요'
    );
  }
  return '로그인에 실패했어요\n잠시 후 다시 시도해주세요';
}
