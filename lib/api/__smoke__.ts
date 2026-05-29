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
  check(
    'getProfileAll',
    profile.data.lifestyles.length > 0 && profile.data.region.length > 0,
    `lifestyles=${profile.data.lifestyles.length} region=${profile.data.region.length} mounthRent=${profile.data.mounthRent}`,
  );

  const pref = await getPreferenceAll();
  check(
    'getPreferenceAll',
    pref.data.conditions.length > 0,
    `conditions=${pref.data.conditions.length}`,
  );

  const boards = await getRoommateBoards({ region: 'seoul-mapo', page: 0 });
  check(
    'getRoommateBoards',
    boards.data.boards.length > 0,
    `boards=${boards.data.boards.length} first="${boards.data.boards[0].title}"`,
  );

  const detail = await getRoommateBoardDetail('p-1');
  check(
    'getRoommateBoardDetail',
    detail.data.boardId === 'p-1' && detail.data.images.length > 0,
    `boardId=${detail.data.boardId} images=${detail.data.images.length} score=${detail.data.compatibility.score}`,
  );

  const matches = await getRoommateMatches();
  check(
    'getRoommateMatches',
    matches.data.matches.length > 0,
    `matches=${matches.data.matches.length} score=${matches.data.matches[0].score}`,
  );

  const like = await toggleBoardLike({ boardId: 'p-1' });
  check('toggleBoardLike', !!like.data.updatedAt, `updatedAt=${like.data.updatedAt}`);

  const created = await createRoommateBoard({
    title: '테스트 게시글',
    contents: '내용',
    deposit: '1000',
    mountlyRent: '60',
    managementCost: '5',
    roomType: 'two-room',
    region: 'seoul-mapo',
    comeableAt: '2026-06-01',
    images: [{ image: 'https://x/1.jpg', thumnail: true }],
  });
  check('createRoommateBoard', !!created.data.updatedAt, `updatedAt=${created.data.updatedAt}`);

  const reqs = await getChatRequests();
  check(
    'getChatRequests',
    reqs.data.chatRequireds.length > 0,
    `requests=${reqs.data.chatRequireds.length}`,
  );

  const score = await getMatchScore();
  check(
    'getMatchScore',
    score.data.compatibility.lifeStyleInfo.length > 0,
    `score=${score.data.compatibility.score}`,
  );

  const chats = await getChatRooms();
  check('getChatRooms', chats.data.chatRooms.length > 0, `rooms=${chats.data.chatRooms.length}`);

  const alarms = await getAlarms();
  check('getAlarms', alarms.data.alarms.length > 0, `alarms=${alarms.data.alarms.length}`);

  const mate = await getMyRoommate();
  check(
    'getMyRoommate',
    !!mate.data.userName && mate.data.compatibility.preferences.length > 0,
    `userName=${mate.data.userName} prefs=${mate.data.compatibility.preferences.length}`,
  );

  const cal = await getCalendars({ year: 2026, month: 6 });
  check('getCalendars', cal.data.calendars.length > 0, `calendars=${cal.data.calendars.length}`);

  const regions = await getRegions();
  check('getRegions', regions.data.region.length > 0, `regions=${regions.data.region.length}`);

  const terms = await getTerms();
  check('getTerms', terms.data.terms.length > 0, `terms=${terms.data.terms.length}`);

  const notices = await getBoNotices();
  check('getBoNotices', notices.data.notices.length > 0, `notices=${notices.data.notices.length}`);

  // ── 어댑터: DTO → UI 타입 매핑 (화면이 실제로 받는 형태) ──
  const post = boardListItemToRoomPost(boards.data.boards[0]);
  check(
    'adapter: boardListItemToRoomPost',
    typeof post.deposit === 'number' &&
      post.region.city.length > 0 &&
      post.createdAt instanceof Date,
    `deposit=${post.deposit}(number) region=${post.region.city}/${post.region.district} author=${post.author.name}`,
  );

  const card = matchListItemToRoommateCard(matches.data.matches[0]);
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
