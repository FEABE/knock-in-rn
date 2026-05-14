# Kakao Login

세 가지 구현을 같이 둬서 비교할 수 있게 했습니다.

## 1) Library — `@react-native-seoul/kakao-login`

- 카카오 공식 네이티브 SDK를 RN으로 래핑한 패키지
- KakaoTalk 앱이 설치되어 있으면 앱 스위칭, 아니면 카카오 계정 웹 로그인
- **Expo Go에서 동작 안 함** — `expo prebuild` + dev client 필요
- 사용 코드: `lib/auth/kakao-library.ts`

### 셋업

1. Kakao Developers (https://developers.kakao.com) 에서 앱 생성 후 **네이티브 앱 키** 발급
2. iOS / Android 플랫폼 등록 (Bundle ID / Package name)
3. `.env` 에 키 등록:
   ```
   EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=...
   ```
4. `app.config.ts` 에서 이 키를 `@react-native-seoul/kakao-login` config plugin 으로 주입함
5. `npx expo prebuild` 후 dev client 빌드:
   ```
   npx expo prebuild --clean
   npx expo run:ios   # 또는 run:android
   ```

## 2) Raw — `expo-auth-session` + REST 직접 호출

- 라이브러리 없이 OAuth 2.0 + PKCE 플로우를 직접 구현
- `expo-web-browser`로 카카오 인가 페이지 열고, redirect URI로 돌아온 code를 `kauth.kakao.com/oauth/token`에 POST 해서 토큰 교환, `kapi.kakao.com/v2/user/me`로 프로필 조회
- **Expo Go에서도 동작**
- 사용 코드: `lib/auth/kakao-raw.ts`

### 셋업

1. Kakao Developers에서 **REST API 키** 발급
2. 플랫폼 → Web (또는 Android/iOS)에서 redirect URI 등록:
   - 개발 중 (Expo Go): `exp://<your-host>/--/auth/kakao` 형태 — `Linking.createURL('auth/kakao')` 결과를 콘솔에서 찍어 정확히 복사해서 등록
   - 빌드 후: `knockinrn://auth/kakao`
3. `.env` 에 키 등록:
   ```
   EXPO_PUBLIC_KAKAO_REST_API_KEY=...
   ```

## 3) Web SDK — Kakao JavaScript SDK (`kakao.min.js`)

- 카카오 공식 **웹 전용** SDK. `<script>` 동적 로드 후 `Kakao.init(JS_KEY)` → `Kakao.Auth.authorize({ redirectUri })` **풀 페이지 리다이렉트**.
- **v2.x 부터 `Kakao.Auth.login()` (popup) 은 제거됨** — `authorize` 만 남았고 redirect 방식
- 콜백 페이지에서 `?code=` 를 읽어 `/oauth/token` 으로 교환 → `Kakao.Auth.setAccessToken` → `Kakao.API.request('/v2/user/me')`
- **Web 전용** — `Platform.OS === 'web'` 가드 들어있음
- 사용 코드: `lib/auth/kakao-web-sdk.ts`

### 셋업

1. Kakao Developers에서 **JavaScript 키** + **REST API 키** 발급 (Web SDK 도 토큰 교환은 REST 키로)
2. 플랫폼 → Web → 사이트 도메인 등록 (`http://localhost:8081`)
3. 카카오 로그인 → Redirect URI 등록 (`http://localhost:8081/kakao-login`)
4. `.env`:
   ```
   EXPO_PUBLIC_KAKAO_JS_KEY=...
   EXPO_PUBLIC_KAKAO_REST_API_KEY=...
   ```

### API

```ts
import { startKakaoWebLogin, completeKakaoWebLoginIfPending } from '@/lib/auth';

// 버튼 onPress
await startKakaoWebLogin(); // 페이지가 카카오로 이동 — 함수는 navigate 직전에 끝남

// 화면 mount useEffect 안에서
const result = await completeKakaoWebLoginIfPending();
if (result) { /* { auth, profile } */ }
```

## 비교

| 항목 | Library (native) | Raw | Web SDK |
| --- | --- | --- | --- |
| 대상 플랫폼 | iOS / Android | iOS / Android / Web | Web 전용 |
| 사용 키 | Native App Key | REST API Key | JavaScript Key |
| Expo Go 동작 | X | O | (web만) |
| KakaoTalk 앱 스위칭 | O | X | X |
| Redirect URI 등록 | (앱키 자동) | 필요 | 불필요 (popup) |
| 코드 양 | 적음 | 많음 | 적음 |
| 토큰 갱신 | SDK 관리 | 직접 `refresh_token` | SDK 관리 |

실서비스 권장:
- iOS/Android → Library
- Web → Web SDK
- 둘 다 → `Platform.OS` 분기

Raw 구현은 학습용 / Expo Go 시연용 / 백엔드가 OAuth 흐름 전체를 가져가는 경우 참고용.

## 호출 예시

```tsx
import {
  loginWithKakaoLibrary,
  loginWithKakaoRaw,
  loginWithKakaoWebSDK,
} from '@/lib/auth';
import { Platform } from 'react-native';

const result = Platform.OS === 'web'
  ? await loginWithKakaoWebSDK()
  : await loginWithKakaoLibrary();
```

데모 화면: `app/kakao-login.tsx` (`/kakao-login` 라우트).
