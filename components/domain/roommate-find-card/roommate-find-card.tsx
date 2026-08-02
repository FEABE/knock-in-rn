import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { PriorityArtwork } from '@/components/ui/ready-to-dev-assets';
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
      className="gap-3 rounded border border-[#E1E5F0] bg-white p-2 active:opacity-90"
      accessibilityRole="button"
    >
      <View className="flex-row items-start gap-2">
        {match.profileImageUrl ? (
          <Image
            source={{ uri: match.profileImageUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#DADAE8] bg-white">
            <Ionicons name="person" size={34} color="#DADAE8" />
          </View>
        )}
        <View className="flex-1 gap-1.5 pt-0.5">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-[#17171B]">{match.name}</Text>
            <Ionicons name="checkmark-circle" size={14} color="#24A96B" />
            <Ionicons name="bag-handle" size={13} color="#5B8EF6" />
          </View>
          <View className="flex-row gap-1">
            {match.age || match.genderLabel ? (
              <View className="rounded-sm bg-[#FFF1ED] px-1.5 py-0.5">
                <Text className="text-[10px] text-[#F15B4A]">
                  {[match.age ? `${match.age}세` : null, match.genderLabel]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            ) : null}
            <View className="rounded-sm bg-[#E9F0FE] px-1.5 py-0.5">
              <Text className="text-[10px] text-[#5B8EF6]">
                {match.hasRoom ? '방 있음' : '방 없음'}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => onLikeChange?.(match, !match.liked)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
          accessibilityLabel={match.liked ? '관심 해제' : '관심 등록'}
        >
          <Ionicons
            name={match.liked ? 'heart' : 'heart-outline'}
            size={24}
            color={match.liked ? '#256EF4' : '#AAAABA'}
          />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="h-1 flex-1 overflow-hidden rounded-full bg-[#E7E8F0]">
          <View
            style={{ width: `${Math.min(100, match.compatibilityScore)}%` }}
            className="h-full rounded-full bg-[#256EF4]"
          />
        </View>
        <Text className="text-xs font-bold text-[#1358D8]">{match.compatibilityScore}점</Text>
      </View>

      <View className="gap-1.5 px-1 py-0.5">
        <InfoRow label="예산" value={match.depositRentLabel.replace(/\s\/\s/g, '/')} />
        <InfoRow label="방 형태" value={match.roomTypeLabel} />
        <InfoRow label="위치" value={match.regionLabel} />
      </View>

      {match.lifestyleChips.length > 0 ? (
        <View className="flex-row gap-1 overflow-hidden">
          {match.lifestyleChips.slice(0, 3).map((chip) => (
            <View
              key={chip}
              className="max-w-[104px] flex-row items-center gap-1 rounded border border-[#E1E5F0] px-1.5 py-1"
            >
              <PriorityArtwork label={chip} size={16} />
              <Text numberOfLines={1} className="text-[10px] text-[#696976]">
                {chip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[10px] text-[#696976]">{label}</Text>
      <Text className="text-[11px] font-medium text-[#17171B]">{value}</Text>
    </View>
  );
}
