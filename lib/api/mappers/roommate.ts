import {
  labelForRegionId,
  labelForRoomProfileType,
  labelForRoomTypeId,
} from '@/lib/api/backend-ids';

import type { MatchDetailData, MatchListItem } from '../roommate-boards';
import { booleanValue, definedLabels, formatDateLabel, numberValue, stringValue } from './common';

export type RoommateMatchCardModel = {
  id: string;
  name: string;
  profileImageUrl?: string;
  age?: number;
  gender?: 'male' | 'female';
  genderLabel?: string;
  hasRoom: boolean;
  liked: boolean;
  compatibilityScore: number;
  minDeposit?: number;
  maxDeposit?: number;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  depositRentLabel: string;
  moveInLabel: string;
  roomTypeLabels: string[];
  roomTypeLabel: string;
  regionLabels: string[];
  regionLabel: string;
  lifestyleChips: string[];
  conditionChips: string[];
};

export type RoommateDetailLifestyleModel = {
  id: string;
  name: string;
  value: string;
};

export type RoommateDetailCompatibilityModel = {
  score?: number;
  items: {
    key: string;
    title: string;
    percent: number;
    label: string;
  }[];
};

export type RoommateMatchDetailModel = {
  id: string;
  name: string;
  initial: string;
  profileImageUrl?: string;
  age?: number;
  genderLabel?: string;
  regionLabel: string;
  roomStatusLabel: string;
  isAuthStudent: boolean;
  isAuthEmployee: boolean;
  lifeStyles: RoommateDetailLifestyleModel[];
  livingRows: { label: string; value: string }[];
  preferenceRows: { key: string; label: string; value: string }[];
  conditionText: string;
  compatibility: RoommateDetailCompatibilityModel;
};

export function toRoommateMatchCardModel(match: MatchListItem): RoommateMatchCardModel {
  const runtimeMatch = match as MatchListItem & {
    interested?: boolean;
    minMonthlyRent?: number;
    maxMonthlyRent?: number;
  };
  const id = stringValue(match.userId ?? match.memberId, '');
  const score = numberValue(match.score);
  const roomTypes = match.roomType ?? match.seekerProfile?.roomTypeNames ?? [];
  const roomTypeLabels = roomTypes
    .map((type) => (typeof type === 'number' ? labelForRoomTypeId(type) : type))
    .filter((label) => label !== '-');
  const roomTypeLabel = roomTypeLabels.join(', ');
  const regionValues = match.offerProfile
    ? [match.region ?? match.offerProfile.regionFullName]
    : (match.seekerProfile?.regionFullNames ?? [match.region]);
  const regionLabels = regionValues
    .map((region) => (typeof region === 'number' ? labelForRegionId(region) : region))
    .filter((region): region is string => Boolean(region));
  const region = regionLabels[0];
  const isOffer = match.roomProfileType === 'OFFER';
  const minDeposit = optionalNumber(
    isOffer ? (match.deposit ?? match.offerProfile?.deposit) : match.minDeposit,
  );
  const maxDeposit = optionalNumber(
    isOffer ? (match.deposit ?? match.offerProfile?.deposit) : match.maxDeposit,
  );
  const minMonthlyRent = optionalNumber(
    isOffer
      ? (match.mounthRent ?? match.offerProfile?.monthlyRent)
      : (runtimeMatch.minMonthlyRent ?? match.minMounthRent),
  );
  const maxMonthlyRent = optionalNumber(
    isOffer
      ? (match.mounthRent ?? match.offerProfile?.monthlyRent)
      : (runtimeMatch.maxMonthlyRent ?? match.maxMounthRent),
  );
  const depositLabel = isOffer
    ? formatMoneyValue(match.deposit ?? match.offerProfile?.deposit)
    : formatMoneyRange(
        match.minDeposit ?? match.seekerProfile?.minDeposit,
        match.maxDeposit ?? match.seekerProfile?.maxDeposit,
      );
  const monthlyRentLabel = isOffer
    ? formatMoneyValue(match.mounthRent ?? match.offerProfile?.monthlyRent)
    : formatMoneyRange(
        runtimeMatch.minMonthlyRent ?? match.minMounthRent ?? match.seekerProfile?.minMonthlyRent,
        runtimeMatch.maxMonthlyRent ?? match.maxMounthRent ?? match.seekerProfile?.maxMonthlyRent,
      );

  return {
    id,
    name: match.name ?? match.memberName ?? '이름 없음',
    profileImageUrl: match.memberProfileImageUrl,
    age: match.memberAge,
    gender: match.gender === 'FEMALE' ? 'female' : match.gender === 'MALE' ? 'male' : undefined,
    genderLabel: match.gender === 'FEMALE' ? '여성' : match.gender === 'MALE' ? '남성' : undefined,
    hasRoom: isOffer,
    liked: booleanValue(match.interested),
    compatibilityScore: score,
    minDeposit,
    maxDeposit,
    minMonthlyRent,
    maxMonthlyRent,
    depositRentLabel: `${depositLabel} / ${monthlyRentLabel}`,
    moveInLabel: formatDateLabel(match.comeableAt),
    roomTypeLabels,
    roomTypeLabel: roomTypeLabel || '-',
    regionLabels,
    regionLabel: region ?? '-',
    lifestyleChips: definedLabels((match.lifeStyles ?? []).slice(0, 4).map((item) => item.name)),
    conditionChips: definedLabels((match.conditions ?? []).map((item) => item.name)),
  };
}

function optionalNumber(value: number | string | null | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

type RawLifestyleItem = NonNullable<MatchDetailData['lifeStyles']>[number];

/**
 * 상세 응답의 생활 패턴이 일부만 내려오는 경우가 있어, 매칭 리스트 응답의
 * 생활 패턴을 fallback 으로 병합해 8종 타일이 모두 나오게 한다.
 */
function mergeLifestyleItems(
  primary: RawLifestyleItem[] | undefined,
  fallback: RawLifestyleItem[] | undefined,
): RawLifestyleItem[] {
  const merged: RawLifestyleItem[] = [...(primary ?? [])];
  const seen = new Set(merged.map(lifestyleItemKey));
  for (const item of fallback ?? []) {
    const key = lifestyleItemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

function lifestyleItemKey(item: RawLifestyleItem): string {
  return item.name?.trim() || String(item.lifestyleId ?? '');
}

/** SCALE 항목은 value 가 숫자 원값이라 사람이 읽는 라벨(description)을 우선한다. */
function lifestyleDisplayValue(item: RawLifestyleItem): string {
  return item.description?.trim() || item.value?.trim() || '-';
}

export function toRoommateMatchDetailModel(
  data: MatchDetailData,
  id: string,
  fallbackLifeStyles?: RawLifestyleItem[],
): RoommateMatchDetailModel {
  const lifestyleItems = mergeLifestyleItems(data.lifeStyles, fallbackLifeStyles);
  const compatibility = data.compatibility;
  const name = data.name ?? data.memberName ?? '이름 없음';
  const region =
    data.region ?? data.offerProfile?.regionFullName ?? data.seekerProfile?.regionFullNames?.[0];
  const roomStatusLabel =
    data.roomProfileType === 'OFFER'
      ? `${labelForRoomProfileType(data.roomProfileType)} · ${
          typeof region === 'number' ? labelForRegionId(region) : (region ?? '-')
        }`
      : '아직 방이 없어요';
  const isOffer = data.roomProfileType === 'OFFER';
  const roomTypeLabel = isOffer
    ? (data.offerProfile?.roomTypeName ?? '-')
    : data.seekerProfile?.roomTypeNames?.join(' · ') || '-';
  const livingRows = isOffer
    ? [
        {
          label: '보증금',
          value: `${numberValue(data.offerProfile?.deposit ?? data.deposit).toLocaleString()}만원`,
        },
        {
          label: '월세',
          value: `${numberValue(
            data.offerProfile?.monthlyRent ?? data.mounthRent,
          ).toLocaleString()}만원`,
        },
        { label: '입주 가능 시기', value: formatDateLabel(data.comeableAt) },
        { label: '방 형태', value: roomTypeLabel },
        {
          label: '지역',
          value: typeof region === 'number' ? labelForRegionId(region) : (region ?? '-'),
        },
      ]
    : [
        {
          label: '예산 보증금',
          value: `${numberValue(
            data.seekerProfile?.maxDeposit ?? data.maxDeposit,
          ).toLocaleString()}만원 이하`,
        },
        {
          label: '예산 월세',
          value: `${numberValue(
            data.seekerProfile?.maxMonthlyRent ?? data.maxMounthRent,
          ).toLocaleString()}만원 이하`,
        },
        { label: '입주 희망 시기', value: formatDateLabel(data.comeableAt) },
        { label: '희망 룸 형태', value: roomTypeLabel },
        {
          label: '희망 지역',
          value:
            data.seekerProfile?.regionFullNames?.join(' · ') ||
            (typeof region === 'number' ? labelForRegionId(region) : (region ?? '-')),
        },
      ];

  return {
    id,
    name,
    initial: name.charAt(0),
    profileImageUrl: data.memberProfileImageUrl,
    age: data.memberAge,
    genderLabel: data.gender === 'FEMALE' ? '여성' : data.gender === 'MALE' ? '남성' : undefined,
    regionLabel: typeof region === 'number' ? labelForRegionId(region) : (region ?? '-'),
    roomStatusLabel,
    isAuthStudent:
      booleanValue(data.isAuthStudent) || hasAuthentication(data.authentications, 'STUDENT'),
    isAuthEmployee:
      booleanValue(data.isAuthEmployee) || hasAuthentication(data.authentications, 'COMPANY'),
    lifeStyles: lifestyleItems.map((item, index) => ({
      id: stringValue(item.lifestyleId, `lifestyle-${index}`),
      name: item.name?.trim() || '-',
      value: lifestyleDisplayValue(item),
    })),
    livingRows,
    preferenceRows: (data.preferences ?? []).map((preference, index) => ({
      key: stringValue(preference.preferencesId, `preference-${index}`),
      label: preference.name ?? '-',
      value: preference.value ?? '-',
    })),
    conditionText: definedLabels(
      (data.conditionWeights ?? []).map((condition) => condition.name),
    ).join(' · '),
    compatibility: {
      score:
        compatibility?.totalScore !== undefined ? numberValue(compatibility.totalScore) : undefined,
      items: (compatibility?.lifeStyleInfo ?? []).map((info, index) => {
        const percent = percentageValue(info.percent);
        const title = info.name ?? '-';
        return {
          key: `${title}-${index}`,
          title,
          percent,
          label: String(percent),
        };
      }),
    },
  };
}

function formatMoneyValue(value: number | undefined): string {
  return numberValue(value).toLocaleString();
}

function formatMoneyRange(min: number | undefined, max: number | undefined): string {
  const normalizedMin = numberValue(min);
  const normalizedMax = numberValue(max);
  if (normalizedMin === normalizedMax) return normalizedMin.toLocaleString();
  return `${normalizedMin.toLocaleString()}~${normalizedMax.toLocaleString()}`;
}

function percentageValue(value: string | number | undefined): number {
  const parsed = typeof value === 'string' ? Number(value.replace('%', '').trim()) : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
}

function hasAuthentication(value: unknown, expected: 'STUDENT' | 'COMPANY'): boolean {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}
