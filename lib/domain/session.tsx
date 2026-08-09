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
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  clearStoredAuthSession,
  markStoredPreferenceComplete,
  markStoredProfileComplete,
  readStoredAuthSession,
  writeStoredAuthSession,
  type StoredAuthIdentity,
} from '@/lib/auth/session-storage';
import { signInWithAppleSdk } from '@/lib/auth/apple-native';
import { signInWithAppleWeb } from '@/lib/auth/apple-web';
import {
  subscribeToPushTokenRefresh,
  syncPushDevice,
} from '@/lib/notifications/device-registration';

import type { Session, UserSummary } from './types';
import {
  getProfileAll,
  getAccessTokenMemberId,
  setAuthFailureHandler,
  setAccessToken,
  socialLoginSdk,
  type LoginData,
  type LoginDeleteInfo,
  type ProfileAllData,
  type SocialProvider,
  USE_MOCK,
} from '@/lib/api';
import { goKakaoLogin } from '@/lib/navigation/routes';

// WebBrowser.maybeCompleteAuthSession(); // 더 이상 사용하지 않음

export type SignInFailureKind = 'cancelled' | 'network' | 'failed' | 'withdrawn' | 'suspended';

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
  markProfileComplete: (identity?: StoredAuthIdentity) => Promise<void>;
  markPreferenceComplete: () => Promise<void>;
  refreshSessionUser: () => Promise<void>;
  setVisibility: (next: 'public' | 'hidden' | 'matched') => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initial }: { children: ReactNode; initial?: Session }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authFailureHandlingRef = useRef(false);
  const manualSignOutRef = useRef(false);
  const [session, setSession] = useState<Session>(() => {
    if (initial !== undefined) return initial;
    if (!USE_MOCK) return null;
    return {
      user: sessionUserFromProfile(),
      isProfileComplete: true,
      preferenceInfo: false,
      visibility: 'public',
    };
  });

  useEffect(() => {
    if (USE_MOCK || initial !== undefined) return;

    let cancelled = false;

    readStoredAuthSession().then((stored) => {
      if (cancelled || !stored) return;
      setAccessToken(stored.accessToken);
      loadSessionUser(stored.identity).then(
        async ({ user, invalidToken, profileComplete, visibility }) => {
          if (cancelled) return;
          const isProfileComplete = stored.basicInfo || profileComplete === true;
          // 기본정보 입력 전에 앱을 끄면 토큰만 남는다. 이 상태로 세션을 복원하면
          // 이름 없는 "사용자"로 전 화면 접근이 가능해지므로, 미완성 가입은 복원하지
          // 않고 로그인부터 다시 진행하게 한다.
          if (invalidToken || !isProfileComplete) {
            setAccessToken(null);
            setSession(null);
            await queryClient.cancelQueries();
            queryClient.clear();
            await clearStoredAuthSession();
            return;
          }
          setSession({
            user,
            isProfileComplete,
            preferenceInfo: stored.preferenceInfo === true,
            visibility: visibility ?? 'public',
          });
        },
      );
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
        preferenceInfo: false,
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
      // Apple은 iOS만 네이티브 SDK를 쓸 수 있어서, 안드로이드는 백엔드의 웹 OAuth 플로우를
      // 브라우저로 태운다(apple-web.ts). 두 경로 모두 동일한 ApiResponse<LoginData>를 돌려주므로
      // 아래 후처리(탈퇴/정지 분기, 세션 저장)는 그대로 공유된다.
      const res =
        provider === 'kakao'
          ? await signInWithKakaoSdk()
          : Platform.OS === 'ios'
            ? await signInWithAppleSdk()
            : await signInWithAppleWeb();

      if (res.error || res.status !== 200 || !res.data?.accessToken) {
        // 탈퇴/정지는 error가 아니라 deleteInfo로만 통보되므로 가장 먼저 확인한다.
        const blocked = classifyDeleteInfo(res.data?.deleteInfo);
        if (blocked) {
          return { ...blocked, provider };
        }

        const serverUnavailable = res.status >= 500;
        console.warn('[auth] social login api failed', {
          provider,
          status: res.status,
          code: res.error?.code ?? `HTTP_${res.status}`,
          message: res.error?.message,
        });
        return {
          status: serverUnavailable
            ? 'network'
            : classifyApiError(res.error?.code, res.error?.message),
          provider,
          code: res.error?.code ?? `HTTP_${res.status}`,
          message: serverUnavailable
            ? '운영 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'
            : (res.error?.message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.'),
        };
      }

      setAccessToken(res.data.accessToken);
      const identity = identityFromLogin(res.data);
      const { user, invalidToken, profileComplete, visibility } = await loadSessionUser(identity);
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
      const isProfileComplete = res.data.basicInfo || profileComplete === true;
      await writeStoredAuthSession({
        accessToken: res.data.accessToken,
        basicInfo: isProfileComplete,
        preferenceInfo: res.data.preferenceInfo,
        savedAt: new Date().toISOString(),
        identity,
      });
      setSession({
        user,
        isProfileComplete,
        preferenceInfo: res.data.preferenceInfo === true,
        visibility: visibility ?? 'public',
      });

      return {
        status: 'success',
        provider,
        isProfileComplete,
        preferenceInfo: res.data.preferenceInfo,
      };
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : undefined;
      const message = typeof e?.message === 'string' ? e.message : undefined;
      console.warn('[auth] social login threw', {
        provider,
        code,
        message,
        name: typeof e?.name === 'string' ? e.name : undefined,
      });
      return {
        status: classifyThrownError(code, message),
        provider,
        code,
        message: message ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    manualSignOutRef.current = true;
    setAccessToken(null);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await clearStoredAuthSession();
    } finally {
      setSession(null);
    }
  }, [queryClient]);

  const markProfileComplete = useCallback(async (identity?: StoredAuthIdentity) => {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            user: applyIdentity(prev.user, identity),
            isProfileComplete: true,
          }
        : prev,
    );
    await markStoredProfileComplete(identity);
  }, []);

  const markPreferenceComplete = useCallback(async () => {
    setSession((prev) => (prev ? { ...prev, preferenceInfo: true } : prev));
    await markStoredPreferenceComplete();
  }, []);

  const refreshSessionUser = useCallback(async () => {
    const stored = await readStoredAuthSession();
    const loaded = await loadSessionUser(stored?.identity);
    if (loaded.invalidToken) {
      await signOut();
      return;
    }
    setSession((previous) =>
      previous
        ? {
            ...previous,
            user: loaded.user,
            isProfileComplete: previous.isProfileComplete || loaded.profileComplete === true,
            visibility: loaded.visibility ?? previous.visibility,
          }
        : previous,
    );
  }, [signOut]);

  const setVisibility = useCallback((next: 'public' | 'hidden' | 'matched') => {
    setSession((prev) => (prev ? { ...prev, visibility: next } : prev));
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      if (manualSignOutRef.current) return;
      if (authFailureHandlingRef.current) return;
      authFailureHandlingRef.current = true;

      void (async () => {
        try {
          try {
            await signOut();
          } catch {
            // 세션 정리에 실패해도 만료 처리 라우팅은 계속 진행한다.
          }
          if (router.canDismiss()) {
            router.dismissAll();
          }
          goKakaoLogin(router, 'replace');
        } catch {
          // 라우터 상태가 바뀐 경우에는 다음 인증 이벤트에서 다시 처리된다.
        } finally {
          authFailureHandlingRef.current = false;
        }
      })();
    });
    return () => setAuthFailureHandler(null);
  }, [router, signOut]);

  useEffect(() => {
    if (session) manualSignOutRef.current = false;
  }, [session]);

  const sessionUserId = session?.user.id;

  useEffect(() => {
    if (!sessionUserId || USE_MOCK) return;

    let cancelled = false;
    void syncPushDevice({ requestPermission: true }).then(() => {
      if (cancelled) return;
    });

    try {
      const unsubscribe = subscribeToPushTokenRefresh();
      return () => {
        cancelled = true;
        unsubscribe();
      };
    } catch {
      // Firebase가 초기화되지 않은 개발 환경에서는 토큰 갱신 구독 없이 진행한다.
    }
    return () => {
      cancelled = true;
    };
  }, [sessionUserId]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      signIn,
      signOut,
      markProfileComplete,
      markPreferenceComplete,
      refreshSessionUser,
      setVisibility,
    }),
    [
      session,
      signIn,
      signOut,
      markProfileComplete,
      markPreferenceComplete,
      refreshSessionUser,
      setVisibility,
    ],
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

const WITHDRAWN_FALLBACK_MESSAGE = '탈퇴 후 3일이 지나면 재가입할 수 있어요';
const SUSPENDED_FALLBACK_MESSAGE =
  '서비스 이용이 제한된 계정이에요\n자세한 내용은 고객센터로 문의해주세요';

/**
 * 탈퇴/정지 회원 판정.
 *
 * 서버는 이 경우에도 예외를 던지지 않고 `error: null` + HTTP 401 + accessToken만 null인
 * 성공 바디를 준다. 따라서 error 코드/메시지 휴리스틱으로는 절대 잡히지 않고,
 * `deleteInfo.delete` 하나만 신뢰할 수 있다.
 *
 * 탈퇴와 정지 역시 같은 boolean으로 합쳐져 오고 reason으로만 구분된다.
 * 탈퇴는 고정 문구 `"탈퇴한 회원입니다."`, 정지는 관리자 자유 입력(null 가능)이다.
 */
function classifyDeleteInfo(
  deleteInfo?: LoginDeleteInfo,
): { status: 'withdrawn' | 'suspended'; code: string; message: string } | null {
  if (deleteInfo?.delete !== true) return null;

  const reason = deleteInfo.reason?.trim() ?? '';
  if (reason.includes('탈퇴')) {
    return {
      status: 'withdrawn',
      code: 'MEMBER_WITHDRAWN',
      message: WITHDRAWN_FALLBACK_MESSAGE,
    };
  }
  return {
    status: 'suspended',
    code: 'MEMBER_SUSPENDED',
    // 관리자가 입력한 정지 사유를 그대로 노출하고, 비어 있으면 기본 문구로 폴백한다.
    message: reason || SUSPENDED_FALLBACK_MESSAGE,
  };
}

function classifyApiError(code?: string, message?: string): SignInFailureKind {
  const lower = `${code ?? ''} ${message ?? ''}`.toLowerCase();
  // 서버 명세(openapi-types)에 탈퇴/정지 전용 에러 코드 enum이 없어서
  // code/message 문자열 포함 여부로 매핑한다. 확정 코드가 생기면 여기만 갱신하면 된다.
  if (lower.includes('withdraw') || lower.includes('탈퇴')) return 'withdrawn';
  if (lower.includes('suspend') || lower.includes('정지')) return 'suspended';
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

/** 서버 공개범위(memberPrivacyType)를 세션 visibility 값으로 변환. 모르면 null. */
function visibilityFromProfile(profile?: ProfileAllData): 'public' | 'hidden' | null {
  const privacy = profile?.userInfo?.memberPrivacyType;
  if (privacy === 'PRIVATE') return 'hidden';
  if (privacy === 'PUBLIC') return 'public';
  return null;
}

async function loadSessionUser(identity?: StoredAuthIdentity): Promise<{
  user: UserSummary;
  invalidToken: boolean;
  profileComplete: boolean | null;
  /** 서버 기준 프로필 공개범위. 조회 실패 시 null. */
  visibility: 'public' | 'hidden' | null;
}> {
  try {
    const res = await getProfileAll();
    if (res.status === 200 && !res.error) {
      return {
        user: sessionUserFromProfile(res.data, identity),
        invalidToken: false,
        profileComplete: isProfilePayloadComplete(res.data),
        visibility: visibilityFromProfile(res.data),
      };
    }
    if (isInvalidTokenResponse(res.status, res.error?.code)) {
      return {
        user: sessionUserFromProfile(undefined, identity),
        invalidToken: true,
        profileComplete: null,
        visibility: null,
      };
    }
  } catch {
    // 로그인 성공 후 프로필 조회가 실패해도 세션 자체는 유지한다.
  }
  return {
    user: sessionUserFromProfile(undefined, identity),
    visibility: null,
    invalidToken: false,
    profileComplete: null,
  };
}

function isInvalidTokenResponse(status: number, code?: string): boolean {
  const normalized = code?.toUpperCase() ?? '';
  return (
    status === 401 || normalized.includes('UNAUTHORIZED') || normalized.includes('TOKEN_EXPIRED')
  );
}

type ProfileIdentityData = ProfileAllData &
  Partial<{
    memberId: number;
    name: string;
    memberName: string;
    birth: string;
    age: number;
    memberAge: number;
    gender: 'MALE' | 'FEMALE';
    profileImageUrl: string;
    memberProfileImageUrl: string;
  }>;

function sessionUserFromProfile(
  profile?: ProfileAllData,
  fallback?: StoredAuthIdentity,
): UserSummary {
  const identity = profile as ProfileIdentityData | undefined;
  const userInfo = profile?.userInfo;
  const region = parseProfileRegion(profile?.region?.[0]?.region);
  return {
    id: String(identity?.memberId ?? getAccessTokenMemberId() ?? 'me'),
    name: userInfo?.name ?? identity?.name ?? identity?.memberName ?? fallback?.name ?? '사용자',
    age:
      userInfo?.age ??
      identity?.age ??
      identity?.memberAge ??
      fallback?.age ??
      ageFromBirth(userInfo?.birth ?? identity?.birth ?? fallback?.birth),
    gender: domainGender(userInfo?.gender ?? identity?.gender ?? fallback?.gender),
    preferredGender: fallback?.preferredGender ?? 'any',
    bio: '',
    avatarUrl:
      userInfo?.profile ??
      identity?.profileImageUrl ??
      identity?.memberProfileImageUrl ??
      fallback?.profileImageUrl,
    region,
    badges: [],
    lifestyle: {},
    importantConditions:
      profile?.lifestyles?.map((item) => item.description ?? item.name ?? '') ?? [],
  };
}

function identityFromLogin(data: LoginData): StoredAuthIdentity | undefined {
  const name = data.name ?? data.memberName;
  const profileImageUrl = data.profileImageUrl ?? data.memberProfileImageUrl;
  if (!name && !data.birth && data.memberAge == null && !data.gender && !profileImageUrl) {
    return undefined;
  }
  return {
    name,
    birth: data.birth,
    age: data.memberAge,
    gender: data.gender,
    profileImageUrl,
  };
}

function applyIdentity(user: UserSummary, identity?: StoredAuthIdentity): UserSummary {
  if (!identity) return user;
  return {
    ...user,
    name: identity.name ?? user.name,
    age: identity.age ?? (ageFromBirth(identity.birth) || user.age),
    gender: identity.gender ? domainGender(identity.gender) : user.gender,
    preferredGender: identity.preferredGender ?? user.preferredGender,
    avatarUrl: identity.profileImageUrl ?? user.avatarUrl,
  };
}

function isProfilePayloadComplete(profile?: ProfileAllData): boolean {
  return Boolean(
    profile?.type ||
    profile?.lifestyles?.length ||
    profile?.region?.length ||
    profile?.roomProfile?.length,
  );
}

function domainGender(value?: 'MALE' | 'FEMALE'): UserSummary['gender'] {
  if (value === 'MALE') return 'male';
  if (value === 'FEMALE') return 'female';
  return 'other';
}

function ageFromBirth(value?: string): number {
  if (!value) return 0;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  return Math.max(0, age);
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
