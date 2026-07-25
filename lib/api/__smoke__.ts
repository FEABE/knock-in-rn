/* API mock 레이어 런타임 스모크 테스트. `npx tsx lib/api/__smoke__.ts` 로 실행. */
import {
  socialLoginWeb,
  getProfileAll,
  getPreferenceAll,
  getRoommateBoards,
  getRoommateBoardDetail,
  getRoommateMatches,
  toggleBoardLike,
  createRoommateBoard,
  getChatRequests,
  getMatchScore,
  getChatRooms,
  getAlarms,
  getMyRoommate,
  getCalendars,
  getRegions,
  getTerms,
  getBoNotices,
  boardListItemToRoomPost,
  matchListItemToRoommateCard,
} from './index';

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail: string) {
  if (ok) {
    pass++;
    console.log(`  ✅ ${label} — ${detail}`);
  } else {
    fail++;
    console.log(`  ❌ ${label} — ${detail}`);
  }
}

async function main() {
  console.log('▶ API mock 스모크 테스트\n');

  const login = await socialLoginWeb('kakao');
  check(
    'socialLoginWeb',
    login.status === 200 && login.error === null && !!login.data.accessToken,
    `status=${login.status} accessToken=${login.data.accessToken} basicInfo=${login.data.basicInfo}`,
  );

  const profile = await getProfileAll();
  const profileLifestyles = profile.data.lifestyles ?? [];
  const profileRegions = profile.data.region ?? [];
  check(
    'getProfileAll',
    profileLifestyles.length > 0 && profileRegions.length > 0,
    `lifestyles=${profileLifestyles.length} region=${profileRegions.length} mounthRent=${profile.data.mounthRent}`,
  );

  const pref = await getPreferenceAll();
  const conditions = pref.data.conditions ?? [];
  check('getPreferenceAll', conditions.length > 0, `conditions=${conditions.length}`);

  const boards = await getRoommateBoards({ regionIds: [4], page: 0 });
  const boardItems = boards.data.boards ?? [];
  check(
    'getRoommateBoards',
    boardItems.length > 0,
    `boards=${boardItems.length} first="${boardItems[0]?.title ?? boardItems[0]?.boardId}"`,
  );

  const detail = await getRoommateBoardDetail('1');
  const detailImages = detail.data.images ?? [];
  check(
    'getRoommateBoardDetail',
    detail.data.boardId === 1 && detailImages.length > 0,
    `boardId=${detail.data.boardId} images=${detailImages.length} score=${detail.data.compatibility?.score}`,
  );

  const matches = await getRoommateMatches();
  const matchItems = matches.data.matches ?? [];
  check(
    'getRoommateMatches',
    matchItems.length > 0,
    `matches=${matchItems.length} score=${matchItems[0]?.score}`,
  );

  const like = await toggleBoardLike(1);
  check('toggleBoardLike', !!like.data.updatedAt, `updatedAt=${like.data.updatedAt}`);

  const created = await createRoommateBoard({
    title: '테스트 게시글',
    contents: '내용',
    deposit: 1000,
    mountlyRent: 60,
    managementCost: 5,
    roomType: 2,
    region: 4,
    comeableAt: '2026-06-01T00:00:00Z',
    images: [{ image: 'https://x/1.jpg', thumnail: true }],
  });
  check('createRoommateBoard', !!created.data.updatedAt, `updatedAt=${created.data.updatedAt}`);

  const reqs = await getChatRequests();
  const chatRequireds = reqs.data.chatRequireds ?? [];
  check('getChatRequests', chatRequireds.length > 0, `requests=${chatRequireds.length}`);

  const score = await getMatchScore();
  const scoreItems = score.data.compatibility?.lifeStyleInfo ?? [];
  check('getMatchScore', scoreItems.length > 0, `score=${score.data.compatibility?.score}`);

  const chats = await getChatRooms();
  const chatRooms = chats.data.chatRooms ?? [];
  check('getChatRooms', chatRooms.length > 0, `rooms=${chatRooms.length}`);

  const alarms = await getAlarms();
  const alarmItems = alarms.data.alarms ?? [];
  check('getAlarms', alarmItems.length > 0, `alarms=${alarmItems.length}`);

  const mate = await getMyRoommate();
  const mateName = mate.data.myRoommateInfo?.memberName;
  check(
    'getMyRoommate',
    !!mate.data.id && !!mateName,
    `roommateId=${mate.data.id} memberName=${mateName}`,
  );

  const cal = await getCalendars({ year: 2026, month: 6 });
  const calendarDays = cal.data.calendarDays ?? [];
  check('getCalendars', calendarDays.length > 0, `days=${calendarDays.length}`);

  const regions = await getRegions();
  const regionItems = regions.data.region ?? [];
  check('getRegions', regionItems.length > 0, `regions=${regionItems.length}`);

  const terms = await getTerms();
  const termItems = terms.data.terms ?? [];
  check('getTerms', termItems.length > 0, `terms=${termItems.length}`);

  const notices = await getBoNotices();
  const noticeItems = notices.data.notices ?? [];
  check('getBoNotices', noticeItems.length > 0, `notices=${noticeItems.length}`);

  // ── 어댑터: DTO → UI 타입 매핑 (화면이 실제로 받는 형태) ──
  const firstBoard = boardItems[0];
  if (!firstBoard) throw new Error('스모크 테스트에 사용할 게시글이 없습니다.');
  const post = boardListItemToRoomPost(firstBoard);
  check(
    'adapter: boardListItemToRoomPost',
    typeof post.deposit === 'number' &&
      post.region.city.length > 0 &&
      post.createdAt instanceof Date,
    `deposit=${post.deposit}(number) region=${post.region.city}/${post.region.district} author=${post.author.name}`,
  );

  const firstMatch = matchItems[0];
  if (!firstMatch) throw new Error('스모크 테스트에 사용할 매칭이 없습니다.');
  const card = matchListItemToRoommateCard(firstMatch);
  check(
    'adapter: matchListItemToRoommateCard',
    typeof card.compatibilityScore === 'number' && card.user.name.length > 0,
    `user=${card.user.name} score=${card.compatibilityScore} budget=${card.budgetMin}~${card.budgetMax}`,
  );

  console.log(`\n▶ 결과: ${pass} 통과 / ${fail} 실패`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('스모크 테스트 예외:', e);
  process.exit(1);
});
