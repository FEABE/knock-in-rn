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
  score: number;
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
  const id = stringValue(match.userId ?? match.memberId, '');
  const score = numberValue(match.score);
  const roomTypes = match.roomType ?? match.seekerProfile?.roomTypeNames ?? [];
  const roomTypeLabel = roomTypes
    .map((type) => (typeof type === 'number' ? labelForRoomTypeId(type) : type))
    .filter((label) => label !== '-')
    .join(', ');
  const region =
    match.region ?? match.offerProfile?.regionFullName ?? match.seekerProfile?.regionFullNames?.[0];

  return {
    id,
    name: match.name ?? match.memberName ?? '이름 없음',
    hasRoom: match.roomProfileType === 'OFFER',
    liked: booleanValue(match.isLike),
    compatibilityScore: score,
    depositRentLabel: `${numberValue(match.deposit ?? match.offerProfile?.deposit)} / ${numberValue(
      match.mounthRent ?? match.offerProfile?.monthlyRent,
    )}`,
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
  const name = data.name ?? data.memberName ?? '이름 없음';
  const region =
    data.region ?? data.offerProfile?.regionFullName ?? data.seekerProfile?.regionFullNames?.[0];
  const roomStatusLabel =
    data.roomProfileType === 'OFFER'
      ? `${labelForRoomProfileType(data.roomProfileType)} · ${
          typeof region === 'number' ? labelForRegionId(region) : (region ?? '-')
        }`
      : '아직 방이 없어요';

  return {
    id,
    name,
    initial: name.charAt(0),
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
    livingRows: [
      { label: '예산 보증금', value: `${numberValue(data.maxDeposit)}만원 이하` },
      {
        label: '예산 월세',
        value: `${numberValue(data.maxMounthRent ?? data.seekerProfile?.maxMonthlyRent)}만원 이하`,
      },
      { label: '입주 희망 시기', value: formatDateLabel(data.comeableAt) },
      { label: '희망 룸 형태', value: labelForRoomProfileType(data.roomProfileType) },
      {
        label: '희망 지역',
        value: typeof region === 'number' ? labelForRegionId(region) : (region ?? '-'),
      },
    ],
    preferenceRows: (data.preferences ?? []).map((preference, index) => ({
      key: stringValue(preference.preferencesId, `preference-${index}`),
      label: preference.name ?? '-',
      value: preference.value ?? '-',
    })),
    conditionText: definedLabels((data.conditions ?? []).map((condition) => condition.name)).join(
      ' · ',
    ),
    compatibility: {
      score: numberValue(data.compatibility?.score),
      items: (data.compatibility?.lifeStyleInfo ?? []).map((info, index) => {
        const percent = numberValue(info.percent);
        return {
          key: `${info.title ?? 'compat'}-${index}`,
          title: info.title ?? '-',
          percent,
          label: stringValue(info.percent, '0'),
        };
      }),
    },
  };
}

function hasAuthentication(value: unknown, expected: 'STUDENT' | 'COMPANY'): boolean {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}
