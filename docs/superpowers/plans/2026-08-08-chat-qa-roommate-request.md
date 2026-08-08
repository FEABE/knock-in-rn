# 채팅 QA 5건 (룸메이트 요청/매칭 UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 채팅방의 성별 칩·룸메이트 요청 카드·매칭 상태 표시·사진 확대를 Figma 디자인(`V8HQXS3RuZUpmSsIP5uDQs`, 채팅 섹션 `3496:87918`)에 맞춘다.

**Architecture:** 데이터 계층(`lib/api/use-chat.ts`, `lib/domain/types.ts`)에 서버가 이미 주는 필드(`opponentHasRoommate`, 요청 `createdAt`/`updatedAt`)를 매핑으로 추가하고, 채팅방 훅이 타임라인(메시지+요청카드+매칭칩)을 시간순으로 합성한다. 뷰는 카드/배너/칩을 Figma 스펙 그대로 재작성하고, 이미지 전체화면 뷰어를 신규 추가한다.

**Tech Stack:** React Native (Expo), NativeWind(Tailwind className), TypeScript. 테스트 인프라 없음 → 검증은 `npx tsc --noEmit` + `npx expo lint` + 웹 목데이터 렌더.

## Global Constraints

- 서버 사실(백엔드 저장소 조사로 확정):
  - `EXPIRED`는 서버에서 절대 내려오지 않는 dead value — RN의 EXPIRED 분기는 제거한다.
  - 채팅방 상세 `GET /chats/{id}` 응답: `opponentHasRoommate: boolean`, `matchingRequiredList[]` 아이템은 `requiredId`, `requesterMemberId`, `requesteeMemberId`, `status`, `createdAt`, `updatedAt` (LocalDateTime = UTC 벽시계 → 반드시 `parseServerDate` 사용). 목록 정렬 미보장 → 클라이언트 정렬 유지.
  - 수락 시 양쪽 중 한쪽이라도 매칭돼 있으면 HTTP 409 + `error.code === 'ROOMMATE_ALREADY_EXISTS'` (codeNo 17008).
  - `POST /roommate-requests`엔 "이미 매칭됨" 방어가 없다 — 클라이언트가 배너/CTA 숨김으로 막아야 한다.
  - 내 매칭 여부 플래그는 프로필 API에 없음 → `getMyRoommate()` (`lib/api/roommate.ts`)로 조회.
- 색상 토큰 (Figma): Primary/5 `#ECF2FE`, Primary/40 `#4C87F6`, Primary/50(b) `#256EF4`, Grayscale/20 `#DADAE8`, Grayscale/30 `#AAAABA`, Grayscale/40 `#696976`, Grayscale/50(b) `#17171B`, Error/5 `#FDEFEC`, Error/50(b) `#DE3412`, Info/5 `#E7F4FE`, Info/50 `#0B78CB`, Accnet/5 `#FBEFF0`, Accnet/50(b) `#D63D4A`.
- 폰트는 프로젝트 기존 방식(className `font-*` + 사이즈) 그대로. Pretendard 별도 지정 불필요.
- 문구는 Figma 원문 그대로: "상대방이 매칭된 상태**에**요" (예요 아님), "매칭 후에는 수락할 수 없어요", "룸메이트가 되었어요", "상대방이 다른 분과 룸메이트가 되었어요", "이미 다른 분과 룸메이트가 되었어요", "나와 잘 맞는 다른 룸메이트를 찾아보세요".
- 커밋은 태스크당 1개, 메시지 끝에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: 공용 성별·나이 칩 + 채팅방 헤더 적용

**Files:**
- Create: `components/ui/gender-age-chip.tsx`
- Modify: `components/chat/chat-room/chat-room-screen.view.tsx` (ChatHeader, 현재 `tone="red"` ReadyBadge 사용부: 219-231행 부근)
- Modify: `components/roommate/detail-screen/roommate-detail-screen.view.tsx` (로컬 `GenderMetaChip`(248행 부근)을 공용 컴포넌트로 대체)

**Interfaces:**
- Produces: `GenderAgeChip({ age, gender }: { age?: number; gender: 'male' | 'female' | 'other' })` — gender가 'other'이거나 age·gender 모두 표시 불가면 `null` 반환.

**Steps:**

- [ ] **Step 1: `GenderAgeChip` 구현**

Figma `chip2/Default` 스펙: 높이 22px, padding `2px 5px`, radius 4px, 내부 행 gap 4px, 아이콘 12px(Ionicons `male`/`female`), 구분점 2×2px(Ellipse — `·` 문자 대신 View로), 텍스트 SemiBold 12px lh 1.5. 색: 남성 bg `#E7F4FE`·전경 `#0B78CB`, 여성 bg `#FDEFEC`·전경 `#DE3412`. 라벨 형식 `"{age}세 · {남성|여성}"`, age 없으면 성별만. 구현은 기존 `roommate-detail-screen.view.tsx`의 `GenderMetaChip`+`ageGenderLabel`을 이전·일반화한다 (해당 파일과 시각 결과 동일해야 함).

- [ ] **Step 2: 채팅방 헤더에서 사용**

`ChatHeader`의 성별 ReadyBadge(`♀ 24세·여성`, tone="red")를 `<GenderAgeChip age={peer.age} gender={peer.gender} />`로 교체. `genderSymbol`/`genderLabel` 변수 제거. `궁합 N점`/`룸메이트` ReadyBadge는 그대로 둔다.

- [ ] **Step 3: 룸메 상세 화면 리팩터**

`roommate-detail-screen.view.tsx`의 로컬 `GenderMetaChip` 정의를 지우고 공용 `GenderAgeChip`을 import해 동일 위치에서 사용. 라벨 조합 로직(`ageGenderLabel`)도 공용 컴포넌트 내부로 흡수.

- [ ] **Step 4: 검증 후 커밋**

Run: `npx tsc --noEmit && npx expo lint` → 에러 0. `git commit -m "QA: 채팅 헤더 성별 칩 남성/여성 분기 (공용 GenderAgeChip)"`.

---

### Task 2: 데이터 계층 — opponentHasRoommate·요청 타임스탬프·내 매칭 여부

**Files:**
- Modify: `lib/domain/types.ts` (`RoommateRequestState` 137-141행, `ChatRoom` 143-150행)
- Modify: `lib/api/use-chat.ts` (채팅방 상세 매핑 240-283행 부근)
- Modify: `components/chat/chat-room/use-chat-room-screen.ts`
- Modify: `lib/domain/mock.ts` (ChatRoom 목데이터에 새 필드 반영)

**Interfaces:**
- Produces (Task 3이 사용):
  - `RoommateRequestState`에 `createdAt?: Date; updatedAt?: Date` 추가.
  - `ChatRoom`에 `opponentHasRoommate: boolean` 추가.
  - `UseChatRoomScreenReturn`에 `selfHasRoommate: boolean` 추가 (이 방 매칭(`room.matched`)이면 항상 false 취급).

**Steps:**

- [ ] **Step 1: 타입 확장**

`RoommateRequestState`에 `createdAt?: Date; updatedAt?: Date`, `ChatRoom`에 `opponentHasRoommate: boolean` 추가.

- [ ] **Step 2: 매핑 추가**

`use-chat.ts`의 채팅방 상세 → 도메인 변환에서:
- `opponentHasRoommate: raw.opponentHasRoommate === true`
- `roommateRequest`에 `createdAt: parseServerDate(latestRequest.createdAt)`, `updatedAt: parseServerDate(latestRequest.updatedAt)` (undefined 허용). 기존 `createdAt` 문자열 desc 정렬(260행)은 유지하되, 정렬 키가 없을 때를 대비해 `requiredId` 숫자 desc를 2차 키로 추가.

- [ ] **Step 3: 내 매칭 여부 훅 연결**

`use-chat-room-screen.ts`에서 `getMyRoommate()`를 1회 호출하는 상태 추가:
```ts
const [selfHasRoommate, setSelfHasRoommate] = useState(false);
useEffect(() => {
  if (!room || room.matched || USE_MOCK) return;
  let cancelled = false;
  getMyRoommate().then((res) => {
    if (!cancelled) setSelfHasRoommate(Boolean(res.data?.myRoommateInfo));
  }).catch(() => {});
  return () => { cancelled = true; };
}, [room?.id, room?.matched]);
```
(정확한 성공 판정은 `lib/api/roommate.ts`의 `MyRoommateData` 형태를 열어 확인 후 맞출 것. 실패는 조용히 false 유지 — 로그인 화면 흐름을 막지 않는다.) 반환 객체에 `selfHasRoommate` 추가.

- [ ] **Step 4: 목데이터 갱신 + 검증 + 커밋**

`lib/domain/mock.ts`의 ChatRoom 객체들에 `opponentHasRoommate: false`(매칭 실패 시나리오 확인용으로 1개는 true 권장) 추가. `npx tsc --noEmit && npx expo lint` 통과 후 커밋 `"QA: 채팅 도메인에 매칭 상태·요청 시각 매핑 추가"`.

---

### Task 3: 요청 카드 재작성 + 타임라인 앵커링 + 매칭 상태 UI화

**Files:**
- Modify: `components/chat/chat-room/chat-room-screen.view.tsx` (MessageList, RequestStatusBanner, Banner, RoommateRequestCard 전면 수정)
- Modify: `components/chat/chat-room/use-chat-room-screen.ts` (타임라인 합성, ROOMMATE_ALREADY_EXISTS 처리)

**Interfaces:**
- Consumes: Task 2의 `createdAt`/`updatedAt`/`opponentHasRoommate`/`selfHasRoommate`.
- Produces: `UseChatRoomScreenReturn.timeline: ChatTimelineItem[]` —
  ```ts
  type ChatTimelineItem =
    | { kind: 'message'; message: ChatRoomBubble; at: Date }
    | { kind: 'request-card'; at: Date }
    | { kind: 'matched-pill'; at: Date };
  ```

**Steps:**

- [ ] **Step 1: 훅에서 타임라인 합성**

`useMemo`로 메시지 버블 배열에 다음을 삽입 후 `at` 오름차순 정렬(동시각이면 message → request-card → matched-pill 순):
- `roommateRequest && status !== 'CANCELED'`(취소 카드도 디자인에 존재하므로 CANCELED도 포함하되 EXPIRED 분기는 삭제) → `{ kind: 'request-card', at: request.createdAt ?? 마지막 메시지 시각 ?? new Date(0) }` — createdAt 없으면 맨 아래 폴백(기존 동작).
- `room.matched && request?.status === 'ACCEPTED'` → `{ kind: 'matched-pill', at: request.updatedAt ?? request.createdAt ?? ... }` (카드 바로 다음 보장: 동시각 정렬 규칙으로 충분).
기존 `messages` 반환은 유지해도 되지만 뷰는 `timeline`만 사용하도록 바꾼다. 자동 스크롤 effect 의존성은 `messages.length` 그대로.

- [ ] **Step 2: MessageList → TimelineList**

뷰의 `MessageList`를 `timeline` 기반으로 변경. 날짜 구분선은 이전 아이템과 `at`이 다른 KST 날짜면 표시(기존 `isSameKstDay` 로직을 아이템 공통으로). `request-card`는 아래 Step 3의 카드, `matched-pill`은 Step 4의 칩을 렌더. 이로써 요청 후 전송된 메시지는 자연히 카드 아래에 위치한다 (QA #3).

- [ ] **Step 3: RoommateRequestCard 재작성 (Figma 스펙)**

- 폭 **278px** 고정. `request.role === 'requester'`(내가 보냄) → `self-end`, radius `tl8 tr0 br8 bl8`; `requestee`(받음) → 좌측 정렬 + 아바타(42px, `ReadyProfileAvatar`) + gap 8, radius `tl0 tr8 br8 bl8`. 카드 bg white, border 1px `#DADAE8`.
- 헤더 바: 높이 31px(`px-4 py-1.5`), bg `#4C87F6`, 텍스트 "룸메이트 요청" Medium 13 white.
- 바디: `px-4`, 하단 패딩 12px, 세로 gap 12px. 제목(보냄 "룸메이트를 요청했어요!" / 받음 "{이름}님이 룸메이트를 요청했어요!") SemiBold 15 `#17171B`. 안내문 2줄(기존 문구 유지) Regular 12 `#696976`, gap 6px.
- 하단 행(폭 246, 높이 40, radius 6.5px, 텍스트 Bold 14):
  - PENDING·requester·기본: 버튼 "요청 취소하기" — white bg, 1px `#DADAE8`, 텍스트 `#AAAABA`.
  - PENDING·requester·`opponentHasRoommate`: 상태 행 "상대방이 매칭된 상태에요" — bg `#FDEFEC`, 텍스트 `#DE3412`, 비인터랙티브 (취소 버튼 대체).
  - PENDING·requestee·기본: 2버튼 gap 12 — "거절하기"(white bg·1px `#DADAE8`·텍스트 `#AAAABA`), "수락하기"(bg `#4C87F6`·white 텍스트). *디자인에 2버튼 원본이 없어 단일 버튼 스펙(40px/radius 6.5)에서 외삽한 것 — 코드 주석 불필요, 이 계획에만 기록.*
  - PENDING·requestee·`selfHasRoommate`: 상태 행 "매칭 후에는 수락할 수 없어요" — bg `#FDEFEC`, 텍스트 `#DE3412`, 수락/거절 버튼 대체.
  - ACCEPTED: 상태 행 "요청을 수락했어요" — bg `#ECF2FE`, 텍스트 `#4C87F6`.
  - REJECTED: 상태 행 — 기존 문구("요청을 거절했어요"/"상대방이 요청을 거절했어요") 유지, 스타일은 white bg·1px `#DADAE8`·텍스트 `#AAAABA` (CANCELED "요청을 취소했어요"와 동일한 중립 스타일).
  - CANCELED: 상태 행 "룸메이트 요청을 취소했어요" → Figma 문구 "요청을 취소했어요"로 변경, white bg·1px `#DADAE8`·텍스트 `#AAAABA`.
- EXPIRED 관련 분기(`request.status === 'EXPIRED'` early return 등)는 삭제.

- [ ] **Step 4: "룸메이트가 되었어요" 칩**

`matched-pill` 렌더: `self-center`, bg `#ECF2FE`, radius full(pill), `px-5 py-1`, 텍스트 "룸메이트가 되었어요" Medium 13 `#4C87F6`. 리스트 gap(20px)이 상하 간격을 담당하므로 추가 마진 불필요.

- [ ] **Step 5: 배너 개편**

`RequestStatusBanner` 분기 재정의 (우선순위 순):
1. `matched` → null (기존 유지).
2. `selfHasRoommate` → 레드 배너 "이미 다른 분과 룸메이트가 되었어요" / "나와 잘 맞는 다른 룸메이트를 찾아보세요".
3. `opponentHasRoommate` → 레드 배너 "상대방이 다른 분과 룸메이트가 되었어요" / 동일 서브타이틀.
4. PENDING·requester → 기존 블루 배너 "룸메이트를 요청했어요" 유지.
5. PENDING·requestee → null (기존 유지).
6. 그 외 → 기존 "룸메이트를 요청할까요?" + 요청하기 버튼. (2·3에 걸리면 요청하기 CTA가 사라지므로 서버의 무방비 POST를 클라이언트에서 차단하게 됨.)
레드 배너 스펙: bg `#FBEFF0`, padding `px-[18px] py-3`, 타이틀 Bold 15 `#D63D4A`, 서브타이틀 Regular 13 `#696976`. 기존 EXPIRED 분기 삭제. `Banner` 컴포넌트에 `tone: 'blue' | 'red'` prop을 추가해 재사용.

- [ ] **Step 6: ROOMMATE_ALREADY_EXISTS 팝업 제거**

`use-chat-room-screen.ts`의 수락 실패 처리에서 에러가 `ROOMMATE_ALREADY_EXISTS`(코드 문자열, `lib/api`의 에러 객체에 code가 어떻게 실리는지 확인 — `useRoommateRequestAction`이 던지는 Error에 code가 없으면 message 포함 여부로 판정하지 말고 API 계층에서 code를 실어 올리도록 소폭 수정)이면: Alert 없이 `reload()` + `getMyRoommate()` 재조회로 `selfHasRoommate` 갱신 → 배너/카드 상태가 대신 표시된다 (QA #4). 그 외 에러는 기존 Alert 유지. 네트워크 오류 Alert도 유지.

- [ ] **Step 7: 검증 + 커밋**

`npx tsc --noEmit && npx expo lint`. 가능하면 `EXPO_PUBLIC_USE_MOCK=true npx expo start --web`으로 목데이터 채팅방 렌더 확인(카드 위치·크기, 배너). 커밋 `"QA: 룸메 요청 카드 디자인 최신화·타임라인 앵커링·매칭 상태 UI화"`.

---

### Task 4: 사진 전체화면 뷰어

**Files:**
- Create: `components/chat/chat-room/chat-image-viewer.tsx`
- Modify: `components/ui/ready-to-dev-chat.tsx` (`ReadyChatBubble`에 `onPressImage?: () => void` 추가, 이미지 부분을 Pressable로)
- Modify: `components/chat/chat-room/chat-room-screen.view.tsx` (타임라인에서 이미지 메시지에 onPressImage 연결, 모달 렌더)
- Modify: `components/chat/chat-room/use-chat-room-screen.ts` (뷰어 상태)

**Interfaces:**
- Produces: `ChatImageViewer({ visible, imageUrl, title, onClose })`; 훅에 `imageViewer: { imageUrl: string; title: string } | null`, `openImageViewer(message: ChatRoomBubble) => void`, `closeImageViewer() => void`.

**Steps:**

- [ ] **Step 1: 뷰어 컴포넌트 (Figma `3589:28288`)**

RN `Modal`(fullScreen, statusBarTranslucent). 루트 bg `#17171B`. SafeArea 상단 헤더(높이 52, `px-4`): 좌측 X 버튼(Ionicons `close` 24px white, accessibilityLabel "사진 닫기"), 중앙 타이틀 SemiBold 16 white(보낸 사람 이름), 우측 24px 빈 슬롯로 중앙 유지. 이미지는 `flex-1` 컨테이너에 `resizeMode="contain"`, 폭 100%, 세로 중앙. (디자인은 360×432 레터박스 — 임의 비율 이미지 대응을 위해 contain 선택.)

- [ ] **Step 2: 버블 탭 연결**

`ReadyChatBubble`에 `onPressImage` 추가(이미지 없을 땐 미사용). 훅: `openImageViewer`가 `title`을 `message.mine ? (session?.user.name ?? '나') : room.peer.name`로 결정. 뷰: 타임라인의 이미지 메시지에 연결, `<ChatImageViewer />`를 KeyboardAvoidingView 바깥(형제)에 렌더. `ChatRoomBlockedView`에는 연결하지 않는다 (범위 밖).

- [ ] **Step 3: 검증 + 커밋**

`npx tsc --noEmit && npx expo lint`, 웹 목데이터로 이미지 탭 → 뷰어 열림/닫힘 확인. 커밋 `"QA: 채팅 이미지 전체화면 뷰어 추가"`.

---

### Task 5: QA.md 기록

**Files:**
- Modify: `docs/QA.md` (`## 채팅` 섹션)

- [ ] **Step 1: 항목 추가**

`## 채팅` 섹션에 이번 5개 항목을 `(complete)` + 한 줄 요약(무엇을 어떻게 고쳤는지, 미검증 사항 명시 — 실기기 스크롤/뷰어 제스처 검증은 다음 QA에서) 형식으로 추가. 출처 표기: 채팅 QA (26.08.07).

- [ ] **Step 2: 커밋**

`git commit -m "docs: 채팅 QA 5건 반영 기록"`.

---

## Self-Review 결과

- 스펙 커버리지: QA #1→Task 1, #2→Task 3 Step 3, #3→Task 2+3(Step 1-2), #4→Task 2 Step 3 + Task 3 Step 5-6, #5→Task 4. 커버 완료.
- EXPIRED 제거는 Task 3 Step 3·5에 반영 (서버 dead value 근거).
- 타입 시그니처 일관성: `ChatTimelineItem`/`selfHasRoommate`/`GenderAgeChip` — Task 간 참조 일치 확인.
