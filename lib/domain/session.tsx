import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { MOCK_SESSION_USER } from './mock';
import type { Session } from './types';
import {
  setAccessToken,
  socialLoginSdk,
  socialLoginWeb,
  type SocialProvider,
  USE_MOCK,
} from '@/lib/api';

// WebBrowser.maybeCompleteAuthSession(); // 더 이상 사용하지 않음

export type SignInFailureKind = 'cancelled' | 'network' | 'failed';

export type SignInResult =
  | {
      status: 'success';
      provider: SocialProvider;
      isProfileComplete: boolean;
      preferenceInfo: boolean;
    }
  | {
      status: SignInFailureKind;
      provider: SocialProvider;
      message: string;
      code?: string;
    };

export type SessionContextValue = {
  session: Session;
  signIn: (provider?: SocialProvider) => Promise<SignInResult>;
  signOut: () => void;
  setVisibility: (next: 'public' | 'hidden' | 'matched') => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initial }: { children: ReactNode; initial?: Session }) {
  const [session, setSession] = useState<Session>(() => {
    if (initial !== undefined) return initial;
    if (!USE_MOCK) return null;
    return {
      user: MOCK_SESSION_USER,
      isProfileComplete: true,
      visibility: 'public',
    };
  });

  const signIn = useCallback(async (provider: SocialProvider = 'kakao'): Promise<SignInResult> => {
    if (USE_MOCK) {
      setAccessToken('mock-access-token');
      setSession({
        user: MOCK_SESSION_USER,
        isProfileComplete: true,
        visibility: 'public',
      });
      return {
        status: 'success',
        provider,
        isProfileComplete: true,
        preferenceInfo: false,
      };
    }

    try {
      const res = provider === 'kakao' ? await signInWithKakaoSdk() : await socialLoginWeb('apple');

      if (res.error || res.status !== 200 || !res.data?.accessToken) {
        return {
          status: classifyApiError(res.error?.code, res.error?.message),
          provider,
          code: res.error?.code,
          message: res.error?.message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
        };
      }

      setAccessToken(res.data.accessToken);
      setSession({
        user: MOCK_SESSION_USER,
        isProfileComplete: res.data.basicInfo,
        visibility: 'public',
      });

      return {
        status: 'success',
        provider,
        isProfileComplete: res.data.basicInfo,
        preferenceInfo: res.data.preferenceInfo,
      };
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : undefined;
      const message = typeof e?.message === 'string' ? e.message : undefined;
      return {
        status: classifyThrownError(code, message),
        provider,
        code,
        message: message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
      };
    }
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setSession(null);
  }, []);

  const setVisibility = useCallback((next: 'public' | 'hidden' | 'matched') => {
    setSession((prev) => (prev ? { ...prev, visibility: next } : prev));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, signIn, signOut, setVisibility }),
    [session, signIn, signOut, setVisibility],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx;
}

async function signInWithKakaoSdk() {
  const result = await kakaoLogin();
  return socialLoginSdk('kakao', {
    access_token: result.accessToken,
    refresh_token: result.refreshToken,
  });
}

function classifyApiError(code?: string, message?: string): SignInFailureKind {
  const lower = `${code ?? ''} ${message ?? ''}`.toLowerCase();
  if (lower.includes('network') || lower.includes('timeout')) return 'network';
  if (lower.includes('cancel')) return 'cancelled';
  return 'failed';
}

function classifyThrownError(code?: string, message?: string): SignInFailureKind {
  const lower = `${code ?? ''} ${message ?? ''}`.toLowerCase();
  if (lower.includes('cancel')) return 'cancelled';
  if (
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('offline') ||
    lower.includes('internet')
  ) {
    return 'network';
  }
  return 'failed';
}
