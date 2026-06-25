import { Pressable, Text, View } from 'react-native';

import type { RoommateMatchCardModel } from '@/lib/api';

export type RoommateFindCardProps = {
  match: RoommateMatchCardModel;
  onPress?: (match: RoommateMatchCardModel) => void;
  onLikeChange?: (match: RoommateMatchCardModel, liked: boolean) => void;
};

/**
 * 와이어프레임 "탐색_룸메이트 찾기" 리스트 카드.
 */
export function RoommateFindCard({ match, onPress, onLikeChange }: RoommateFindCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(match)}
      className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
      accessibilityRole="button"
    >
      {/* 헤더 */}
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-base font-semibold text-neutral-500">{match.name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-neutral-900">{match.name}</Text>
            <View className="rounded bg-emerald-50 px-1.5 py-0.5">
              <Text className="text-[10px] text-emerald-700">
                {match.hasRoom ? '방 있음' : '방 없음'}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => onLikeChange?.(match, !match.liked)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-neutral-50"
        >
          <Text className={match.liked ? 'text-base text-red-500' : 'text-base text-neutral-400'}>
            {match.liked ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      {/* 정보 행 */}
      <View className="gap-1.5">
        <InfoRow label="보증금 / 월세" value={match.depositRentLabel} />
        <InfoRow label="입주 가능" value={match.moveInLabel} />
        <InfoRow label="방 형태" value={match.roomTypeLabel} />
        <InfoRow label="위치" value={match.regionLabel} />
      </View>

      {/* 생활패턴 칩 */}
      {match.lifestyleChips.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {match.lifestyleChips.map((c, i) => (
            <View key={i} className="rounded bg-[#256EF4]/10 px-2 py-1">
              <Text className="text-[11px] text-[#256EF4]">{c}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 선호조건 칩 (outline) */}
      {match.conditionChips.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {match.conditionChips.map((c, i) => (
            <View key={i} className="rounded-full border border-neutral-200 px-2.5 py-1">
              <Text className="text-[11px] text-neutral-500">{c}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 궁합 점수 바 */}
      <View className="flex-row items-center gap-2 border-t border-neutral-100 pt-3">
        <Text className="text-xs text-neutral-500">궁합</Text>
        <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <View
            style={{ width: `${Math.min(100, match.compatibilityScore)}%` }}
            className="h-full rounded-full bg-[#256EF4]"
          />
        </View>
        <Text className="text-sm font-bold text-[#256EF4]">{match.compatibilityScore}점</Text>
      </View>
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-800">{value}</Text>
    </View>
  );
}
