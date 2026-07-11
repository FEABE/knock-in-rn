import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { RoomCardBadge, UseRoomCardReturn } from './use-room-card';

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
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-md border border-[#D9DAE5] bg-white active:opacity-90"
      accessibilityRole="button"
    >
      <View className="relative">
        {post.thumbnailUrl ? (
          <Image
            source={{ uri: post.thumbnailUrl }}
            style={{ width: '100%', height: 130 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-[130px] w-full items-center justify-center bg-neutral-100">
            <Ionicons name="image-outline" size={30} color="#AAAABA" />
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
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center"
          accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={25} color="white" />
        </Pressable>
      </View>

      <View className="gap-1.5 p-3">
        <Text numberOfLines={1} className="text-base font-bold text-[#17171B]">
          {post.title}
        </Text>
        <Text className="text-sm text-[#17171B]">{priceLabel}</Text>
        <Text className="text-xs text-[#696976]">
          {regionLabel} · {roomTypeLabel}
        </Text>

        <View className="mt-2 flex-row items-center justify-between pt-2">
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
            {verified ? (
              <View
                className="h-4 w-4 items-center justify-center rounded-full"
                style={{ backgroundColor: BRAND }}
              >
                <Text className="text-[9px] font-bold text-white">✓</Text>
              </View>
            ) : null}
            <Text className="text-xs text-neutral-400">· {timeAgoLabel}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="eye-outline" size={16} color="#AAAABA" />
            <Text className="text-xs text-[#AAAABA]">{post.views.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function BadgePill({ kind }: { kind: NonNullable<RoomCardBadge> }) {
  if (kind === 'new') {
    return (
      <View className="rounded px-2 py-0.5" style={{ backgroundColor: `${BRAND}1A` }}>
        <Text className="text-[11px] font-semibold" style={{ color: BRAND }}>
          NEW
        </Text>
      </View>
    );
  }
  return (
    <View className="rounded bg-rose-100 px-2 py-0.5">
      <Text className="text-[11px] font-semibold text-rose-600">인기</Text>
    </View>
  );
}
