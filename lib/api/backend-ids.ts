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

export const REGION_BACKEND_IDS: Record<string, number> = {
  서울: 1,
  '서울-전체': 1,
  '서울-강남구': 2,
  '서울-서초구': 3,
  '서울-마포구': 4,
  '서울-용산구': 5,
  '서울-성동구': 6,
  '서울-광진구': 7,
  '서울-서대문구': 8,
  '서울-송파구': 9,
  '서울-노원구': 10,
  경기: 11,
  '경기-전체': 11,
  인천: 12,
  '인천-전체': 12,
  충청: 13,
  '충청-전체': 13,
};

export function roomTypeBackendId(value: RoomType | null | undefined): number | undefined {
  return value ? ROOM_TYPE_BACKEND_IDS[value] : undefined;
}

export function regionBackendId(region: Region | null | undefined): number | undefined {
  if (!region) return undefined;
  const direct = Number(region.id);
  if (Number.isFinite(direct)) return direct;
  return REGION_BACKEND_IDS[region.id] ?? REGION_BACKEND_IDS[`${region.city}-${region.district}`];
}

export function compactNumbers(values: (number | undefined)[]): number[] {
  return values.filter((value): value is number => Number.isFinite(value));
}
