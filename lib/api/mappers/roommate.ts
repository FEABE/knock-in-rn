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
  genderLabel?: string;
  hasRoom: boolean;
  liked: boolean;
  compatibilityScore: number;
  depositRentLabel: string;
  moveInLabel: string;
  roomTypeLabel: string;
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
  const roomTypeLabel = roomTypes
    .map((type) => (typeof type === 'number' ? labelForRoomTypeId(type) : type))
    .filter((label) => label !== '-')
    .join(', ');
  const region =
    match.region ?? match.offerProfile?.regionFullName ?? match.seekerProfile?.regionFullNames?.[0];
  const isOffer = match.roomProfileType === 'OFFER';
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
    genderLabel: match.gender === 'FEMALE' ? '여성' : match.gender === 'MALE' ? '남성' : undefined,
    hasRoom: isOffer,
    liked: booleanValue(runtimeMatch.interested ?? match.isLike),
    compatibilityScore: score,
    depositRentLabel: `${depositLabel} / ${monthlyRentLabel}`,
    moveInLabel: formatDateLabel(match.comeableAt),
    roomTypeLabel: roomTypeLabel || '-',
    regionLabel: typeof region === 'number' ? labelForRegionId(region) : (region ?? '-'),
    lifestyleChips: definedLabels((match.lifeStyles ?? []).slice(0, 4).map((item) => item.name)),
    conditionChips: definedLabels((match.conditions ?? []).map((item) => item.name)),
  };
}

export function toRoommateMatchDetailModel(
  data: MatchDetailData,
  id: string,
): RoommateMatchDetailModel {
  const compatibility = data.compatibility as
    | (NonNullable<MatchDetailData['compatibility']> & {
        totalScore?: number;
        lifeStyleInfo?: (NonNullable<
          NonNullable<MatchDetailData['compatibility']>['lifeStyleInfo']
        >[number] & {
          name?: string;
        })[];
      })
    | undefined;
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
    lifeStyles: (data.lifeStyles ?? []).map((item, index) => ({
      id: stringValue(item.lifestyleId, `lifestyle-${index}`),
      name: item.name ?? '-',
      value: item.value ?? '-',
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
        compatibility?.totalScore !== undefined
          ? numberValue(compatibility.totalScore)
          : compatibility?.score !== undefined
            ? numberValue(compatibility.score)
            : undefined,
      items: (compatibility?.lifeStyleInfo ?? []).map((info, index) => {
        const percent = percentageValue(info.percent);
        const runtimeInfo = info as typeof info & { name?: string };
        const title = runtimeInfo.name ?? info.title ?? '-';
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
