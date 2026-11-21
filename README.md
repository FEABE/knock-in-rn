# KnockIn (노크인)

룸메이트를 구하는 사람과 방을 가진 사람을 이어 주는 룸메이트 매칭 앱입니다.
연합 IT 동아리 프로그라피 11기 1팀이 만들었고, App Store와 Google Play에 출시해 운영하고 있습니다.

- 서비스: https://www.knock-in.com
- 백엔드 저장소: https://github.com/prography/11th-1team-BE

## 주요 기능

- 온보딩: 기본 정보, 생활 패턴, 방 조건, 선호 조건 입력
- 탐색: 룸메이트 찾기와 방 게시글 목록, 지역·조건 필터, 관심 등록
- 채팅: 룸메이트 요청과 수락, 실시간 메시지, 사진 전송
- 알림: 푸시 알림과 앱 안 알림 목록
- 신원 인증, 신고·차단, 마이페이지, 고객 지원
- 카카오 로그인, Apple 로그인

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 앱 | React Native 0.81, Expo 54, TypeScript |
| 화면 이동 | expo-router |
| 서버 상태 | TanStack Query |
| 스타일 | NativeWind (Tailwind CSS) |
| 실시간 | STOMP 웹소켓(채팅), SSE(알림) |
| 푸시·분석 | Firebase Cloud Messaging, Firebase Analytics |
| 로그인 | 카카오 로그인, Apple 로그인 |
| 빌드 | EAS Build |

## 폴더 구조

```
app/          화면 경로 (expo-router). (tabs), chat, onboarding, room, roommate, mypage ...
components/   화면별 컴포넌트. chat, onboarding, room, roommate, mypage, ui ...
lib/api/      서버 호출, OpenAPI 타입, 채팅 소켓, 알림 스트림
lib/auth/     로그인과 세션 저장
lib/domain/   화면과 서버 스키마 사이의 도메인 모델
plugins/      Expo 설정 플러그인 (카카오 로그인 Android 설정)
patches/      patch-package 로 고친 라이브러리 (Firebase)
scripts/      OpenAPI 타입 생성 스크립트
docs/         QA 기록, 설계 문서
```

## 코드 규칙

- **VAC 패턴**: 화면은 `*.view.tsx`(그리기만 하는 컴포넌트)와 `use-*.ts`(상태와 동작)로 나눕니다. 디자인이 바뀌면 view 파일만 고칩니다.
- **OpenAPI 타입 생성**: 서버의 API 문서에서 타입을 만들어 `lib/api/openapi-types.ts`에 둡니다. 서버와 앱의 약속이 어긋나면 타입 검사에서 먼저 드러납니다.
- **실시간 연결**: 채팅(`lib/api/use-chat-socket.ts`)과 알림(`lib/api/use-alarm-stream.ts`)은 앱이 백그라운드로 가면 연결을 내리고, 돌아오면 다시 연결합니다. 재시도는 간격을 늘려 가며 횟수에 한도를 둡니다.

## 실행

Firebase와 카카오 로그인 같은 네이티브 모듈을 쓰기 때문에 Expo Go가 아닌 개발 빌드로 실행합니다.

```bash
npm install
cp .env.example .env    # 카카오 키와 API 서버 주소를 채웁니다
npx expo run:android    # 또는 npx expo run:ios
```

API 타입을 다시 만들 때는 아래 명령을 씁니다.

```bash
node scripts/generate-openapi-types.js
```

## 브랜치

개발은 `dev` 브랜치에서 진행합니다.
