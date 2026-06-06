/**
 * API 레이어 배럴.
 *
 * 사용 예:
 *   import { getRoommateBoards, type BoardListItem } from '@/lib/api';
 *
 * 모든 클라이언트 함수는 명세의 `{ status, data, error }` 엔벨로프를 반환하며,
 * 기본은 mock 응답이다. 실서버 연동은 .env 에서:
 *   EXPO_PUBLIC_API_BASE_URL=https://api.example.com
 *   EXPO_PUBLIC_USE_MOCK=false
 */
export * from './client';
export * from './entities';

// React 데이터 훅 + 어댑터
export * from './adapters';
export * from './use-async';
export * from './use-roommate';
export * from './use-chat';

export * from './auth';
export * from './profile';
export * from './meta';
export * from './roommate-boards';
export * from './chat-requests';
export * from './chat';
export * from './verification';
export * from './roommate';
export * from './notification';
