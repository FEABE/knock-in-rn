import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomThumbnailPlaceholder } from '@/components/domain';
import { PriorityArtwork, RoomOptionArtwork } from '@/components/ui/ready-to-dev-assets';
import {
  ReadyActionRow,
  ReadyActionSheet,
  ReadyBadge,
  ReadyDivider,
  ReadyMetadataTile,
  ReadyMoreButton,
  ReadyProfileAvatar,
  ReadyScreenHeader,
  ReadySection,
} from '@/components/ui/ready-to-dev-components';
import { ReadyConfirmDialog, ReadyToast } from '@/components/ui/ready-to-dev-feedback';
import { formatKstDateLabel, useRoomAddOptionOptions } from '@/lib/api';
import type { ImportantCondition, RoomOption, RoomPost, UserSummary } from '@/lib/domain';

import type { LifestyleTile, UseRoomDetailScreenReturn } from './use-room-detail-screen';

const ROOM_TYPE_LABEL: Record<string, string> = {
  'one-room': '원룸',
  'two-room': '투룸',
  'three-room+': '쓰리룸+',
  officetel: '오피스텔',
  'share-house': '쉐어하우스',
  apt: '아파트',
  villa: '빌라',
};

const SMOKING_LABEL: Record<string, string> = {
  no: '비흡연',
  outdoor: '실외만',
  yes: '흡연',
};

const GENDER_LABEL: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
};

const PREFERRED_GENDER_LABEL: Record<string, string> = {
  same: '동일 성별만',
  any: '성별 무관',
};

const DETAIL_BADGE_SHADOW_STYLE = {
  shadowColor: '#696976',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 2,
} as const;

const DETAIL_BADGE_TEXT_STYLE = {
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;

export type RoomDetailScreenViewProps = UseRoomDetailScreenReturn;

type RoomDetailTab =
  | 'compatibility'
  | 'condition'
  | 'moveIn'
  | 'description'
  | 'lifestyle'
  | 'options'
  | 'location'
  | 'author';

export function RoomDetailScreenView(props: RoomDetailScreenViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<RoomDetailTab, number>>>({});
  const [activeTab, setActiveTab] = useState<RoomDetailTab>('compatibility');
  const tabs = useMemo(
    () =>
      ROOM_DETAIL_TABS.filter((tab) => {
        if (tab.key === 'compatibility') return !props.isOwner;
        if (tab.key === 'moveIn') return Boolean(props.post?.moveInDate);
        if (tab.key === 'options') return Boolean(props.post?.options?.length);
        return true;
      }),
    [props.isOwner, props.post?.moveInDate, props.post?.options?.length],
  );

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTab) && tabs[0]) {
      setActiveTab(tabs[0].key);
    }
  }, [activeTab, tabs]);

  const moveToSection = (tab: RoomDetailTab) => {
    const y = sectionOffsets.current[tab];
    if (y === undefined) return;
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 44), animated: true });
  };

  if (props.loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <Header title="게시글 상세" onBack={props.onBack} onMenu={() => props.setMenuOpen(true)} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">게시글을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (props.error || !props.post) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <Header title="게시글 상세" onBack={props.onBack} onMenu={() => props.setMenuOpen(true)} />
        <View className="flex-1 items-center justify-center gap-3 p-10">
          <Text className="text-base text-neutral-500">
            {props.error ?? '게시글을 찾을 수 없어요'}
          </Text>
          <Pressable onPress={props.onBack} className="rounded-full bg-neutral-100 px-5 py-3">
            <Text className="text-sm text-neutral-700">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (props.blocked) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <Header title="게시글 상세" onBack={props.onBack} onMenu={() => props.setMenuOpen(true)} />
        <View className="flex-1 items-center justify-center gap-3 p-10">
          <Text className="text-base text-neutral-500">차단한 게시글이에요</Text>
          <Pressable onPress={props.onBack} className="rounded-full bg-neutral-100 px-5 py-3">
            <Text className="text-sm text-neutral-700">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header
        title={props.post.title}
        onBack={props.onBack}
        onMenu={() => props.setMenuOpen(true)}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName={props.isOwner ? 'pb-6' : 'pb-28'}
        stickyHeaderIndices={[2]}
      >
        <PhotoCarousel
          photos={props.photos}
          index={props.photoIndex}
          onIndexChange={props.setPhotoIndex}
          roomTypeLabel={ROOM_TYPE_LABEL[props.post.roomType] ?? props.post.roomType}
          showNew={isRecent(props.post.createdAt)}
        />

        <TitleBlock post={props.post} />
        <RoomDetailTabs tabs={tabs} active={activeTab} onPress={moveToSection} />
        {!props.isOwner ? (
          <View
            onLayout={(event) => {
              sectionOffsets.current.compatibility = event.nativeEvent.layout.y;
            }}
          >
            <CompatibilityBlock post={props.post} isLoggedIn={props.isLoggedIn} />
          </View>
        ) : null}
        <ReadyDivider />
        <View
          onLayout={(event) => {
            sectionOffsets.current.condition = event.nativeEvent.layout.y;
          }}
        >
          <PreferredRoommateBlock post={props.post} />
        </View>
        {props.post.moveInDate ? (
          <>
            <ReadyDivider />
            <View
              onLayout={(event) => {
                sectionOffsets.current.moveIn = event.nativeEvent.layout.y;
              }}
            >
              <BasicInfoBlock post={props.post} />
            </View>
          </>
        ) : null}
        <ReadyDivider />
        <View
          onLayout={(event) => {
            sectionOffsets.current.description = event.nativeEvent.layout.y;
          }}
        >
          <DescriptionBlock
            description={props.post.description}
            expanded={props.descExpanded}
            onToggle={props.toggleDescription}
          />
        </View>
        <ReadyDivider />
        <View
          onLayout={(event) => {
            sectionOffsets.current.lifestyle = event.nativeEvent.layout.y;
          }}
        >
          <LifestyleBlock
            author={props.post.author}
            items={props.lifestyleItems}
            expanded={props.lifestyleExpanded}
            onToggle={props.toggleLifestyle}
          />
        </View>
        {props.post.options && props.post.options.length > 0 ? (
          <>
            <ReadyDivider />
            <View
              onLayout={(event) => {
                sectionOffsets.current.options = event.nativeEvent.layout.y;
              }}
            >
              <OptionsBlock options={props.post.options} />
            </View>
          </>
        ) : null}
        <ReadyDivider />
        <View
          onLayout={(event) => {
            sectionOffsets.current.location = event.nativeEvent.layout.y;
          }}
        >
          <LocationBlock post={props.post} />
        </View>
        <ReadyDivider />
        <View
          onLayout={(event) => {
            sectionOffsets.current.author = event.nativeEvent.layout.y;
          }}
        >
          <AuthorBlock author={props.post.author} onPress={props.onAuthorPress} />
        </View>
      </ScrollView>

      {!props.isOwner ? (
        <BottomBar
          liked={props.liked}
          onLike={props.onLike}
          onChat={props.onChat}
          creatingChat={props.creatingChat}
          bottomPadding={props.bottomPadding}
        />
      ) : null}

      <ReadyActionSheet open={props.menuOpen} onOpenChange={props.setMenuOpen}>
        <View>
          {props.isOwner ? (
            <>
              <ReadyActionRow
                icon="create-outline"
                label="게시글 수정"
                divider
                onPress={props.onEdit}
              />
              <ReadyActionRow
                icon="trash-outline"
                label="게시글 삭제"
                tone="danger"
                onPress={props.onDelete}
              />
            </>
          ) : (
            <ReadyActionRow
              icon="warning-outline"
              label="게시글 신고하기"
              tone="danger"
              onPress={props.onReport}
            />
          )}
        </View>
      </ReadyActionSheet>

      <ReadyConfirmDialog
        open={props.deleteDialogOpen}
        title="게시글을 삭제하시겠어요?"
        description="게시글 삭제 후에는 복구가 불가해요"
        cancelLabel="취소"
        confirmLabel="삭제"
        processing={props.deleting}
        onCancel={props.onCancelDelete}
        onConfirm={props.onConfirmDelete}
      />
      <ReadyToast
        visible={props.deleteToastVisible}
        message="게시글이 삭제되었어요"
        tone="success"
      />
    </SafeAreaView>
  );
}

const ROOM_DETAIL_TABS: { key: RoomDetailTab; label: string }[] = [
  { key: 'compatibility', label: '궁합 점수' },
  { key: 'condition', label: '룸메이트 조건' },
  { key: 'moveIn', label: '입주 가능일' },
  { key: 'description', label: '소개' },
  { key: 'lifestyle', label: '생활 패턴' },
];

function RoomDetailTabs({
  tabs,
  active,
  onPress,
}: {
  tabs: typeof ROOM_DETAIL_TABS;
  active: RoomDetailTab;
  onPress: (tab: RoomDetailTab) => void;
}) {
  const { width } = useWindowDimensions();
  const tabWidth = width / 3;

  return (
    <View className="border-b border-[#ECECF3] bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: tabWidth * tabs.length }}
      >
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`h-11 items-center justify-center border-b-2 px-3 ${
                selected ? 'border-[#256EF4]' : 'border-transparent'
              }`}
              style={{ width: tabWidth }}
            >
              <Text
                className={
                  selected
                    ? 'text-[16px] font-semibold leading-6 text-[#17171B]'
                    : 'text-[16px] font-medium leading-6 text-[#AAAABA]'
                }
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Header({
  title,
  onBack,
  onMenu,
}: {
  title: string;
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <ReadyScreenHeader
      title={title}
      onBack={onBack}
      actions={[{ icon: 'ellipsis-horizontal', label: '게시글 메뉴', onPress: onMenu }]}
    />
  );
}

function PhotoCarousel({
  photos,
  index,
  onIndexChange,
  roomTypeLabel,
  showNew,
}: {
  photos: string[];
  index: number;
  onIndexChange: (next: number) => void;
  roomTypeLabel: string;
  showNew: boolean;
}) {
  const { width } = useWindowDimensions();
  const photoHeight = 180;

  return (
    <View className="relative">
      {photos.length === 0 ? (
        <RoomThumbnailPlaceholder height={photoHeight} />
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const width = event.nativeEvent.layoutMeasurement.width;
            onIndexChange(Math.round(event.nativeEvent.contentOffset.x / width));
          }}
        >
          {photos.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              source={{ uri: url }}
              style={{ width, height: photoHeight }}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}
      <View className="absolute left-4 top-4 flex-row gap-2">
        {showNew ? <DetailNewPill /> : null}
        <DetailRoomTypePill label={roomTypeLabel} />
      </View>
      {photos.length > 1 ? (
        <View className="absolute inset-x-0 bottom-3 flex-row justify-center gap-1.5">
          {photos.map((url, photoIndex) => (
            <View
              key={`${url}-dot-${photoIndex}`}
              className={`h-1.5 rounded-full ${photoIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TitleBlock({ post }: { post: RoomPost }) {
  return (
    <View className="gap-2 px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="min-w-0 flex-1 text-[14px] font-semibold leading-[21px] text-[#17171B]">
          {post.title}
        </Text>
        <Text className="text-[12px] font-medium leading-[18px] text-[#AAAABA]">
          {timeAgo(post.createdAt)}
        </Text>
      </View>
      <Text className="text-[12px] font-medium leading-[18px] text-[#696976]">
        {post.region.city} {post.region.district}
      </Text>
      <View className="mt-1 flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <ReadyProfileAvatar name={post.author.name} imageUrl={post.author.avatarUrl} size={20} />
          <Text numberOfLines={1} className="shrink text-[12px] font-medium text-[#696976]">
            {post.author.name}
          </Text>
          <AuthorMetaPill author={post.author} />
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-[12px] font-medium leading-[18px] text-[#696976]">월세</Text>
          <Text className="text-[16px] font-bold leading-6 text-[#17171B]">
            {post.deposit.toLocaleString()}/{post.monthlyRent.toLocaleString()}/
            {post.maintenanceFee ?? 0}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AuthorMetaPill({ author }: { author: UserSummary }) {
  const genderLabel = GENDER_LABEL[author.gender] ?? '기타';
  const symbol = author.gender === 'female' ? '♀' : author.gender === 'male' ? '♂' : '';
  return (
    <View className="h-[24px] flex-row items-center justify-center rounded bg-[#FDEFEC] px-1.5">
      <Text className="text-[12px] font-semibold leading-[18px] text-[#DE3412]">
        {symbol ? `${symbol} ` : ''}
        {author.age}세 · {genderLabel}
      </Text>
    </View>
  );
}

function DetailNewPill() {
  return (
    <View
      className="h-[26px] items-center justify-center rounded bg-[#4C87F6] px-1.5"
      style={DETAIL_BADGE_SHADOW_STYLE}
    >
      <Text
        style={DETAIL_BADGE_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-white"
      >
        NEW
      </Text>
    </View>
  );
}

function DetailRoomTypePill({ label }: { label: string }) {
  return (
    <View
      className="h-[26px] items-center justify-center rounded bg-[#ECF2FE] px-1.5"
      style={DETAIL_BADGE_SHADOW_STYLE}
    >
      <Text
        style={DETAIL_BADGE_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#4C87F6]"
      >
        {label}
      </Text>
    </View>
  );
}

function BasicInfoBlock({ post }: { post: RoomPost }) {
  if (!post.moveInDate) return null;
  return (
    <ReadySection title="입주 가능일">
      <View className="h-[49px] flex-row items-center justify-between rounded-lg border border-[#DADAE8] px-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={22} color="#17171B" />
          <Text className="text-[14px] leading-[21px] text-[#17171B]">
            {fmtDate(post.moveInDate)}
          </Text>
        </View>
        <View className="h-[26px] items-center justify-center rounded bg-[#ECF2FE] px-2">
          <Text className="text-[13px] font-medium leading-[19px] text-[#4C87F6]">협의 불가능</Text>
        </View>
      </View>
    </ReadySection>
  );
}

function LifestyleBlock({
  author,
  items,
  expanded,
  onToggle,
}: {
  author: UserSummary;
  items: LifestyleTile[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const lifestyle = author.lifestyle ?? {};
  // 서버 원본 생활 패턴(8종)이 있으면 그대로 쓰고, 없으면 매핑된 기본 4종으로 대체한다.
  const tiles: LifestyleTile[] = items.length
    ? items
    : [
        {
          label: '취침 시간',
          value: sleepRangeLabel(lifestyle.sleepTime, lifestyle.wakeTime),
        },
        { label: '청결 민감도', value: levelLabel(lifestyle.cleanliness) },
        { label: '소음 민감도', value: levelLabel(lifestyle.noise) },
        {
          label: '흡연 여부',
          value: lifestyle.smoking
            ? (SMOKING_LABEL[lifestyle.smoking] ?? lifestyle.smoking)
            : '미입력',
        },
      ];
  const visible = expanded ? tiles : tiles.slice(0, 4);

  return (
    <ReadySection title="생활 패턴">
      <View className="flex-row flex-wrap gap-3">
        {visible.map((tile, index) => (
          <ReadyMetadataTile key={`${tile.label}-${index}`} label={tile.label} value={tile.value} />
        ))}
      </View>
      {tiles.length > 4 ? <ReadyMoreButton expanded={expanded} onPress={onToggle} /> : null}
    </ReadySection>
  );
}

/**
 * 방 옵션은 서버 DB(/meta/room-add-options) 정의를 따른다.
 * 게시글 응답에 name이 없으면(id만 온 경우) 메타에서 이름과 이모지를 채운다.
 */
function OptionsBlock({ options }: { options: RoomOption[] }) {
  const { options: meta } = useRoomAddOptionOptions();
  const metaById = useMemo(() => new Map(meta.map((option) => [option.value, option])), [meta]);

  return (
    <ReadySection title="옵션">
      <View className="flex-row flex-wrap justify-around gap-2 py-2">
        {options.map((option) => {
          const fromMeta = metaById.get(option.id);
          const label = option.name || fromMeta?.label || `옵션 #${option.id}`;
          return (
            <View key={option.id} className="min-w-[72px] flex-1 items-center gap-2">
              <RoomOptionArtwork label={label} image={fromMeta?.image} size={40} />
              <Text className="text-center text-[14px] font-medium leading-[21px] text-[#17171B]">
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </ReadySection>
  );
}

function PreferredRoommateBlock({ post }: { post: RoomPost }) {
  const { author } = post;
  const smoking = author.lifestyle?.smoking;
  const preferred = post.preferredRoommate;
  const priorityItems = (
    preferred?.importantConditions.length
      ? preferred.importantConditions
      : author.importantConditions
  ).slice(0, 3);
  const conditionChips = preferred?.conditions.length
    ? preferred.conditions.map((condition) => ({
        label: condition.name,
        image: condition.image,
      }))
    : [
        {
          label: preferred?.smokingLabel ?? (smoking === 'no' ? '비흡연자' : '흡연 여부 무관'),
          image: preferred?.smokingImage ?? null,
        },
      ];

  return (
    <ReadySection title="선호 룸메이트 조건">
      <View className="flex-row flex-wrap gap-2">
        {conditionChips.map((condition) => (
          <PreferredConditionChip
            key={condition.label}
            label={condition.label}
            image={condition.image}
          />
        ))}
      </View>

      {priorityItems.length ? (
        <View className="mt-3 gap-3">
          <Text className="text-[15px] font-semibold leading-6 text-[#256EF4]">우선순위</Text>
          <View className="flex-row flex-wrap gap-2">
            {priorityItems.map((condition) => (
              <PriorityConditionChip key={conditionName(condition)} condition={condition} />
            ))}
          </View>
        </View>
      ) : null}
    </ReadySection>
  );
}

function PreferredConditionChip({ label, image }: { label: string; image?: string | null }) {
  return (
    <View className="h-[34px] flex-row items-center justify-center gap-1.5 rounded-lg border border-[#DADAE8] bg-white px-3">
      <PriorityArtwork label={label} image={image} size={18} />
      <Text
        style={DETAIL_CHIP_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#696976]"
      >
        {label}
      </Text>
    </View>
  );
}

function PriorityConditionChip({ condition }: { condition: string | ImportantCondition }) {
  const label = conditionName(condition);
  const image = conditionImage(condition);
  return (
    <View className="h-[36px] flex-row items-center justify-center gap-1.5 rounded-lg bg-[#ECF2FE] px-3">
      <PriorityArtwork label={label} image={image} size={18} />
      <Text
        style={DETAIL_CHIP_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#17171B]"
      >
        {label}
      </Text>
    </View>
  );
}

function conditionName(condition: string | ImportantCondition): string {
  return typeof condition === 'string' ? condition : condition.name;
}

function conditionImage(condition: string | ImportantCondition): string | null | undefined {
  return typeof condition === 'string' ? undefined : condition.image;
}

const DETAIL_CHIP_TEXT_STYLE = {
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;

function DescriptionBlock({
  description,
  expanded,
  onToggle,
}: {
  description: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [hasOverflow, setHasOverflow] = useState<boolean | null>(null);

  useEffect(() => {
    setHasOverflow(null);
  }, [description]);

  return (
    <ReadySection title="소개">
      <Text
        numberOfLines={!expanded && hasOverflow === true ? 3 : undefined}
        onTextLayout={(event) => {
          if (hasOverflow === null) {
            setHasOverflow(event.nativeEvent.lines.length > 3);
          }
        }}
        className="text-sm leading-6 text-neutral-700"
      >
        {description}
      </Text>
      {hasOverflow === true ? <ReadyMoreButton expanded={expanded} onPress={onToggle} /> : null}
    </ReadySection>
  );
}

const RING_SIZE = 120;
const RING_STROKE = 8;
const RING_SEGMENTS = 120;
const RING_SEGMENT_WIDTH = 7;

function CompatibilityBlock({ post, isLoggedIn }: { post: RoomPost; isLoggedIn: boolean }) {
  const total = post.compatibilityScore;
  const hasScore = isLoggedIn && typeof total === 'number';
  const normalizedScore = hasScore ? Math.max(0, Math.min(100, total)) : 0;
  const scoreColor = hasScore ? '#256EF4' : '#9CA3AF';

  return (
    <ReadySection
      title="궁합 점수"
      accessory={
        <View className="flex-row items-center gap-1">
          <Text className="text-[13px] font-medium leading-[19px] text-[#AAAABA]">
            프로필 완성 후 실제 점수 반영
          </Text>
          <Ionicons name="information-circle" size={18} color="#DADAE8" />
        </View>
      }
    >
      <View className="items-center py-4">
        <View
          className="items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <CompatibilityRing progress={normalizedScore} active={hasScore} />
          <Text className="text-[36px] font-bold leading-[44px]" style={{ color: scoreColor }}>
            {hasScore ? Math.round(total) : isLoggedIn ? '--' : '??'}
            <Text className="text-[13px] font-semibold">점</Text>
          </Text>
        </View>
      </View>
    </ReadySection>
  );
}

function CompatibilityRing({ progress, active }: { progress: number; active: boolean }) {
  const normalized = Math.max(0, Math.min(100, progress));
  const activeSegments = Math.round((normalized / 100) * RING_SEGMENTS);
  const trackColor = active ? '#ECF2FE' : '#E5E7EB';

  return (
    <View
      className="absolute items-center justify-center"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      <View
        className="absolute rounded-full"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          borderWidth: RING_STROKE,
          borderColor: trackColor,
        }}
      />
      {active
        ? Array.from({ length: activeSegments }).map((_, index) => (
            <View
              key={index}
              className="absolute items-center"
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                transform: [{ rotate: `${index * (360 / RING_SEGMENTS)}deg` }],
              }}
            >
              <View
                style={{
                  width: RING_SEGMENT_WIDTH,
                  height: RING_STROKE,
                  borderRadius: RING_STROKE / 2,
                  backgroundColor: '#256EF4',
                }}
              />
            </View>
          ))
        : null}
    </View>
  );
}

function LocationBlock({ post }: { post: RoomPost }) {
  const regionLabel = `${post.region.city} ${post.region.district}`.trim();
  return (
    <ReadySection title="위치">
      <View className="relative h-40 overflow-hidden rounded-lg bg-[#F1F3F5]">
        <View className="absolute -left-5 top-9 h-3 w-[115%] rotate-[-8deg] bg-white/80" />
        <View className="absolute -left-5 bottom-8 h-2 w-[115%] rotate-[7deg] bg-white/70" />
        <View className="absolute left-20 -top-5 h-[125%] w-3 rotate-[12deg] bg-white/75" />
        <View className="absolute right-20 -top-5 h-[125%] w-2 rotate-[-16deg] bg-white/70" />
        <View className="absolute inset-0 items-center justify-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#256EF4]/15">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#256EF4]">
              <Ionicons name="location" size={16} color="#ffffff" />
            </View>
          </View>
          <View className="mt-1 rounded-full bg-white px-3 py-1 shadow-sm">
            <Text className="text-xs font-medium text-[#454550]">{regionLabel}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Ionicons name="location-outline" size={18} color="#8B8B9B" />
        <Text className="text-xs text-neutral-600">{regionLabel || '위치 정보 없음'}</Text>
      </View>
    </ReadySection>
  );
}

function AuthorBlock({ author, onPress }: { author: UserSummary; onPress: () => void }) {
  return (
    <ReadySection title="등록자 정보">
      <Pressable onPress={onPress} className="flex-row items-center gap-3 active:opacity-90">
        <ReadyProfileAvatar name={author.name} imageUrl={author.avatarUrl} size={58} />
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-[16px] font-semibold leading-6 text-[#17171B]">
              {author.name}
            </Text>
            <AuthorMetaPill author={author} />
          </View>
          <View className="flex-row flex-wrap gap-2">
            {author.badges.map((badge) => (
              <ReadyBadge
                key={badge.kind}
                label={badge.kind === 'school' ? '학교 인증' : '회사 인증'}
                tone="green"
                icon={badge.kind === 'school' ? 'school-outline' : 'business-outline'}
              />
            ))}
          </View>
        </View>
      </Pressable>
    </ReadySection>
  );
}

function BottomBar({
  liked,
  onLike,
  onChat,
  creatingChat,
  bottomPadding,
}: {
  liked: boolean;
  onLike: () => void;
  onChat: () => void;
  creatingChat: boolean;
  bottomPadding: number;
}) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-neutral-100 bg-white px-5 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        accessibilityState={{ selected: liked }}
        className={`h-12 w-[50px] items-center justify-center rounded-lg border-[1.5px] ${
          liked ? 'border-[#256EF4]' : 'border-neutral-200'
        }`}
      >
        {/* 선택 시 카드 하트와 동일하게 Primary/50 채움 하트로 표시한다. */}
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={23}
          color={liked ? '#256EF4' : '#AAAABA'}
          style={{ includeFontPadding: false, textAlignVertical: 'center' }}
        />
      </Pressable>
      <Pressable
        onPress={onChat}
        disabled={creatingChat}
        accessibilityRole="button"
        accessibilityLabel="채팅하기"
        accessibilityState={{ disabled: creatingChat }}
        className={`h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90 ${
          creatingChat ? 'opacity-60' : ''
        }`}
      >
        {creatingChat ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-[16px] font-bold leading-6 text-white">채팅하기</Text>
        )}
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text className="text-sm font-semibold text-neutral-800">{value}</Text>
    </View>
  );
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-800">{value}</Text>
    </View>
  );
}

function sleepRangeLabel(sleep?: string, wake?: string) {
  if (!sleep && !wake) return '미입력';
  return `${sleep ?? '?'} ~ ${wake ?? '?'}`;
}

function levelLabel(value?: number) {
  if (value === undefined) return '미입력';
  if (value >= 4) return '높음';
  if (value >= 3) return '보통';
  return '낮음';
}

function fmtDate(d: Date): string {
  return formatKstDateLabel(d);
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (day <= 0) {
    const hour = Math.floor(diffMs / (1000 * 60 * 60));
    if (hour <= 0) return '방금 전';
    return `${hour}시간 전`;
  }
  if (day < 30) return `${day}일 전`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}달 전`;
  return `${Math.floor(month / 12)}년 전`;
}

function isRecent(date: Date): boolean {
  const age = Date.now() - date.getTime();
  return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
}
