import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import axios from 'axios';

import { MOCK_SESSION_USER } from './mock';
import type { Session } from './types';
import { setAccessToken, USE_MOCK } from '@/lib/api';

// WebBrowser.maybeCompleteAuthSession(); // 더 이상 사용하지 않음

export type SessionContextValue = {
  session: Session;
  signIn: () => Promise<void>;
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

  const signIn = useCallback(async () => {
    if (USE_MOCK) {
      setAccessToken('mock-access-token');
      setSession({
        user: MOCK_SESSION_USER,
        isProfileComplete: true,
        visibility: 'public',
      });
      return;
    }

    try {
      console.log('🚀 카카오 네이티브 SDK 로그인을 시작합니다.');

      // 1. 카카오 네이티브 SDK 호출
      const result = await kakaoLogin();
      console.log(
        '✅ 카카오 로그인 성공! 액세스 토큰 획득:',
        result.accessToken.slice(0, 15) + '...',
      );

      // 2. 백엔드 서버로 카카오 액세스 토큰 전송
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080';

      // 백엔드 SDK 로그인 엔드포인트 (CustomOAuth2Filter: POST /sdk/oauth2/authorization/{provider})
      const BACKEND_LOGIN_API = `${API_BASE_URL}/sdk/oauth2/authorization/kakao`;

      console.log('🌐 백엔드로 토큰을 전송합니다:', BACKEND_LOGIN_API);

      // 백엔드 KakaoSdkRequest DTO 형식: { authObj: { access_token, refresh_token } }
      const response = await axios.post(
        BACKEND_LOGIN_API,
        {
          authObj: {
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('🚀 백엔드 응답 결과:', response.data);

      // 백엔드가 어떤 형태(CommonResponse)로 주는지에 따라 파싱
      const backendData = response.data.data || response.data;
      const accessToken = backendData?.accessToken || backendData?.token;
      const isBasicInfoComplete =
        backendData?.basicInfo === true || backendData?.isProfileComplete === true;

      if (accessToken) {
        console.log('🔑 서비스 토큰 발급 성공:', accessToken.slice(0, 15) + '...');
        setAccessToken(accessToken);
        setSession({
          user: MOCK_SESSION_USER,
          isProfileComplete: isBasicInfoComplete,
          visibility: 'public',
        });
      } else {
        console.warn('⚠️ 백엔드 응답에서 토큰을 찾을 수 없습니다.', backendData);
      }
    } catch (e: any) {
      console.error('🔥 카카오 SDK 로그인 에러 code:', e?.code, '| message:', e?.message);
      console.error('🔥 상세(full):', JSON.stringify(e, Object.getOwnPropertyNames(e ?? {})));
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
