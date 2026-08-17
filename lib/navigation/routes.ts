type RouterLike = {
  navigate: (href: never) => void;
  replace: (href: never) => void;
  back: () => void;
  canDismiss: () => boolean;
  dismissAll: () => void;
};

type NavigationMode = 'navigate' | 'replace';

export type ListReturnTarget = {
  screen: 'explore' | 'interests';
  tab: 'rooms' | 'roommates';
};

export type ModerationReturnTarget =
  | (ListReturnTarget & { href: string })
  | { screen: 'room-search' | 'chat'; href: string; tab?: never };

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

export function goExplore(
  router: RouterLike,
  mode: NavigationMode = 'navigate',
  tab?: 'rooms' | 'roommates',
) {
  const href = tab ? `/explore?tab=${tab}` : '/explore';
  if (mode === 'replace') replace(router, href);
  else navigate(router, href);
}

export function goInterests(
  router: RouterLike,
  mode: NavigationMode = 'navigate',
  tab?: ListReturnTarget['tab'],
) {
  const href = tab ? `/interests?tab=${tab}` : '/interests';
  if (mode === 'replace') replace(router, href);
  else navigate(router, href);
}

export function goListReturnTarget(
  router: RouterLike,
  target: ListReturnTarget,
  mode: NavigationMode = 'navigate',
) {
  if (target.screen === 'interests') goInterests(router, mode, target.tab);
  else goExplore(router, mode, target.tab);
}

export function resolveModerationReturnTarget(
  from: string | undefined,
  returnTo: string | undefined,
  tab: string | undefined,
  fallbackTab: ListReturnTarget['tab'],
): ModerationReturnTarget {
  const resolvedTab = tab === 'rooms' || tab === 'roommates' ? tab : fallbackTab;
  if (from === 'interests' && isPathFor(returnTo, '/interests')) {
    return { screen: 'interests', href: returnTo, tab: resolvedTab };
  }
  if (from === 'explore' && isPathFor(returnTo, '/explore')) {
    return { screen: 'explore', href: returnTo, tab: resolvedTab };
  }
  if (from === 'room-search' && isPathFor(returnTo, '/room/search')) {
    return { screen: 'room-search', href: returnTo };
  }
  if (from === 'chat' && returnTo && /^\/chat\/[^/?]+$/.test(returnTo)) {
    return { screen: 'chat', href: returnTo };
  }
  return { screen: 'explore', href: '/explore', tab: fallbackTab };
}

function isPathFor(href: string | undefined, pathname: string): href is string {
  return href === pathname || href?.startsWith(`${pathname}?`) === true;
}

export function moderationReturnParams(target: ModerationReturnTarget) {
  return {
    from: target.screen,
    returnTo: target.href,
    ...(target.tab ? { tab: target.tab } : {}),
  };
}

export function goModerationReturnTarget(router: RouterLike, target: ModerationReturnTarget) {
  navigate(router, target.href);
}

export function resetToExplore(router: RouterLike) {
  reset(router, '/explore');
}

export function resetToMypage(router: RouterLike) {
  reset(router, '/mypage');
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

export function goRoomDetail(
  router: RouterLike,
  roomId: string | number,
  returnTarget?: ModerationReturnTarget,
) {
  const suffix = returnTarget ? moderationReturnQuery(returnTarget) : '';
  navigate(router, `/room/${roomId}${suffix}`);
}

export function goRoomEdit(router: RouterLike, roomId: string | number) {
  navigate(router, `/room/${roomId}/edit`);
}

export function goRoommateDetail(
  router: RouterLike,
  userId: string | number,
  returnTarget?: ModerationReturnTarget,
) {
  const suffix = returnTarget ? moderationReturnQuery(returnTarget) : '';
  navigate(router, `/roommate/${userId}${suffix}`);
}

function moderationReturnQuery(target: ModerationReturnTarget): string {
  const params = new URLSearchParams(moderationReturnParams(target));
  return `?${params.toString()}`;
}

export function goChatRoom(router: RouterLike, chatRoomId: string | number) {
  navigate(router, `/chat/${chatRoomId}`);
}

export function goNotifications(router: RouterLike) {
  navigate(router, '/notifications');
}

export function goMypageProfile(router: RouterLike, section?: 'lifestyle' | 'room') {
  navigate(router, section ? `/mypage/profile?tab=${section}` : '/mypage/profile');
}

export function goMypageBasicProfile(router: RouterLike) {
  navigate(router, '/mypage/profile-basic');
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

export function goSupportNoticeDetail(router: RouterLike, id: string) {
  navigate(router, `/support/notice/${id}`);
}

export function goSupportInquiries(router: RouterLike) {
  navigate(router, '/support/inquiries');
}

export function goSupportInquiryDetail(router: RouterLike, id: string) {
  navigate(router, `/support/inquiries/${id}`);
}

export function goSupportInquiryNew(router: RouterLike) {
  navigate(router, '/support/inquiry-new');
}

export function goSupportTerms(router: RouterLike) {
  navigate(router, '/support/terms');
}
