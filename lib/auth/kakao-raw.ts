import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { KAKAO_CONFIG, KAKAO_ENDPOINTS } from './kakao-config';

export type KakaoTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_token_expires_in: number;
  scope?: string;
};

export type KakaoProfileResponse = {
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

export type KakaoRawLoginResult = {
  token: KakaoTokenResponse;
  profile: KakaoProfileResponse;
};

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateCodeVerifier = (): string => {
  const random = Crypto.getRandomBytes(32);
  return base64UrlEncode(random);
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const digestHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  const bytes = new Uint8Array(digestHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(digestHex.substr(i * 2, 2), 16);
  }
  return base64UrlEncode(bytes);
};

const buildRedirectUri = (): string =>
  Linking.createURL(KAKAO_CONFIG.redirectPath);

const buildAuthorizeUrl = ({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${KAKAO_ENDPOINTS.authorize}?${params.toString()}`;
};

const parseCallbackUrl = (
  url: string,
  expectedState: string,
): { code: string } => {
  const parsed = Linking.parse(url);
  const params = (parsed.queryParams ?? {}) as Record<string, string | string[]>;
  const error = pickFirst(params.error);
  if (error) {
    throw new Error(`Kakao OAuth error: ${error}`);
  }
  const code = pickFirst(params.code);
  const state = pickFirst(params.state);
  if (!code) throw new Error('Authorization code missing in callback');
  if (state !== expectedState) throw new Error('State mismatch (possible CSRF)');
  return { code };
};

const pickFirst = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const exchangeCodeForToken = async ({
  clientId,
  redirectUri,
  code,
  codeVerifier,
}: {
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}): Promise<KakaoTokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(KAKAO_ENDPOINTS.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }
  return (await res.json()) as KakaoTokenResponse;
};

const fetchProfile = async (
  accessToken: string,
): Promise<KakaoProfileResponse> => {
  const res = await fetch(KAKAO_ENDPOINTS.profile, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Profile fetch failed (${res.status}): ${text}`);
  }
  return (await res.json()) as KakaoProfileResponse;
};

export async function loginWithKakaoRaw(): Promise<KakaoRawLoginResult> {
  const clientId = KAKAO_CONFIG.restApiKey;
  if (!clientId) {
    throw new Error(
      'EXPO_PUBLIC_KAKAO_REST_API_KEY is not set. Configure it in your .env.',
    );
  }

  const redirectUri = buildRedirectUri();
  const state = base64UrlEncode(Crypto.getRandomBytes(16));
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authorizeUrl = buildAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  });

  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);
  if (result.type !== 'success' || !result.url) {
    throw new Error(`Authorization cancelled (${result.type})`);
  }

  const { code } = parseCallbackUrl(result.url, state);
  const token = await exchangeCodeForToken({
    clientId,
    redirectUri,
    code,
    codeVerifier,
  });
  const profile = await fetchProfile(token.access_token);

  return { token, profile };
}

export async function logoutWithKakaoRaw(accessToken: string): Promise<void> {
  const res = await fetch(KAKAO_ENDPOINTS.logout, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Logout failed (${res.status}): ${text}`);
  }
}
