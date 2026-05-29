/**
 * API DTO(명세 응답) → lib/domain UI 타입 어댑터.
 *
 * 명세 응답은 문자열 위주의 평면 구조이고, 화면 컴포넌트는 lib/domain 의
 * 리치 타입(RoomPost, RoommateCard 등)을 쓴다. 이 파일이 둘 사이를 잇는다.
 * 순수 함수만 두며 React/네트워크에 의존하지 않는다.
 */
import type { RoomPost, RoommateCard, UserSummary } from '@/lib/domain';
import type { Gender, Region, RoomType } from '@/lib/onboarding';

import type { LifestyleItem } from './entities';
import type { BoardListItem, MatchListItem } from './roommate-boards';

/** "서울 마포구" → { id, city, district }. 공백 기준 분리. */
export function parseRegion(label: string): Region {
  const trimmed = (label ?? '').trim();
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
function num(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** 명세 boolean 문자열("true"/"false") → boolean. */
function bool(value: string | undefined): boolean {
  return value === 'true';
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
  const region = parseRegion(item.region);
  return {
    id: item.boardId,
    title: item.title,
    thumbnailUrl: item.image || undefined,
    deposit: num(item.deposit),
    monthlyRent: num(item.mounthRent),
    roomType: item.roomType as RoomType,
    region,
    views: num(item.viewer),
    likes: 0,
    createdAt: new Date(item.createAt),
    status: 'open',
    author: minimalUser(item.writer, region),
    description: '',
    liked: bool(item.isLike),
  };
}

/** 매칭 리스트 항목 → RoommateCard (매칭 탭 카드용). */
export function matchListItemToRoommateCard(item: MatchListItem): RoommateCard {
  const region = parseRegion(item.region);
  const conditionLabels = item.conditions.map((c) => c.name);
  return {
    id: item.userId,
    user: minimalUser(item.name, region, {
      id: item.userId,
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
