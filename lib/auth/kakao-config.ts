export const KAKAO_CONFIG = {
  nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
  restApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '',
  jsKey: process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '',
  redirectScheme: 'knockinrn',
  redirectPath: 'auth/kakao',
  webSdkUrl: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js',
  webSdkIntegrity:
    'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka',
} as const;

export const KAKAO_ENDPOINTS = {
  authorize: 'https://kauth.kakao.com/oauth/authorize',
  token: 'https://kauth.kakao.com/oauth/token',
  profile: 'https://kapi.kakao.com/v2/user/me',
  logout: 'https://kapi.kakao.com/v1/user/logout',
} as const;
