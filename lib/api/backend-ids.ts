import type { RoomOption } from '@/lib/domain';
import type { LifestyleScaleKey, Region, RoomType } from '@/lib/onboarding';

export const ROOM_TYPE_BACKEND_IDS: Record<RoomType, number> = {
  'one-room': 1,
  'two-room': 2,
  'three-room+': 3,
  officetel: 4,
  'share-house': 5,
  apt: 6,
  villa: 7,
};

export const ROOM_TYPE_BACKEND_LABELS: Record<number, string> = {
  1: '원룸',
  2: '투룸',
  3: '쓰리룸 이상',
  4: '오피스텔',
  5: '쉐어하우스',
  6: '아파트',
  7: '빌라',
};

export const ROOM_TYPE_BACKEND_VALUES: Record<number, RoomType> = {
  1: 'one-room',
  2: 'two-room',
  3: 'three-room+',
  4: 'officetel',
  5: 'share-house',
  6: 'apt',
  7: 'villa',
};

export const LIFESTYLE_BACKEND_IDS: Record<LifestyleScaleKey, number> = {
  sleep: 1,
  cleanliness: 2,
  noise: 3,
  personality: 4,
  privacy: 5,
  visitor: 6,
};

export const LIFESTYLE_CHOICE_BACKEND_IDS = {
  smoking: {
    no: 7,
    outdoor: 8,
    yes: 9,
  },
  pet: {
    no: 10,
    small: 11,
    any: 12,
  },
} as const;

export const CONDITION_BACKEND_IDS: Record<string, number> = {
  'no-smoking': 1,
  'no-pet': 2,
  quiet: 3,
  clean: 4,
  'similar-schedule': 5,
  'no-visitor': 6,
  'share-chores': 7,
  'separate-bath': 8,
  'female-only': 9,
  'male-only': 10,
  student: 11,
  worker: 12,
  'long-term': 13,
  'short-term': 14,
};

export const ROOM_OPTION_BACKEND_IDS: Record<RoomOption, number> = {
  'full-option': 1,
  parking: 2,
  elevator: 3,
  pet: 4,
};

export const ROOM_OPTION_BACKEND_VALUES: Record<number, RoomOption> = {
  1: 'full-option',
  2: 'parking',
  3: 'elevator',
  4: 'pet',
};

export const REGION_BACKEND_IDS: Record<string, number> = {
  서울: 1,
  '서울-전체': 1,
  'seoul-all': 1,
  '서울-강남구': 2,
  'seoul-gangnam': 2,
  '서울-서초구': 3,
  'seoul-seocho': 3,
  '서울-마포구': 4,
  'seoul-mapo': 4,
  '서울-용산구': 5,
  'seoul-yongsan': 5,
  '서울-성동구': 6,
  'seoul-seongdong': 6,
  '서울-광진구': 7,
  'seoul-gwangjin': 7,
  '서울-서대문구': 8,
  'seoul-seodaemun': 8,
  '서울-송파구': 9,
  'seoul-songpa': 9,
  '서울-노원구': 10,
  'seoul-nowon': 10,
  경기: 11,
  '경기-전체': 11,
  'gg-all': 11,
  인천: 12,
  '인천-전체': 12,
  'incheon-all': 12,
  충청: 13,
  '충청-전체': 13,
  'chungcheong-all': 13,
};

export const REGION_BACKEND_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(REGION_BACKEND_IDS)
    .filter(([key]) => key.includes('-') && /[가-힣]/.test(key))
    .map(([key, value]) => [value, key.replace('-', ' ')]),
);

export type BackendIdRegistry = {
  roomTypes: Record<string, number>;
  regions: Record<string, number>;
  lifestyles: Record<string, number>;
  conditions: Record<string, number>;
};

export const DEFAULT_BACKEND_ID_REGISTRY: BackendIdRegistry = {
  roomTypes: ROOM_TYPE_BACKEND_IDS,
  regions: REGION_BACKEND_IDS,
  lifestyles: {
    ...LIFESTYLE_BACKEND_IDS,
    ...Object.fromEntries(
      Object.entries(LIFESTYLE_CHOICE_BACKEND_IDS).flatMap(([group, choices]) =>
        Object.entries(choices).map(([key, value]) => [`${group}.${key}`, value]),
      ),
    ),
  },
  conditions: CONDITION_BACKEND_IDS,
};

export function roomTypeBackendId(value: RoomType | null | undefined): number | undefined {
  return value ? ROOM_TYPE_BACKEND_IDS[value] : undefined;
}

export function roomTypeFromBackendId(value: number | string | null | undefined): RoomType {
  const id = Number(value);
  return Number.isFinite(id) ? (ROOM_TYPE_BACKEND_VALUES[id] ?? 'one-room') : 'one-room';
}

export function regionBackendId(region: Region | null | undefined): number | undefined {
  if (!region) return undefined;
  const direct = Number(region.id);
  if (Number.isFinite(direct)) return direct;
  return REGION_BACKEND_IDS[region.id] ?? REGION_BACKEND_IDS[`${region.city}-${region.district}`];
}

export function regionFromBackendId(value: number | string | null | undefined): Region {
  if (value === undefined || value === null || value === '') {
    return { id: '', city: '', district: '' };
  }
  const id = Number(value);
  if (!Number.isFinite(id)) {
    const label = String(value);
    const [city = label, ...rest] = label.split(' ');
    return { id: label, city, district: rest.join(' ') };
  }
  const label = REGION_BACKEND_LABELS[id] ?? String(value);
  const [city = label, ...rest] = label.split(' ');
  return { id: String(id), city, district: rest.join(' ') };
}

export function regionKeyBackendId(value: string | number | null | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  return REGION_BACKEND_IDS[String(value)];
}

export function compactNumbers(values: (number | undefined)[]): number[] {
  return values.filter((value): value is number => Number.isFinite(value));
}

export function labelForRoomTypeId(value: number | string | null | undefined): string {
  const id = Number(value);
  return Number.isFinite(id) ? (ROOM_TYPE_BACKEND_LABELS[id] ?? String(value)) : '-';
}

export function labelForRegionId(value: number | string | null | undefined): string {
  if (value === undefined || value === null || value === '') return '-';
  const id = Number(value);
  if (Number.isFinite(id)) return REGION_BACKEND_LABELS[id] ?? String(value);
  return String(value);
}

export function labelForRoomProfileType(value: 'SEEKER' | 'OFFER' | null | undefined): string {
  if (value === 'OFFER') return '방 있음';
  if (value === 'SEEKER') return '방 찾는 중';
  return '-';
}

export function roomOptionBackendId(value: RoomOption | null | undefined): number | undefined {
  return value ? ROOM_OPTION_BACKEND_IDS[value] : undefined;
}

export function roomOptionFromBackendId(
  value: number | string | null | undefined,
): RoomOption | null {
  const id = Number(value);
  return Number.isFinite(id) ? (ROOM_OPTION_BACKEND_VALUES[id] ?? null) : null;
}
