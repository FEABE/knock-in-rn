import type { Region, RoomType } from '@/lib/onboarding';

export const ROOM_TYPE_BACKEND_IDS: Partial<Record<RoomType, number>> = {
  'one-room': 1,
  'two-room': 2,
  'three-room+': 3,
  officetel: 4,
  apt: 5,
};

export const ROOM_TYPE_BACKEND_LABELS: Record<number, string> = {
  1: '원룸',
  2: '투룸',
  3: '쓰리룸+',
  4: '오피스텔',
  5: '아파트',
};

export const ROOM_TYPE_BACKEND_VALUES: Record<number, RoomType> = {
  1: 'one-room',
  2: 'two-room',
  3: 'three-room+',
  4: 'officetel',
  5: 'apt',
};

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
  서울특별시: 1,
  '서울-전체': 1,
  'seoul-all': 1,
  경기: 2,
  경기도: 2,
  '경기-전체': 2,
  'gg-all': 2,
  '서울-강남구': 3,
  'seoul-gangnam': 3,
  '서울-마포구': 4,
  'seoul-mapo': 4,
  '서울-송파구': 5,
  'seoul-songpa': 5,
  '서울-서초구': 6,
  'seoul-seocho': 6,
  '서울-성동구': 7,
  'seoul-seongdong': 7,
  '서울-종로구': 8,
  'seoul-jongno': 8,
  '서울-영등포구': 9,
  'seoul-yeongdeungpo': 9,
  '서울-용산구': 10,
  'seoul-yongsan': 10,
  '경기-수원시 영통구': 11,
  'gg-suwon': 11,
  '경기-성남시 분당구': 12,
  'gg-seongnam': 12,
  '경기-고양시 일산동구': 13,
  'gg-goyang': 13,
  '경기-용인시 수지구': 14,
  'gg-yongin': 14,
  '경기-안양시 동안구': 15,
  'gg-anyang': 15,
  '경기-부천시': 16,
  'gg-bucheon': 16,
  '경기-남양주시': 17,
  'gg-namyangju': 17,
  '경기-화성시': 18,
  'gg-hwaseong': 18,
  '서울-강남구-역삼동': 19,
  '서울-강남구-삼성동': 20,
  '서울-강남구-청담동': 21,
  '서울-강남구-논현동': 22,
  '서울-마포구-서교동': 23,
  '서울-마포구-합정동': 24,
  '서울-마포구-망원동': 25,
  '서울-마포구-연남동': 26,
  '서울-송파구-잠실동': 27,
  '서울-송파구-문정동': 28,
  '서울-송파구-가락동': 29,
  '서울-송파구-방이동': 30,
  '서울-서초구-반포동': 31,
  '서울-서초구-방배동': 32,
  '서울-서초구-서초동': 33,
  '서울-서초구-양재동': 34,
  '서울-성동구-성수동': 35,
  '서울-성동구-옥수동': 36,
  '서울-성동구-왕십리동': 37,
  '서울-성동구-마장동': 38,
  '서울-종로구-혜화동': 39,
  '서울-종로구-명륜동': 40,
  '서울-종로구-삼청동': 41,
  '서울-종로구-평창동': 42,
  '서울-영등포구-여의도동': 43,
  '서울-영등포구-당산동': 44,
  '서울-영등포구-문래동': 45,
  '서울-영등포구-신길동': 46,
  '서울-용산구-이태원동': 47,
  '서울-용산구-한남동': 48,
  '서울-용산구-이촌동': 49,
  '서울-용산구-후암동': 50,
  '경기-수원시 영통구-영통동': 51,
  '경기-수원시 영통구-망포동': 52,
  '경기-수원시 영통구-매탄동': 53,
  '경기-수원시 영통구-이의동': 54,
  '경기-성남시 분당구-삼평동': 55,
  '경기-성남시 분당구-서현동': 56,
  '경기-성남시 분당구-정자동': 57,
  '경기-성남시 분당구-야탑동': 58,
  '경기-고양시 일산동구-장항동': 59,
  '경기-고양시 일산동구-마두동': 60,
  '경기-고양시 일산동구-백석동': 61,
  '경기-고양시 일산동구-식사동': 62,
  '경기-용인시 수지구-풍덕천동': 63,
  '경기-용인시 수지구-죽전동': 64,
  '경기-용인시 수지구-동천동': 65,
  '경기-용인시 수지구-상현동': 66,
  '경기-안양시 동안구-범계동': 67,
  '경기-안양시 동안구-평촌동': 68,
  '경기-안양시 동안구-관양동': 69,
  '경기-안양시 동안구-호계동': 70,
  '경기-부천시-중동': 71,
  '경기-부천시-상동': 72,
  '경기-부천시-심곡동': 73,
  '경기-부천시-소사본동': 74,
  '경기-남양주시-다산동': 75,
  '경기-남양주시-별내동': 76,
  '경기-남양주시-와부읍': 77,
  '경기-남양주시-진접읍': 78,
  '경기-화성시-동탄동': 79,
  '경기-화성시-향남읍': 80,
  '경기-화성시-봉담읍': 81,
  '경기-화성시-새솔동': 82,
};

export const REGION_BACKEND_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(REGION_BACKEND_IDS)
    .filter(([key]) => key.includes('-') && /[가-힣]/.test(key))
    .map(([key, value]) => [value, key.replaceAll('-', ' ')]),
);

export type BackendIdRegistry = {
  roomTypes: Partial<Record<string, number>>;
  regions: Record<string, number>;
  lifestyles: Partial<Record<string, number>>;
  conditions: Record<string, number>;
};

export const DEFAULT_BACKEND_ID_REGISTRY: BackendIdRegistry = {
  roomTypes: ROOM_TYPE_BACKEND_IDS,
  regions: REGION_BACKEND_IDS,
  lifestyles: {},
  conditions: CONDITION_BACKEND_IDS,
};

export function roomTypeBackendId(value: RoomType | null | undefined): number | undefined {
  if (!value) return undefined;
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  return ROOM_TYPE_BACKEND_IDS[value];
}

export function roomTypeFromBackendId(value: number | string | null | undefined): RoomType {
  const id = Number(value);
  return Number.isFinite(id) ? (ROOM_TYPE_BACKEND_VALUES[id] ?? 'one-room') : 'one-room';
}

export function regionBackendId(region: Region | null | undefined): number | undefined {
  if (!region) return undefined;
  const direct = Number(region.id);
  if (Number.isFinite(direct)) return direct;
  const candidates = [
    region.id,
    `${region.city}-${region.district}`,
    region.district.includes(' ') ? `${region.city}-${region.district.split(' ')[0]}` : undefined,
    ...region.id
      .split('-')
      .slice(0, -1)
      .map((_, index, parts) => parts.slice(0, parts.length - index).join('-')),
  ];
  for (const key of candidates) {
    if (key && REGION_BACKEND_IDS[key] !== undefined) return REGION_BACKEND_IDS[key];
  }
  return undefined;
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
