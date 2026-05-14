import { Platform } from 'react-native';

import { KAKAO_CONFIG, KAKAO_ENDPOINTS } from './kakao-config';

export type KakaoWebTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_token_expires_in: number;
  scope?: string;
};

export type KakaoWebProfileResponse = {
  id: number;
  connected_at?: string;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email?: string;
  };
};

type KakaoGlobal = {
  init: (jsKey: string) => void;
  isInitialized: () => boolean;
  cleanup: () => void;
  Auth: {
    authorize: (options: {
      redirectUri: string;
      state?: string;
      scope?: string;
      throughTalk?: boolean;
    }) => void;
    setAccessToken: (token: string) => void;
    getAccessToken: () => string | null;
    logout: (callback?: () => void) => void;
  };
  API: {
    request: (options: {
      url: string;
      data?: Record<string, unknown>;
    }) => Promise<KakaoWebProfileResponse>;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoGlobal;
  }
}

export type KakaoWebLoginResult = {
  auth: KakaoWebTokenResponse;
  profile: KakaoWebProfileResponse;
};

const STATE_STORAGE_KEY = 'kakaoWebSdk:state';

const getRedirectUri = (): string =>
  `${window.location.origin}/kakao-login`;

let sdkPromise: Promise<KakaoGlobal> | null = null;

const loadKakaoSdk = (): Promise<KakaoGlobal> => {
  if (Platform.OS !== 'web') {
    return Promise.reject(
      new Error('Kakao JS SDK is web-only. Use loginWithKakaoLibrary on native.'),
    );
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('window/document not available'));
  }
  if (!KAKAO_CONFIG.jsKey) {
    return Promise.reject(new Error('EXPO_PUBLIC_KAKAO_JS_KEY is not set.'));
  }
  if (window.Kakao && window.Kakao.isInitialized()) {
    return Promise.resolve(window.Kakao);
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<KakaoGlobal>((resolve, reject) => {
    const finishInit = () => {
      const Kakao = window.Kakao;
      if (!Kakao) {
        reject(new Error('Kakao SDK loaded but window.Kakao is missing'));
        return;
      }
      if (!Kakao.isInitialized()) Kakao.init(KAKAO_CONFIG.jsKey);
      resolve(Kakao);
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk="true"]',
    );
    if (existing) {
      if (window.Kakao) finishInit();
      else existing.addEventListener('load', finishInit, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_CONFIG.webSdkUrl;
    script.async = true;
    script.dataset.kakaoSdk = 'true';
    script.onload = finishInit;
    script.onerror = () => reject(new Error('Failed to load Kakao JS SDK'));
    document.head.appendChild(script);
  });

  return sdkPromise;
};

const generateState = (): string => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
};

export async function startKakaoWebLogin(): Promise<void> {
  const Kakao = await loadKakaoSdk();
  const state = generateState();
  window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
  Kakao.Auth.authorize({
    redirectUri: getRedirectUri(),
    state,
    scope: 'profile_nickname,profile_image,account_email',
  });
}

export async function completeKakaoWebLoginIfPending(): Promise<KakaoWebLoginResult | null> {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const returnedState = url.searchParams.get('state');

  if (!code && !error) return null;

  const cleanUrl = `${url.pathname}${url.hash}`;
  window.history.replaceState({}, '', cleanUrl);

  if (error) {
    throw new Error(
      `Kakao authorize error: ${error}${
        url.searchParams.get('error_description')
          ? ` — ${url.searchParams.get('error_description')}`
          : ''
      }`,
    );
  }

  const expectedState = window.sessionStorage.getItem(STATE_STORAGE_KEY);
  window.sessionStorage.removeItem(STATE_STORAGE_KEY);
  if (!expectedState || expectedState !== returnedState) {
    throw new Error('State mismatch (possible CSRF)');
  }

  if (!KAKAO_CONFIG.restApiKey) {
    throw new Error(
      'EXPO_PUBLIC_KAKAO_REST_API_KEY is required for token exchange (Web SDK).',
    );
  }

  const tokenRes = await fetch(KAKAO_ENDPOINTS.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CONFIG.restApiKey,
      redirect_uri: getRedirectUri(),
      code: code!,
    }).toString(),
  });
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`);
  }
  const auth = (await tokenRes.json()) as KakaoWebTokenResponse;

  const Kakao = await loadKakaoSdk();
  Kakao.Auth.setAccessToken(auth.access_token);
  const profile = await Kakao.API.request({ url: '/v2/user/me' });

  return { auth, profile };
}

export async function logoutWithKakaoWebSDK(): Promise<void> {
  const Kakao = await loadKakaoSdk();
  await new Promise<void>((resolve) => Kakao.Auth.logout(() => resolve()));
}
