/**
 * 온보딩 저장/수정(POST/PUT) API 호출 on/off 플래그.
 *
 * 실 API 연동 기준 기본값은 true.
 * 필요할 때만 테스트/시연 환경에서 false 로 내려 저장 요청을 생략한다.
 */
export const ONBOARDING_WRITE_ENABLED = true;

/** 생활패턴 8문항과 방 정보 4문항을 합친 화면 진행 단계. */
export const ONBOARDING_PROGRESS_TOTAL = 12;
export const ROOM_INFO_PROGRESS_START = 9;
