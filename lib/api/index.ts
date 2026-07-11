/**
 * API 레이어 배럴.
 *
 * 사용 예:
 *   import { getRoommateBoards, type BoardListItem } from '@/lib/api';
 *
 * 모든 클라이언트 함수는 명세의 `{ status, data, error }` 엔벨로프를 반환한다.
 * 로컬 백엔드 연동은 .env 에서:
 *   EXPO_PUBLIC_API_BASE_URL=https://api.example.com
 *   EXPO_PUBLIC_USE_MOCK=false
 *
 * 테스트 데이터가 필요할 때만 EXPO_PUBLIC_USE_MOCK=true 로 mock 응답을 사용한다.
 */
export * from './client';
export * from './date-time';
export * from './backend-ids';
export * from './entities';
export * from './openapi-types';

// React 데이터 훅 + 어댑터
export * from './adapters';
export * from './mappers';
export * from './use-async';
export * from './use-roommate';
export * from './use-notifications';
export * from './use-chat';
export * from './use-chat-socket';
export * from './use-support';
export * from './use-account';
export * from './use-region-options';
export * from './use-room-type-options';
export * from './use-room-add-option-options';
export * from './use-lifestyle-pattern-options';

export * from './auth';
export * from './profile';
export * from './meta';
export * from './roommate-boards';
export * from './chat-requests';
export * from './chat';
export * from './verification';
export * from './roommate';
export * from './notification';
