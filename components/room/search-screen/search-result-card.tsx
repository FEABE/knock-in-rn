import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { RoomThumbnailPlaceholder, useRoomCard, type UseRoomCardProps } from '@/components/domain';

const BRAND = '#256EF4';

/** 하트 글리프를 원형 배경 정중앙에 맞추기 위한 폰트 패딩 제거. */
const ICON_GLYPH_STYLE = { includeFontPadding: false, textAlignVertical: 'center' } as const;

export type SearchResultCardProps = UseRoomCardProps & {
  /** 제목에서 파란색으로 강조할 검색 키워드. */
  keyword: string;
};

/**
 * 검색 결과 카드 — RoomCard 의 headless 훅(useRoomCard)을 재사용하되,
 * 제목 속 매칭 키워드를 파란색으로 강조하는 검색 화면 전용 뷰. (디자인 3287:26610)
 */
export function SearchResultCard({ keyword, ...hookProps }: SearchResultCardProps) {
  const {
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
  } = useRoomCard(hookProps);
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
          <RoomThumbnailPlaceholder />
        )}

        <View className="absolute left-2.5 top-3 flex-row gap-1">
          {badge === 'hot' ? (
            <View className="rounded bg-rose-100 px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-rose-600">인기</Text>
            </View>
          ) : null}
          <View className="rounded bg-[#EEF4FF] px-2 py-1">
            <Text className="text-[11px] font-medium text-[#256EF4]">{roomTypeLabel}</Text>
          </View>
        </View>

        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="absolute right-2.5 top-2.5 h-9 w-9 items-center justify-center rounded-full bg-black/30"
          accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={25}
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
            {splitByKeyword(post.title, keyword).map((segment, index) => (
              <Text key={index} className={segment.match ? 'text-[#256EF4]' : undefined}>
                {segment.text}
              </Text>
            ))}
          </Text>
          <Text className="text-xs text-neutral-400">{timeAgoLabel}</Text>
        </View>
        <Text className="text-[13px] leading-[19px] text-[#696976]">{regionLabel}</Text>

        <View className="mt-2 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
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

type TitleSegment = { text: string; match: boolean };

/** 제목을 키워드 매칭 구간과 비매칭 구간으로 분할한다 (대소문자 무시). */
function splitByKeyword(title: string, keyword: string): TitleSegment[] {
  const trimmed = keyword.trim();
  if (!trimmed) return [{ text: title, match: false }];

  const lowerTitle = title.toLowerCase();
  const lowerKeyword = trimmed.toLowerCase();
  const segments: TitleSegment[] = [];
  let cursor = 0;

  while (cursor < title.length) {
    const index = lowerTitle.indexOf(lowerKeyword, cursor);
    if (index === -1) break;
    if (index > cursor) segments.push({ text: title.slice(cursor, index), match: false });
    segments.push({ text: title.slice(index, index + trimmed.length), match: true });
    cursor = index + trimmed.length;
  }
  if (cursor < title.length) segments.push({ text: title.slice(cursor), match: false });

  return segments.length > 0 ? segments : [{ text: title, match: false }];
}
