import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  clearStoredAuthSession,
  markStoredProfileComplete,
  readStoredAuthSession,
  writeStoredAuthSession,
} from '@/lib/auth/session-storage';

import type { Session, UserSummary } from './types';
import {
  getProfileAll,
  getAccessTokenMemberId,
  setAuthFailureHandler,
  setAccessToken,
  socialLoginSdk,
  socialLoginWeb,
  type ProfileAllData,
  type SocialProvider,
  USE_MOCK,
} from '@/lib/api';
import { goKakaoLogin } from '@/lib/navigation/routes';

// WebBrowser.maybeCompleteAuthSession(); // 더 이상 사용하지 않음

const E2E_ACCESS_TOKEN = process.env.EXPO_PUBLIC_E2E_ACCESS_TOKEN;

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
  signOut: () => Promise<void>;
  markProfileComplete: () => Promise<void>;
  setVisibility: (next: 'public' | 'hidden' | 'matched') => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initial }: { children: ReactNode; initial?: Session }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authFailureHandlingRef = useRef(false);
  const [session, setSession] = useState<Session>(() => {
    if (initial !== undefined) return initial;
    if (!USE_MOCK) return null;
    return {
      user: sessionUserFromProfile(),
      isProfileComplete: true,
      visibility: 'public',
    };
  });

  useEffect(() => {
    if (USE_MOCK || initial !== undefined) return;

    let cancelled = false;
    if (__DEV__ && E2E_ACCESS_TOKEN) {
      setAccessToken(E2E_ACCESS_TOKEN);
      loadSessionUser().then(({ user, invalidToken }) => {
        if (cancelled) return;
        if (invalidToken) {
          setAccessToken(null);
          setSession(null);
          return;
        }
        setSession({
          user,
          isProfileComplete: true,
          visibility: 'public',
        });
      });
      return () => {
        cancelled = true;
      };
    }

    readStoredAuthSession().then((stored) => {
      if (cancelled || !stored) return;
      setAccessToken(stored.accessToken);
      loadSessionUser().then(async ({ user, invalidToken }) => {
        if (cancelled) return;
        if (invalidToken) {
          setAccessToken(null);
          setSession(null);
          await queryClient.cancelQueries();
          queryClient.clear();
          await clearStoredAuthSession();
          return;
        }
        setSession({
          user,
          isProfileComplete: stored.basicInfo,
          visibility: 'public',
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [initial, queryClient]);

  const signIn = useCallback(async (provider: SocialProvider = 'kakao'): Promise<SignInResult> => {
    if (USE_MOCK) {
      setAccessToken('mock-access-token');
      const { user } = await loadSessionUser();
      setSession({
        user,
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

      if (__DEV__) {
        console.info('[auth] social login exchange completed', {
          provider,
          status: res.status,
          errorCode: res.error?.code,
          errorMessage: res.error?.message,
          hasAccessToken: Boolean(res.data?.accessToken),
          basicInfo: res.data?.basicInfo,
          preferenceInfo: res.data?.preferenceInfo,
        });
      }

      if (res.error || res.status !== 200 || !res.data?.accessToken) {
        return {
          status: classifyApiError(res.error?.code, res.error?.message),
          provider,
          code: res.error?.code,
          message: res.error?.message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
        };
      }

      setAccessToken(res.data.accessToken);
      await writeStoredAuthSession({
        accessToken: res.data.accessToken,
        basicInfo: res.data.basicInfo,
        preferenceInfo: res.data.preferenceInfo,
        savedAt: new Date().toISOString(),
      });
      const { user, invalidToken } = await loadSessionUser();
      if (invalidToken) {
        setAccessToken(null);
        await clearStoredAuthSession();
        return {
          status: 'failed',
          provider,
          code: 'INVALID_ACCESS_TOKEN',
          message: '로그인 토큰을 확인하지 못했습니다. 다시 시도해주세요.',
        };
      }
      setSession({
        user,
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
      if (__DEV__) {
        console.warn('[auth] social login failed before session persistence', {
          provider,
          code,
          message,
        });
      }
      return {
        status: classifyThrownError(code, message),
        provider,
        code,
        message: message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    setAccessToken(null);
    setSession(null);
    await queryClient.cancelQueries();
    queryClient.clear();
    await clearStoredAuthSession();
  }, [queryClient]);

  const markProfileComplete = useCallback(async () => {
    setSession((prev) => (prev ? { ...prev, isProfileComplete: true } : prev));
    await markStoredProfileComplete();
  }, []);

  const setVisibility = useCallback((next: 'public' | 'hidden' | 'matched') => {
    setSession((prev) => (prev ? { ...prev, visibility: next } : prev));
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      if (authFailureHandlingRef.current) return;
      authFailureHandlingRef.current = true;

      void (async () => {
        try {
          try {
            await signOut();
          } catch (error) {
            if (__DEV__) {
              console.warn('[auth] failed to clear expired session', error);
            }
          }
          if (router.canDismiss()) {
            router.dismissAll();
          }
          goKakaoLogin(router, 'replace');
        } catch (error) {
          if (__DEV__) {
            console.warn('[auth] failed to route after session expiration', error);
          }
        } finally {
          authFailureHandlingRef.current = false;
        }
      })();
    });
    return () => setAuthFailureHandler(null);
  }, [router, signOut]);

  const value = useMemo<SessionContextValue>(
    () => ({ session, signIn, signOut, markProfileComplete, setVisibility }),
    [session, signIn, signOut, markProfileComplete, setVisibility],
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
  let result;
  try {
    result = await kakaoLogin();
  } catch (error: any) {
    if (__DEV__) {
      console.warn('[auth] Kakao SDK login rejected', {
        code: typeof error?.code === 'string' ? error.code : undefined,
        message: typeof error?.message === 'string' ? error.message : undefined,
      });
    }
    throw error;
  }
  if (__DEV__) {
    console.info('[auth] Kakao SDK login resolved', {
      hasAccessToken: Boolean(result.accessToken),
      hasRefreshToken: Boolean(result.refreshToken),
    });
  }
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

async function loadSessionUser(): Promise<{ user: UserSummary; invalidToken: boolean }> {
  try {
    const res = await getProfileAll();
    if (res.status === 200 && !res.error) {
      return { user: sessionUserFromProfile(res.data), invalidToken: false };
    }
    if (isInvalidTokenResponse(res.status, res.error?.code)) {
      return { user: sessionUserFromProfile(), invalidToken: true };
    }
  } catch {
    // 로그인 성공 후 프로필 조회가 실패해도 세션 자체는 유지한다.
  }
  return { user: sessionUserFromProfile(), invalidToken: false };
}

function isInvalidTokenResponse(status: number, code?: string): boolean {
  const normalized = code?.toUpperCase() ?? '';
  return (
    status === 401 || normalized.includes('UNAUTHORIZED') || normalized.includes('TOKEN_EXPIRED')
  );
}

function sessionUserFromProfile(profile?: ProfileAllData): UserSummary {
  const region = parseProfileRegion(profile?.region?.[0]?.region);
  return {
    id: getAccessTokenMemberId() ?? 'me',
    name: '사용자',
    age: 0,
    gender: 'other',
    preferredGender: 'any',
    bio: '',
    region,
    badges: [],
    lifestyle: {},
    importantConditions:
      profile?.lifestyles?.map((item) => item.description ?? item.name ?? '') ?? [],
  };
}

function parseProfileRegion(value?: string) {
  if (!value) return { id: 'unknown', city: '-', district: '' };
  const [city = value, district = ''] = value.split(' ');
  return {
    id: value,
    city,
    district,
  };
}
