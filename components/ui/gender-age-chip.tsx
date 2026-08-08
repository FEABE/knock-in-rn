import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { Gender } from '@/lib/onboarding';

/**
 * Figma `chip2/Default` 성별 토큰.
 * 남성 bg #E7F4FE / 전경 #0B78CB, 여성 bg #FDEFEC / 전경 #DE3412.
 */
const GENDER_TOKENS = {
  male: {
    icon: 'male',
    label: '남성',
    iconColor: '#0B78CB',
    container: 'bg-[#E7F4FE]',
    foreground: 'text-[#0B78CB]',
    dot: 'bg-[#0B78CB]',
  },
  female: {
    icon: 'female',
    label: '여성',
    iconColor: '#DE3412',
    container: 'bg-[#FDEFEC]',
    foreground: 'text-[#DE3412]',
    dot: 'bg-[#DE3412]',
  },
} as const;

export type GenderAgeChipProps = {
  age?: number;
  gender: Gender;
};

/**
 * 나이·성별 칩. (Figma `chip2/Default`: h 22, padding 2/5, radius 4, gap 4)
 * 라벨은 "{age}세 · {남성|여성}" 형태이고, 가운데 구분점은 2×2 View로 그린다.
 * 성별이 'other'면 표시할 값이 없으므로 null을 반환한다.
 */
export function GenderAgeChip({ age, gender }: GenderAgeChipProps) {
  const tokens = gender === 'male' || gender === 'female' ? GENDER_TOKENS[gender] : null;
  if (!tokens) return null;

  const showAge = typeof age === 'number' && age > 0;

  return (
    <View
      className={`h-[22px] flex-row items-center justify-center gap-1 rounded px-[5px] py-[2px] ${tokens.container}`}
    >
      <Ionicons name={tokens.icon} size={12} color={tokens.iconColor} />
      {showAge ? (
        <>
          <Text className={`text-[12px] font-semibold leading-[18px] ${tokens.foreground}`}>
            {age}세
          </Text>
          <View className={`h-0.5 w-0.5 rounded-full ${tokens.dot}`} />
        </>
      ) : null}
      <Text className={`text-[12px] font-semibold leading-[18px] ${tokens.foreground}`}>
        {tokens.label}
      </Text>
    </View>
  );
}
