import { Platform } from 'react-native';
import {
  getProfile as sdkGetProfile,
  login as sdkLogin,
  logout as sdkLogout,
  type KakaoOAuthToken,
  type KakaoProfile,
} from '@react-native-seoul/kakao-login';

export type KakaoLoginResult = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  scopes: string[];
  profile: KakaoProfile;
};

export async function loginWithKakaoLibrary(): Promise<KakaoLoginResult> {
  if (Platform.OS === 'web') {
    throw new Error(
      '@react-native-seoul/kakao-login does not support browser-based login. Use loginWithKakaoWebSDK on web, or build a dev client for iOS/Android.',
    );
  }
  const token: KakaoOAuthToken = await sdkLogin();
  const profile = await sdkGetProfile();

  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    scopes: token.scopes ?? [],
    profile,
  };
}

export async function logoutWithKakaoLibrary(): Promise<void> {
  if (Platform.OS === 'web') return;
  await sdkLogout();
}
