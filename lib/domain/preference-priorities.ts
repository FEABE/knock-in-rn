export const EMBEDDED_PREFERENCE_PRIORITIES = [
  {
    value: 'sleep',
    label: '취침시간',
    description: '비슷한 수면 패턴',
    aliases: ['취침', '수면', '기상'],
  },
  {
    value: 'cleanliness',
    label: '청결',
    description: '청결 기준이 비슷한 분',
    aliases: ['청결', '청소', '깔끔'],
  },
  {
    value: 'noise',
    label: '소음',
    description: '소음 민감도가 비슷한 분',
    aliases: ['소음', '조용'],
  },
  {
    value: 'smoking',
    label: '흡연',
    description: '흡연 / 비흡연 여부',
    aliases: ['흡연', '비흡연'],
  },
  {
    value: 'pet',
    label: '반려동물',
    description: '반려동물 유무',
    aliases: ['반려동물', '반려', '애완'],
  },
  {
    value: 'visitors',
    label: '방문객 빈도',
    description: '손님 초청 빈도',
    aliases: ['방문객', '방문'],
  },
  {
    value: 'personality',
    label: '성격 스타일',
    description: '내향적 / 외향적',
    aliases: ['성격', 'MBTI', '성향'],
  },
  {
    value: 'personal-space',
    label: '개인 공간',
    description: '개인 공간 중요도',
    aliases: ['개인공간', '개인 공간', '프라이버시'],
  },
] as const;

export type EmbeddedPreferencePriorityId = (typeof EMBEDDED_PREFERENCE_PRIORITIES)[number]['value'];

export function embeddedPriorityIdFromLabel(
  label: string | null | undefined,
): EmbeddedPreferencePriorityId | undefined {
  if (!label) return undefined;
  const normalized = label.replace(/\s+/g, '').toLowerCase();

  return EMBEDDED_PREFERENCE_PRIORITIES.find((option) =>
    option.aliases.some((alias) => normalized.includes(alias.replace(/\s+/g, '').toLowerCase())),
  )?.value;
}
