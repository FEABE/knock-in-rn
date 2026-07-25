import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { socialLoginSdk } from '@/lib/api/auth';

/**
 * Apple 인증은 iOS에서만 실행하고, Apple이 발급한 원본 토큰은 백엔드에서 검증한다.
 */
export async function signInWithAppleSdk() {
  if (Platform.OS !== 'ios' || !(await AppleAuthentication.isAvailableAsync())) {
    throw new AppleSignInError(
      'APPLE_LOGIN_UNAVAILABLE',
      'Apple 로그인은 iOS 기기에서 이용할 수 있어요.',
    );
  }

  const credential = await AppleAuthentication.signInAsync();
  if (!credential.identityToken) {
    throw new AppleSignInError(
      'APPLE_IDENTITY_TOKEN_MISSING',
      'Apple 인증 정보를 받지 못했습니다. 다시 시도해주세요.',
    );
  }

  return socialLoginSdk('apple', {
    identity_token: credential.identityToken,
    authorization_code: credential.authorizationCode ?? undefined,
  });
}

class AppleSignInError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppleSignInError';
  }
}
