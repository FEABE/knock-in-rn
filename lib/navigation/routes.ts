type RouterLike = {
  push: (href: never) => void;
  replace: (href: never) => void;
  back: () => void;
};

function push(router: RouterLike, href: string) {
  router.push(href as never);
}

function replace(router: RouterLike, href: string) {
  router.replace(href as never);
}

export function goBack(router: RouterLike) {
  router.back();
}

export function goExplore(router: RouterLike, mode: 'push' | 'replace' = 'push') {
  if (mode === 'replace') replace(router, '/explore');
  else push(router, '/explore');
}

export function goExploreSearch(router: RouterLike, query: string) {
  replace(router, `/explore?q=${encodeURIComponent(query)}`);
}

export function goOnboarding(router: RouterLike, mode: 'push' | 'replace' = 'push') {
  if (mode === 'replace') replace(router, '/onboarding');
  else push(router, '/onboarding');
}

export function goKakaoLogin(router: RouterLike, mode: 'push' | 'replace' = 'push') {
  if (mode === 'replace') replace(router, '/kakao-login');
  else push(router, '/kakao-login');
}

export function goRoomSearch(router: RouterLike, query?: string) {
  push(router, query ? `/room/search?q=${encodeURIComponent(query)}` : '/room/search');
}

export function goNewRoom(router: RouterLike) {
  push(router, '/room/new');
}

export function goRoomDetail(router: RouterLike, roomId: string | number) {
  push(router, `/room/${roomId}`);
}

export function goRoomEdit(router: RouterLike, roomId: string | number) {
  push(router, `/room/${roomId}/edit`);
}

export function goRoommateDetail(router: RouterLike, userId: string | number) {
  push(router, `/roommate/${userId}`);
}

export function goChatRoom(router: RouterLike, chatRoomId: string | number) {
  push(router, `/chat/${chatRoomId}`);
}

export function goChatRequest(router: RouterLike, requestId: string | number) {
  push(router, `/chat/request/${requestId}`);
}

export function goNotifications(router: RouterLike) {
  push(router, '/notifications');
}

export function goMypageProfile(router: RouterLike) {
  push(router, '/mypage/profile');
}

export function goMypagePreferences(router: RouterLike) {
  push(router, '/mypage/preferences');
}

export function goMypageMyRooms(router: RouterLike) {
  push(router, '/mypage/my-rooms');
}

export function goMypageRoommate(router: RouterLike) {
  push(router, '/mypage/roommate');
}

export function goMypageAgreement(router: RouterLike) {
  push(router, '/mypage/agreement');
}

export function goVerification(router: RouterLike) {
  push(router, '/verification');
}

export function goSupport(router: RouterLike) {
  push(router, '/support');
}

export function goMypageAccount(router: RouterLike) {
  push(router, '/mypage/account');
}

export function goMypageBlocked(router: RouterLike) {
  push(router, '/mypage/blocked');
}

export function goMypageWithdraw(router: RouterLike) {
  push(router, '/mypage/withdraw');
}

export function goVerificationSchool(router: RouterLike) {
  push(router, '/verification/school');
}

export function goVerificationCompany(router: RouterLike) {
  push(router, '/verification/company');
}

export function goSupportFaq(router: RouterLike) {
  push(router, '/support/faq');
}

export function goSupportNotice(router: RouterLike) {
  push(router, '/support/notice');
}

export function goSupportInquiries(router: RouterLike) {
  push(router, '/support/inquiries');
}

export function goSupportInquiryNew(router: RouterLike) {
  push(router, '/support/inquiry-new');
}

export function goSupportTerms(router: RouterLike) {
  push(router, '/support/terms');
}
