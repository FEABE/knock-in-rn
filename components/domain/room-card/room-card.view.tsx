import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { UseRoomCardReturn } from './use-room-card';

const BRAND = '#256EF4';

export type RoomCardViewProps = UseRoomCardReturn & {
  className?: string;
};

export function RoomCardView({
  post,
  liked,
  toggleLike,
  onPress,
  priceLabel,
  roomTypeLabel,
  regionLabel,
  badge,
  timeAgoLabel,
}: RoomCardViewProps) {
  const verified = post.author.badges.length > 0;

  return (
    <Pressable onPress={onPress} className="bg-white active:opacity-90" accessibilityRole="button">
      <View className="relative overflow-hidden rounded">
        {post.thumbnailUrl ? (
          <Image
            source={{ uri: post.thumbnailUrl }}
            style={{ width: '100%', height: 165 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-[165px] w-full items-center justify-center bg-neutral-100">
            <Ionicons name="image-outline" size={30} color="#AAAABA" />
          </View>
        )}

        <View className="absolute left-2.5 top-3 flex-row gap-1">
          {badge ? <BadgePill /> : null}
          <RoomTypePill label={roomTypeLabel} />
        </View>

        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="absolute right-2.5 top-2.5 h-9 w-9 items-center justify-center rounded-full bg-black/30"
          accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={25} color="white" />
        </Pressable>
      </View>

      <View className="gap-1 pt-3">
        <Text numberOfLines={1} className="text-[17px] font-bold leading-6 text-[#17171B]">
          {post.title}
        </Text>
        <Text className="text-[13px] leading-[19px] text-[#696976]">{regionLabel}</Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            {post.author.avatarUrl ? (
              <Image
                source={{ uri: post.author.avatarUrl }}
                style={{ width: 24, height: 24, borderRadius: 12 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                <Text className="text-[10px] text-neutral-500">{post.author.name.charAt(0)}</Text>
              </View>
            )}
            <Text className="text-xs text-neutral-600">{post.author.name}</Text>
            {verified ? <Ionicons name="checkmark-circle" size={16} color={BRAND} /> : null}
            <Text className="text-xs text-neutral-400">· {timeAgoLabel}</Text>
          </View>
          <Text className="text-sm font-semibold text-[#17171B]">{priceLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function BadgePill() {
  return (
    <View className="rounded bg-rose-100 px-2 py-0.5">
      <Text className="text-[11px] font-semibold text-rose-600">인기</Text>
    </View>
  );
}

function RoomTypePill({ label }: { label: string }) {
  return (
    <View className="rounded bg-[#EEF4FF] px-2 py-1">
      <Text className="text-[11px] font-medium text-[#256EF4]">{label}</Text>
    </View>
  );
}
