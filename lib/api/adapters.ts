/**
 * API DTO(명세 응답) → lib/domain UI 타입 어댑터.
 *
 * 명세 응답은 문자열 위주의 평면 구조이고, 화면 컴포넌트는 lib/domain 의
 * 리치 타입(RoomPost, RoommateCard 등)을 쓴다. 이 파일이 둘 사이를 잇는다.
 * 순수 함수만 두며 React/네트워크에 의존하지 않는다.
 */
import type { RoomPost, RoommateCard, UserSummary } from '@/lib/domain';
import type { Gender, Region, RoomType } from '@/lib/onboarding';

import {
  labelForRegionId,
  regionFromBackendId,
  roomOptionFromBackendId,
  roomTypeFromBackendId,
} from './backend-ids';
import type { LifestyleItem } from './entities';
import type { BoardDetailData, BoardListItem, MatchListItem } from './roommate-boards';

/** "서울 마포구" → { id, city, district }. 공백 기준 분리. */
export function parseRegion(label: string): Region {
  const trimmed = (label ?? '').trim();
  if (/^\d+$/.test(trimmed)) return regionFromBackendId(Number(trimmed));
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) {
    return { id: trimmed, city: trimmed, district: '' };
  }
  return {
    id: trimmed,
    city: trimmed.slice(0, spaceIdx),
    district: trimmed.slice(spaceIdx + 1),
  };
}

/** 문자열 숫자를 안전하게 number 로. 빈 값/NaN 은 fallback. */
function num(value: string | number | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** 명세 boolean 문자열("true"/"false") → boolean. */
function bool(value: string | boolean | undefined): boolean {
  return value === true || value === 'true';
}

/**
 * 작성자 이름만 아는 리스트 응답용 최소 UserSummary.
 * 상세 정보는 상세 API 에서 별도로 채운다.
 */
function minimalUser(
  name: string,
  region: Region,
  overrides: Partial<UserSummary> = {},
): UserSummary {
  return {
    id: overrides.id ?? name,
    name,
    age: overrides.age ?? 0,
    gender: overrides.gender ?? 'other',
    preferredGender: overrides.preferredGender ?? 'any',
    bio: overrides.bio ?? '',
    region,
    badges: overrides.badges ?? [],
    lifestyle: overrides.lifestyle ?? {},
    importantConditions: overrides.importantConditions ?? [],
  };
}

/** 게시글 리스트 항목 → RoomPost (룸메 탐색 카드용). */
export function boardListItemToRoomPost(item: BoardListItem): RoomPost {
  const region =
    item.region !== undefined
      ? parseRegion(labelForRegionId(item.region))
      : { id: '', city: '', district: '' };
  const id = String(item.boardId ?? '');
  return {
    id,
    title: item.title ?? `방 게시글 #${id}`,
    thumbnailUrl: item.image || undefined,
    deposit: num(item.deposit),
    monthlyRent: num(item.mounthRent),
    roomType: toRoomType(item.roomType),
    region,
    views: num(item.viewer),
    likes: 0,
    createdAt: item.createAt ? new Date(item.createAt) : new Date(),
    status: 'open',
    author: minimalUser(item.writer ?? '익명', region),
    description: '',
    liked: bool(item.isLike),
  };
}

/** 게시글 상세 응답 → RoomPost. */
export function boardDetailToRoomPost(data: BoardDetailData): RoomPost {
  const liked = 'isLike' in data ? bool(data.isLike as boolean | string | undefined) : false;
  const region = regionFromBackendId(data.region);
  const id = String(data.boardId ?? '');
  const writer = data.writer ?? '익명';
  const photoUrls = data.images?.filter(Boolean) ?? [];
  const options = (data.roomOption ?? [])
    .map(roomOptionFromBackendId)
    .filter((option): option is NonNullable<typeof option> => option !== null);

  return {
    id,
    title: data.title ?? `방 게시글 #${id}`,
    thumbnailUrl: photoUrls[0],
    photoUrls,
    deposit: num(data.deposit),
    monthlyRent: num(data.mounthRent),
    roomType: toRoomType(data.roomType),
    region,
    views: num(data.viewer),
    likes: 0,
    createdAt: data.createAt ? new Date(data.createAt) : new Date(),
    status: 'open',
    author: minimalUser(writer, region, {
      id: writer,
      badges: [
        ...(data.isAuthStudent
          ? [{ kind: 'school' as const, label: '학생 인증', verifiedAt: new Date() }]
          : []),
        ...(data.isAuthEmployee
          ? [{ kind: 'company' as const, label: '직장 인증', verifiedAt: new Date() }]
          : []),
      ],
      importantConditions: (data.conditions ?? []).map((item) => item.name ?? '').filter(Boolean),
    }),
    description: data.contents ?? '',
    options,
    liked,
  };
}

/** 매칭 리스트 항목 → RoommateCard (매칭 탭 카드용). */
export function matchListItemToRoommateCard(item: MatchListItem): RoommateCard {
  const region = parseRegion(String(item.region ?? ''));
  const conditionLabels = (item.conditions ?? []).map((c) => c.name ?? '').filter(Boolean);
  const userId = String(item.userId ?? '');
  return {
    id: userId,
    user: minimalUser(item.name ?? '익명', region, {
      id: userId,
      bio: conditionLabels.join(' · '),
      importantConditions: conditionLabels,
    }),
    preferredRegions: [region],
    budgetMin: num(item.minMounthRent) || undefined,
    budgetMax: num(item.maxMounthRent) || undefined,
    moveInBy: item.comeableAt ? new Date(item.comeableAt) : undefined,
    compatibilityScore: num(item.score) || undefined,
    liked: bool(item.isLike),
  };
}

/** 명세 gender 문자열을 UI Gender 로 (방어적). */
export function toGender(value: string): Gender {
  if (value === 'male' || value === 'female') return value;
  return 'other';
}

/** 생활패턴 항목 배열을 "이름: 값" 라벨 배열로. */
export function lifestyleLabels(items: LifestyleItem[]): string[] {
  return items.map((it) => `${it.name}: ${it.value}`);
}

function toRoomType(value: string | number | undefined): RoomType {
  if (
    value === 'one-room' ||
    value === 'two-room' ||
    value === 'three-room+' ||
    value === 'officetel' ||
    value === 'share-house' ||
    value === 'apt' ||
    value === 'villa'
  ) {
    return value;
  }
  return roomTypeFromBackendId(value);
}
