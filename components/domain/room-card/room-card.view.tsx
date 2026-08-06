import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { UseRoomCardReturn } from './use-room-card';

const BRAND = '#256EF4';

/** 리스트 셀이 마운트될 때마다 새로 만들지 않도록 모듈 상수로 공유한다. */
const THUMBNAIL_STYLE = { width: '100%', height: 165 } as const;
const AUTHOR_AVATAR_STYLE = { width: 24, height: 24, borderRadius: 12 } as const;

/**
 * 아이콘 폰트의 비대칭 세로 여백을 제거해 원형 배경 정중앙에 오도록 한다.
 * (Android 기본 includeFontPadding 때문에 글리프가 위로 치우쳐 보인다.)
 */
const ICON_GLYPH_STYLE = { includeFontPadding: false, textAlignVertical: 'center' } as const;

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
  authorMetaLabel,
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
            style={THUMBNAIL_STYLE}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <RoomThumbnailPlaceholder />
        )}

        <View className="absolute left-2.5 top-3 flex-row gap-1">
          {badge === 'hot' ? <HotBadgePill /> : null}
          <RoomTypePill label={roomTypeLabel} />
        </View>

        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className={`absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full ${
            liked ? 'bg-white/70' : 'bg-[#17171B]/50'
          }`}
          accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? BRAND : 'white'}
            style={ICON_GLYPH_STYLE}
          />
        </Pressable>
      </View>

      <View className="gap-1 pt-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="min-w-0 flex-1 text-[17px] font-bold leading-6 text-[#17171B]"
          >
            {post.title}
          </Text>
          <Text className="text-xs text-neutral-400">{timeAgoLabel}</Text>
        </View>
        <Text className="text-[13px] leading-[19px] text-[#696976]">{regionLabel}</Text>

        <View className="mt-2 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            {post.author.avatarUrl ? (
              <Image
                source={{ uri: post.author.avatarUrl }}
                style={AUTHOR_AVATAR_STYLE}
                contentFit="cover"
              />
            ) : (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                <Text className="text-[10px] text-neutral-500">{post.author.name.charAt(0)}</Text>
              </View>
            )}
            <Text numberOfLines={1} className="shrink text-xs text-neutral-600">
              {post.author.name}
            </Text>
            {verified ? <Ionicons name="checkmark-circle" size={16} color={BRAND} /> : null}
            {authorMetaLabel ? (
              <View className="rounded-sm bg-[#FFF1ED] px-1.5 py-0.5">
                <Text className="text-[10px] font-medium text-[#F15B4A]">{authorMetaLabel}</Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xs text-[#696976]">월세</Text>
            <Text className="text-base font-bold text-[#17171B]">{priceLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * 썸네일이 없을 때의 기본 이미지 — 디자인 기준 연회색 배경 + 집 아이콘 플레이스홀더.
 * 카드/검색 결과 카드가 같은 모양을 쓰도록 공유한다.
 */
export function RoomThumbnailPlaceholder({ height = 165 }: { height?: number } = {}) {
  return (
    <View style={{ height }} className="w-full items-center justify-center bg-[#F6F6FA]">
      <Ionicons name="home" size={44} color="#DADAE8" style={ICON_GLYPH_STYLE} />
    </View>
  );
}

function HotBadgePill() {
  return (
    <View
      className="h-[26px] items-center justify-center rounded bg-[#D63D4A] px-1.5"
      style={CHIP_SHADOW_STYLE}
    >
      <Text style={CHIP_TEXT_STYLE} className="text-[14px] font-semibold leading-[21px] text-white">
        HOT
      </Text>
    </View>
  );
}

function RoomTypePill({ label }: { label: string }) {
  return (
    <View
      className="h-[26px] items-center justify-center rounded bg-[#ECF2FE] px-1.5"
      style={CHIP_SHADOW_STYLE}
    >
      <Text
        style={CHIP_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#4C87F6]"
      >
        {label}
      </Text>
    </View>
  );
}

const CHIP_SHADOW_STYLE = {
  shadowColor: '#696976',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 2,
} as const;

const CHIP_TEXT_STYLE = { includeFontPadding: false, textAlignVertical: 'center' } as const;
