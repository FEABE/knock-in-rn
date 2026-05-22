import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { UseRoomCardReturn } from './use-room-card';

export type RoomCardViewProps = UseRoomCardReturn & {
  className?: string;
};

export function RoomCardView({
  post,
  liked,
  toggleLike,
  onPress,
  priceLabel,
  metaLabel,
  className,
}: RoomCardViewProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        className ??
        'overflow-hidden rounded-2xl border border-neutral-200 bg-white active:opacity-90'
      }
      accessibilityRole="button"
    >
      <View className="relative">
        {post.thumbnailUrl ? (
          <Image
            source={{ uri: post.thumbnailUrl }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-40 w-full items-center justify-center bg-neutral-100">
            <Text className="text-3xl">🏠</Text>
          </View>
        )}
        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white/90"
        >
          <Text className={liked ? 'text-base text-red-500' : 'text-base'}>
            {liked ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <View className="gap-1 p-4">
        <View className="flex-row items-center gap-2">
          <Text className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
            {post.region.city} {post.region.district}
          </Text>
          <Text className="text-xs text-neutral-400">
            · {post.author.age}세 {genderLabel(post.author.gender)}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-neutral-900"
        >
          {post.title}
        </Text>
        <Text className="text-sm font-medium text-neutral-700">
          {priceLabel}
        </Text>
        <Text className="text-xs text-neutral-400">{metaLabel}</Text>
      </View>
    </Pressable>
  );
}

function genderLabel(g: string): string {
  if (g === 'female') return '여성';
  if (g === 'male') return '남성';
  return '기타';
}
