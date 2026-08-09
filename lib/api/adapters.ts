/**
 * API DTO(명세 응답) → lib/domain UI 타입 어댑터.
 *
 * 명세 응답은 문자열 위주의 평면 구조이고, 화면 컴포넌트는 lib/domain 의
 * 리치 타입(RoomPost, RoommateCard 등)을 쓴다. 이 파일이 둘 사이를 잇는다.
 * 순수 함수만 두며 React/네트워크에 의존하지 않는다.
 */
import type { RoomOption, RoomPost, RoommateCard, UserSummary } from '@/lib/domain';
import type { Gender, Region, RoomType } from '@/lib/onboarding';

import { parseServerDate } from './date-time';
import { labelForRegionId, regionFromBackendId, roomTypeFromBackendId } from './backend-ids';
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
  const regionValue = item.region ?? item.regionFullName;
  const region =
    regionValue !== undefined
      ? typeof regionValue === 'number'
        ? parseRegion(labelForRegionId(regionValue))
        : parseRegion(String(regionValue))
      : { id: '', city: '', district: '' };
  const id = String(item.boardId ?? item.id ?? '');
  return {
    id,
    title: item.title ?? `방 게시글 #${id}`,
    thumbnailUrl: item.image ?? item.imageUrl,
    deposit: num(item.deposit),
    monthlyRent: num(item.mounthRent ?? item.monthlyRent),
    maintenanceFee: item.managementCost != null ? num(item.managementCost) : undefined,
    roomType: toRoomType(item.roomType ?? item.roomTypes?.[0]),
    region,
    views: num(item.viewer ?? item.hits),
    likes: 0,
    createdAt: parseServerDate(item.createAt ?? item.createdAt) ?? new Date(),
    status: 'open',
    // 차단 필터(isUserBlocked)가 실제 memberId 로 동작하도록 이름이 아닌 id 를 쓴다.
    author: minimalUser(item.writer ?? item.memberName ?? '익명', region, {
      id: item.memberId != null ? String(item.memberId) : undefined,
      age: item.memberAge ?? 0,
      avatarUrl: item.memberProfileImageUrl,
      gender: item.gender === 'FEMALE' ? 'female' : item.gender === 'MALE' ? 'male' : 'other',
      badges: [
        ...(hasAuthentication(item.authentications, 'STUDENT')
          ? [{ kind: 'school' as const, label: '학생 인증', verifiedAt: new Date() }]
          : []),
        ...(hasAuthentication(item.authentications, 'COMPANY')
          ? [{ kind: 'company' as const, label: '직장 인증', verifiedAt: new Date() }]
          : []),
      ],
    }),
    description: '',
    liked: bool(item.interested ?? item.isLike),
  };
}

/** 게시글 상세 응답 → RoomPost. */
export function boardDetailToRoomPost(data: BoardDetailData): RoomPost {
  const liked = bool(data.interested ?? data.isLike);
  const region =
    data.region !== undefined
      ? typeof data.region === 'number'
        ? regionFromBackendId(data.region)
        : parseRegion(String(data.region))
      : parseRegion(data.regionFullName ?? '');
  const id = String(data.boardId ?? '');
  const writer = data.writer ?? data.memberName ?? '익명';
  const photoUrls = (data.images ?? []).map(imageUrl).filter(Boolean);
  const options = roomOptionsFromDetail(data);

  return {
    id,
    title: data.title ?? `방 게시글 #${id}`,
    thumbnailUrl: photoUrls[0],
    photoUrls,
    deposit: num(data.deposit),
    monthlyRent: num(data.mounthRent ?? data.monthlyRent),
    maintenanceFee: data.managementCost != null ? num(data.managementCost) : undefined,
    roomType: toRoomType(data.roomType ?? data.roomTypeName),
    region,
    views: num(data.viewer ?? data.hits),
    likes: 0,
    createdAt: parseServerDate(data.createAt ?? data.createdAt) ?? new Date(),
    status: 'open',
    author: minimalUser(writer, region, {
      id: String(data.memberId ?? writer),
      age: data.memberAge ?? 0,
      avatarUrl: data.memberProfileImageUrl,
      gender: data.gender === 'FEMALE' ? 'female' : data.gender === 'MALE' ? 'male' : 'other',
      badges: [
        ...(data.isAuthStudent || hasAuthentication(data.authentications, 'STUDENT')
          ? [{ kind: 'school' as const, label: '학생 인증', verifiedAt: new Date() }]
          : []),
        ...(data.isAuthEmployee || hasAuthentication(data.authentications, 'COMPANY')
          ? [{ kind: 'company' as const, label: '직장 인증', verifiedAt: new Date() }]
          : []),
      ],
      importantConditions: (data.conditions ?? []).map((item) => item.name ?? '').filter(Boolean),
      lifestyle: lifestyleFromItems(data.lifeStyles),
    }),
    description: data.contents ?? '',
    lifeStyles: (data.lifeStyles ?? []).map((item, index) => ({
      id: item.lifestyleId != null ? String(item.lifestyleId) : `lifestyle-${index}`,
      name: item.name ?? '-',
      value: item.description?.trim() || item.value?.trim() || '-',
    })),
    options,
    moveInDate: parseServerDate(data.comeableDate) ?? undefined,
    moveInNegotiable: data.comeableDateNegotiable,
    liked,
    compatibilityScore:
      data.compatibility?.totalScore != null ? num(data.compatibility.totalScore) : undefined,
    compatibilityDetails:
      data.compatibility?.lifeStyleInfo
        ?.map((item) => ({
          label: item.name?.trim() || '생활 패턴',
          score: percentNumber(item.percent),
        }))
        .filter((item) => item.label.length > 0) ?? [],
    preferredRoommate: preferredRoommateFromDetail(data),
  };
}

function lifestyleFromItems(
  items: { name?: string; value?: string; description?: string }[] | undefined,
): Partial<UserSummary['lifestyle']> {
  const lifestyle: Partial<UserSummary['lifestyle']> = {};
  for (const item of items ?? []) {
    const name = item.name?.trim() ?? '';
    const value = item.description?.trim() || item.value?.trim() || '';
    if (!value) continue;
    if (name.includes('취침')) lifestyle.sleepTime = value;
    else if (name.includes('기상')) lifestyle.wakeTime = value;
    else if (name.includes('청결') || name.includes('청소') || name.includes('깔끔')) {
      lifestyle.cleanliness = levelNumber(value);
    } else if (name.includes('소음')) lifestyle.noise = levelNumber(value);
    else if (name.includes('흡연')) lifestyle.smoking = smokingValue(value);
    else if (name.includes('반려') || name.includes('동물')) lifestyle.pet = petValue(value);
  }
  return lifestyle;
}

function preferredRoommateFromDetail(data: BoardDetailData): RoomPost['preferredRoommate'] {
  const conditions = data.conditions ?? [];
  const gender = conditions.find((item) => item.name?.includes('성별'));
  const smoking = conditions.find((item) => item.name?.includes('흡연'));
  const conditionItems = conditions.flatMap((item) => {
    if (item.name?.includes('성별')) return [];
    const name = item.name?.trim();
    const value = conditionDisplayValue(item);
    return name && value
      ? [
          {
            id: item.conditionId != null ? String(item.conditionId) : undefined,
            name,
            value,
            image: item.imageUrl ?? null,
          },
        ]
      : [];
  });
  const importantConditions = (data.conditionWeights ?? [])
    .map((item) => {
      const name = item.name?.trim();
      if (!name) return null;
      return {
        id: item.weightConditionId != null ? String(item.weightConditionId) : undefined,
        name,
        image: item.imageUrl ?? null,
      };
    })
    .filter((item): item is { id: string | undefined; name: string; image: string | null } =>
      Boolean(item),
    );
  return {
    genderLabel: conditionDisplayValue(gender),
    smokingLabel: conditionDisplayValue(smoking),
    smokingImage: smoking?.imageUrl ?? null,
    conditions: conditionItems,
    importantConditions,
  };
}

function conditionDisplayValue(
  condition: { value?: string; description?: string } | undefined,
): string | undefined {
  return condition?.description?.trim() || condition?.value?.trim() || undefined;
}

function percentNumber(value: string | number | undefined): number {
  const parsed = typeof value === 'string' ? Number(value.replace('%', '').trim()) : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
}

function levelNumber(value: string): 1 | 2 | 3 | 4 | 5 {
  const parsed = Math.round(Number(value));
  return Math.max(1, Math.min(5, Number.isFinite(parsed) ? parsed : 3)) as 1 | 2 | 3 | 4 | 5;
}

function smokingValue(value: string): string {
  const normalized = value.toUpperCase();
  if (normalized.includes('비흡연') || normalized === 'NO' || normalized === 'FALSE') return 'no';
  if (normalized.includes('실외') || normalized.includes('OUTDOOR')) return 'outdoor';
  if (normalized.includes('흡연') || normalized === 'YES' || normalized === 'TRUE') return 'yes';
  return value;
}

function petValue(value: string): string {
  const normalized = value.toUpperCase();
  if (normalized.includes('불가') || normalized === 'NO' || normalized === 'FALSE') return 'no';
  if (normalized.includes('소형') || normalized.includes('SMALL')) return 'small';
  return value;
}

/** 매칭 리스트 항목 → RoommateCard (매칭 탭 카드용). */
export function matchListItemToRoommateCard(item: MatchListItem): RoommateCard {
  const region = parseRegion(
    String(
      item.region ??
        item.offerProfile?.regionFullName ??
        item.seekerProfile?.regionFullNames?.[0] ??
        '',
    ),
  );
  const conditionLabels = (item.conditions ?? []).map((c) => c.name ?? '').filter(Boolean);
  const userId = String(item.userId ?? item.memberId ?? '');
  return {
    id: userId,
    user: minimalUser(item.name ?? item.memberName ?? '익명', region, {
      id: userId,
      bio: conditionLabels.join(' · '),
      importantConditions: conditionLabels,
    }),
    preferredRegions: [region],
    budgetMin: num(item.minMounthRent ?? item.seekerProfile?.minMonthlyRent) || undefined,
    budgetMax: num(item.maxMounthRent ?? item.seekerProfile?.maxMonthlyRent) || undefined,
    moveInBy: parseServerDate(item.comeableAt) ?? undefined,
    compatibilityScore: num(item.score) || undefined,
    liked: bool(item.interested),
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

const ROOM_TYPE_BY_SERVER_LABEL: Record<string, RoomType> = {
  원룸: 'one-room',
  투룸: 'two-room',
  '쓰리룸+': 'three-room+',
  오피스텔: 'officetel',
  아파트: 'apt',
  쉐어하우스: 'share-house',
  빌라: 'villa',
};

function toRoomType(value: string | number | undefined): RoomType {
  if (typeof value === 'string' && ROOM_TYPE_BY_SERVER_LABEL[value]) {
    return ROOM_TYPE_BY_SERVER_LABEL[value];
  }
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

function imageUrl(image: NonNullable<BoardDetailData['images']>[number] | undefined): string {
  if (!image) return '';
  return typeof image === 'string' ? image : (image.url ?? '');
}

/**
 * 방 추가 옵션은 서버 DB(/meta/room-add-options) 정의를 그대로 쓴다.
 * 상세 응답의 roomExtraOptions(id+name)를 우선 쓰고, id만 오는 roomOption도 함께 수용한다.
 * 이름이 비면 화면에서 메타로 채운다.
 */
function roomOptionsFromDetail(data: BoardDetailData): RoomOption[] {
  const byId = new Map<number, RoomOption>();
  (data.roomExtraOptions ?? []).forEach((option) => {
    const id = Number(option.extraOptionId);
    if (!Number.isFinite(id)) return;
    byId.set(id, { id, name: option.name?.trim() ?? '' });
  });
  (data.roomOption ?? []).forEach((value) => {
    const id = Number(value);
    if (!Number.isFinite(id) || byId.has(id)) return;
    byId.set(id, { id, name: '' });
  });
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function hasAuthentication(value: unknown, expected: 'STUDENT' | 'COMPANY'): boolean {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}
