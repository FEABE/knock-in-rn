import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { ICON_GLYPH_STYLE } from '@/components/ui/icon-glyph-style';
import { ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';

import type { UseRoomCardReturn } from './use-room-card';

const BRAND = '#256EF4';

/** 리스트 셀이 마운트될 때마다 새로 만들지 않도록 모듈 상수로 공유한다. */
const THUMBNAIL_STYLE = { width: '100%', height: 165 } as const;
const AUTHOR_AVATAR_STYLE = { width: 24, height: 24, borderRadius: 12 } as const;
/** 사진 없는 게시글의 기본 이미지 — Figma 시안의 128x125 크기 그대로. */
const ROOM_PLACEHOLDER_SOURCE = require('../../../assets/images/figma-ready/room-list-default.png');
const ROOM_PLACEHOLDER_STYLE = { width: 128, height: 125 } as const;

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
  authorMetaTone,
  badge,
  timeAgoLabel,
}: RoomCardViewProps) {
  return (
    <Pressable onPress={onPress} className="bg-white active:opacity-90" accessibilityRole="button">
      <View className="relative h-[165px] overflow-hidden rounded-[5px]">
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
        <View className="absolute inset-0 bg-[#17171B]/20" pointerEvents="none" />

        <View className="absolute left-2.5 top-2.5 flex-row gap-1">
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
            size={20}
            color={liked ? BRAND : 'white'}
            style={ICON_GLYPH_STYLE}
          />
        </Pressable>
      </View>

      <View className="gap-4 pt-3">
        <View className="gap-0.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[16px] font-semibold leading-6 text-[#17171B]"
            >
              {post.title}
            </Text>
            <Text className="text-[13px] leading-5 text-[#AAAABA]">{timeAgoLabel}</Text>
          </View>
          <Text className="text-[14px] font-medium leading-[21px] text-[#696976]">
            {regionLabel}
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <ReadyProfileAvatar
              name={post.author.name}
              imageUrl={post.author.avatarUrl}
              size={AUTHOR_AVATAR_STYLE.width}
            />
            <Text numberOfLines={1} className="shrink text-[13px] leading-5 text-[#AAAABA]">
              {post.author.name}
            </Text>
            {authorMetaLabel ? (
              <AuthorMetaPill label={authorMetaLabel} tone={authorMetaTone} />
            ) : null}
          </View>
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-[16px] leading-6 text-[#696976]">월세</Text>
            <Text className="text-[18px] font-semibold leading-[27px] text-[#17171B]">
              {priceLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function AuthorMetaPill({ label, tone }: { label: string; tone: 'male' | 'female' | 'neutral' }) {
  const isMale = tone === 'male';
  const isFemale = tone === 'female';
  return (
    <View
      className={`h-[22px] justify-center rounded px-[5px] py-0.5 ${
        isMale ? 'bg-[#E7F4FE]' : isFemale ? 'bg-[#FDEFEC]' : 'bg-[#F6F6FA]'
      }`}
    >
      <Text
        className={`text-[12px] font-semibold leading-[18px] ${
          isMale ? 'text-[#0B78CB]' : isFemale ? 'text-[#DE3412]' : 'text-[#696976]'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * 썸네일이 없을 때의 기본 이미지 (Figma: 방사진_디폴트이미지).
 * 연회색 배경 위에 128x125 집 일러스트를 가운데 놓는다.
 * 카드/검색 결과 카드/방 상세가 같은 모양을 쓰도록 공유한다.
 */
export function RoomThumbnailPlaceholder({ height = 165 }: { height?: number } = {}) {
  return (
    <View style={{ height }} className="w-full items-center justify-center bg-[#F6F6FA]">
      <Image source={ROOM_PLACEHOLDER_SOURCE} style={ROOM_PLACEHOLDER_STYLE} contentFit="contain" />
    </View>
  );
}

export function HotBadgePill() {
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

export function RoomTypePill({ label }: { label: string }) {
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

const CHIP_TEXT_STYLE = ICON_GLYPH_STYLE;
