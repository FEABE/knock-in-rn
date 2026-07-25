type RouterLike = {
  navigate: (href: never) => void;
  replace: (href: never) => void;
  back: () => void;
  canDismiss: () => boolean;
  dismissAll: () => void;
};

type NavigationMode = 'navigate' | 'replace';

function navigate(router: RouterLike, href: string) {
  // 같은 화면을 여러 번 눌러도 Stack에 중복으로 쌓이지 않도록 navigate로 이동한다.
  router.navigate(href as never);
}

function replace(router: RouterLike, href: string) {
  router.replace(href as never);
}

function reset(router: RouterLike, href: string) {
  if (router.canDismiss()) router.dismissAll();
  replace(router, href);
}

export function goBack(router: RouterLike) {
  router.back();
}

export function goExplore(router: RouterLike, mode: NavigationMode = 'navigate') {
  if (mode === 'replace') replace(router, '/explore');
  else navigate(router, '/explore');
}

export function resetToExplore(router: RouterLike) {
  reset(router, '/explore');
}

export function goExploreSearch(router: RouterLike, query: string) {
  replace(router, `/explore?q=${encodeURIComponent(query)}`);
}

export function goOnboarding(router: RouterLike, mode: NavigationMode = 'navigate') {
  if (mode === 'replace') replace(router, '/onboarding');
  else navigate(router, '/onboarding');
}

export function resetToOnboarding(router: RouterLike) {
  reset(router, '/onboarding');
}

export function goKakaoLogin(router: RouterLike, mode: NavigationMode = 'navigate') {
  if (mode === 'replace') replace(router, '/kakao-login');
  else navigate(router, '/kakao-login');
}

export function goRoomSearch(router: RouterLike, query?: string) {
  navigate(router, query ? `/room/search?q=${encodeURIComponent(query)}` : '/room/search');
}

export function goNewRoom(router: RouterLike) {
  navigate(router, '/room/new');
}

export function goRoomDetail(router: RouterLike, roomId: string | number) {
  navigate(router, `/room/${roomId}`);
}

export function goRoomEdit(router: RouterLike, roomId: string | number) {
  navigate(router, `/room/${roomId}/edit`);
}

export function goRoommateDetail(router: RouterLike, userId: string | number) {
  navigate(router, `/roommate/${userId}`);
}

export function goChatRoom(router: RouterLike, chatRoomId: string | number) {
  navigate(router, `/chat/${chatRoomId}`);
}

export function goChatRequest(router: RouterLike, requestId: string | number) {
  navigate(router, `/chat/request/${requestId}`);
}

export function goNotifications(router: RouterLike) {
  navigate(router, '/notifications');
}

export function goMypageProfile(router: RouterLike) {
  navigate(router, '/mypage/profile');
}

export function goMypagePreferences(router: RouterLike) {
  navigate(router, '/mypage/preferences');
}

export function goMypageMyRooms(router: RouterLike) {
  navigate(router, '/mypage/my-rooms');
}

export function goMypageRoommate(router: RouterLike) {
  navigate(router, '/mypage/roommate');
}

export function goMypageAgreement(router: RouterLike) {
  navigate(router, '/mypage/agreement');
}

export function goVerification(router: RouterLike) {
  navigate(router, '/verification');
}

export function goSupport(router: RouterLike) {
  navigate(router, '/support');
}

export function goMypageAccount(router: RouterLike) {
  navigate(router, '/mypage/account');
}

export function goMypageBlocked(router: RouterLike) {
  navigate(router, '/mypage/blocked');
}

export function goMypageWithdraw(router: RouterLike) {
  navigate(router, '/mypage/withdraw');
}

export function goVerificationSchool(router: RouterLike) {
  navigate(router, '/verification/school');
}

export function goVerificationCompany(router: RouterLike) {
  navigate(router, '/verification/company');
}

export function goSupportFaq(router: RouterLike) {
  navigate(router, '/support/faq');
}

export function goSupportNotice(router: RouterLike) {
  navigate(router, '/support/notice');
}

export function goSupportInquiries(router: RouterLike) {
  navigate(router, '/support/inquiries');
}

export function goSupportInquiryNew(router: RouterLike) {
  navigate(router, '/support/inquiry-new');
}

export function goSupportTerms(router: RouterLike) {
  navigate(router, '/support/terms');
}
