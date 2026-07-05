import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from '@/lib/auth/session-storage';

import type { Session, UserSummary } from './types';
import {
  getProfileAll,
  setAccessToken,
  socialLoginSdk,
  socialLoginWeb,
  type ProfileAllData,
  type SocialProvider,
  USE_MOCK,
} from '@/lib/api';

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
  setVisibility: (next: 'public' | 'hidden' | 'matched') => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initial }: { children: ReactNode; initial?: Session }) {
  const queryClient = useQueryClient();
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
      loadSessionUser().then((user) => {
        if (cancelled) return;
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
      loadSessionUser().then((user) => {
        if (cancelled) return;
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
  }, [initial]);

  const signIn = useCallback(async (provider: SocialProvider = 'kakao'): Promise<SignInResult> => {
    if (USE_MOCK) {
      setAccessToken('mock-access-token');
      setSession({
        user: await loadSessionUser(),
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
      await writeStoredAuthSession({
        accessToken: res.data.accessToken,
        basicInfo: res.data.basicInfo,
        preferenceInfo: res.data.preferenceInfo,
        savedAt: new Date().toISOString(),
      });
      const user = await loadSessionUser();
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
    await clearStoredAuthSession();
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

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

async function loadSessionUser(): Promise<UserSummary> {
  try {
    const res = await getProfileAll();
    if (res.status === 200 && !res.error) return sessionUserFromProfile(res.data);
  } catch {
    // 로그인 성공 후 프로필 조회가 실패해도 세션 자체는 유지한다.
  }
  return sessionUserFromProfile();
}

function sessionUserFromProfile(profile?: ProfileAllData): UserSummary {
  const region = parseProfileRegion(profile?.region?.[0]?.region);
  return {
    id: 'me',
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
