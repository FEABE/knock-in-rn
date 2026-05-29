import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { RoomCardBadge, UseRoomCardReturn } from './use-room-card';

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
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white active:opacity-90"
      accessibilityRole="button"
    >
      <View className="relative">
        {post.thumbnailUrl ? (
          <Image
            source={{ uri: post.thumbnailUrl }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-44 w-full items-center justify-center bg-neutral-100">
            <Text className="text-sm text-neutral-400">대표 썸네일</Text>
          </View>
        )}

        {badge ? (
          <View className="absolute left-3 top-3">
            <BadgePill kind={badge} />
          </View>
        ) : null}

        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/90 px-2.5 py-1"
        >
          <Text className={liked ? 'text-sm text-red-500' : 'text-sm text-neutral-400'}>
            {liked ? '♥' : '♡'}
          </Text>
          <Text className="text-xs text-neutral-600">관심</Text>
        </Pressable>
      </View>

      <View className="gap-1.5 p-4">
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-neutral-900"
        >
          {post.title}
        </Text>
        <Text className="text-sm text-neutral-700">{priceLabel}</Text>
        <Text className="text-xs text-neutral-500">{roomTypeLabel}</Text>
        <Text className="text-xs text-neutral-500">{regionLabel}</Text>

        <View className="mt-2 flex-row items-center justify-between border-t border-neutral-100 pt-3">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
              <Text className="text-[10px] text-neutral-500">
                {post.author.name.charAt(0)}
              </Text>
            </View>
            <Text className="text-xs text-neutral-600">{post.author.name}</Text>
            <Text className="text-xs text-neutral-400">· {timeAgoLabel}</Text>
          </View>
          <Text className="text-xs text-neutral-400">
            ⓘ {post.views.toLocaleString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function BadgePill({ kind }: { kind: NonNullable<RoomCardBadge> }) {
  if (kind === 'new') {
    return (
      <View className="rounded bg-violet-100 px-2 py-0.5">
        <Text className="text-[11px] font-semibold text-violet-700">NEW</Text>
      </View>
    );
  }
  return (
    <View className="rounded bg-rose-100 px-2 py-0.5">
      <Text className="text-[11px] font-semibold text-rose-600">인기</Text>
    </View>
  );
}
