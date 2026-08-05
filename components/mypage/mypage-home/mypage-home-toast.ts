/**
 * 마이페이지 홈 진입 시 1회 노출할 토스트 메시지 전달용 모듈 스코프 플래그.
 * 다른 화면(예: 선호 룸메이트 조건 저장)이 예약하고, 홈이 포커스될 때 소비한다.
 */
let pendingMessage: string | null = null;

export function setMypageHomeToast(message: string) {
  pendingMessage = message;
}

export function consumeMypageHomeToast(): string | null {
  const message = pendingMessage;
  pendingMessage = null;
  return message;
}
