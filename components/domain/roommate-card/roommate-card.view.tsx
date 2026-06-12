import { Pressable, Text, View } from 'react-native';

import type { UseRoommateCardReturn } from './use-roommate-card';

export type RoommateCardViewProps = UseRoommateCardReturn & {
  className?: string;
};

export function RoommateCardView({
  card,
  liked,
  toggleLike,
  onPress,
  budgetLabel,
  scoreLabel,
  className,
}: RoommateCardViewProps) {
  const { user } = card;

  return (
    <Pressable
      onPress={onPress}
      className={
        className ??
        'gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90'
      }
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-base font-semibold text-neutral-600">
            {user.name.charAt(0)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-neutral-900">
              {user.name}
            </Text>
            <Text className="text-xs text-neutral-400">
              {user.age}세 · {genderLabel(user.gender)}
            </Text>
            {user.badges.length > 0 ? (
              <Text className="rounded-full bg-[#256EF4]/10 px-2 py-0.5 text-[10px] text-[#256EF4]">
                인증 {user.badges.length}
              </Text>
            ) : null}
          </View>
          <Text className="text-xs text-neutral-500">
            {user.region.city} {user.region.district}
          </Text>
        </View>
        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-neutral-50"
        >
          <Text className={liked ? 'text-base text-red-500' : 'text-base'}>
            {liked ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      <Text numberOfLines={2} className="text-sm text-neutral-700">
        {user.bio}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {scoreLabel ? (
          <Text className="rounded-full bg-[#256EF4] px-3 py-1 text-xs font-medium text-white">
            {scoreLabel}
          </Text>
        ) : null}
        {budgetLabel ? (
          <Text className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
            {budgetLabel}
          </Text>
        ) : null}
        {card.moveInBy ? (
          <Text className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
            {card.moveInBy.getFullYear()}.
            {String(card.moveInBy.getMonth() + 1).padStart(2, '0')}
            입주 희망
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function genderLabel(g: string): string {
  if (g === 'female') return '여성';
  if (g === 'male') return '남성';
  return '기타';
}
