/**
 * UT Firebase Analytics 이벤트명 — 기획서 "부록. 이벤트명 전체 목록" 기준.
 *
 * ⚠️ 이벤트명은 변경 불가. Firebase에 한번 수집되면 과거 데이터와 단절되므로
 *    여기 정의된 문자열을 그대로 사용한다. (새 이벤트 추가만 허용)
 */
export const AnalyticsEvent = {
  // 1. 온보딩
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_STEP_VIEW: 'onboarding_step_view',
  ONBOARDING_STEP_NEXT: 'onboarding_step_next',
  ONBOARDING_BACK_TAP: 'onboarding_back_tap',
  ONBOARDING_SLIDER_SET: 'onboarding_slider_set',
  ONBOARDING_COMPLETE: 'onboarding_complete',

  // 1-3 / 1-5. 매칭 정확도(선호 조건) 설정
  PREFERENCE_PROMPT_START: 'preference_prompt_start',
  PREFERENCE_PROMPT_SKIP: 'preference_prompt_skip',
  PREFERENCE_STEP_VIEW: 'preference_step_view',
  PREFERENCE_STEP_NEXT: 'preference_step_next',
  PREFERENCE_PRIORITY_SELECT: 'preference_priority_select',
  PREFERENCE_PRIORITY_DESELECT: 'preference_priority_deselect',
  PREFERENCE_COMPLETE: 'preference_complete',

  // 2-1. 탐색 — 방 게시글
  ROOM_CARD_TAP: 'room_card_tap',
  ROOM_DETAIL_VIEW: 'room_detail_view',
  ROOM_INTEREST_ADD: 'room_interest_add',
  ROOM_INTEREST_REMOVE: 'room_interest_remove',
  FILTER_APPLY: 'filter_apply',

  // 2-2. 탐색 — 룸메이트 매칭
  ROOMMATE_CARD_TAP: 'roommate_card_tap',
  ROOMMATE_DETAIL_VIEW: 'roommate_detail_view',
  ROOMMATE_INTEREST_ADD: 'roommate_interest_add',
  ROOMMATE_MATCH_REQUEST: 'roommate_match_request',
  ROOMMATE_COMPATIBILITY_VIEW: 'roommate_compatibility_view',

  // 3. 채팅
  CHAT_ROOM_ENTER: 'chat_room_enter',
  CHAT_FIRST_MESSAGE_SENT: 'chat_first_message_sent',

  // 4-2. 공통 UX — 에러
  UI_ERROR_SHOWN: 'ui_error_shown',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** 온보딩 스텝 → 기획서 step_index / step_name 매핑. */
export const ONBOARDING_STEP_META: Record<string, { index: number; name: string }> = {
  'profile-basic': { index: 1, name: 'basic_info' },
  'profile-lifestyle': { index: 2, name: 'lifestyle' },
  roominfo: { index: 3, name: 'room_status' },
};
