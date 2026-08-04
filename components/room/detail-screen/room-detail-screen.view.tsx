import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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

import { RoomOptionArtwork } from '@/components/ui/ready-to-dev-assets';
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
import type { RoomOption, RoomPost, UserSummary } from '@/lib/domain';

import { ROOM_REPORT_REASONS, type UseRoomDetailScreenReturn } from './use-room-detail-screen';

const ROOM_TYPE_LABEL: Record<string, string> = {
  'one-room': '원룸',
  'two-room': '투룸',
  'three-room+': '쓰리룸+',
  officetel: '오피스텔',
  'share-house': '쉐어하우스',
  apt: '아파트',
  villa: '빌라',
};

const OPTION_LABEL: Record<RoomOption, string> = {
  parking: '주차 가능',
  'full-option': '풀옵션',
  elevator: '엘리베이터',
  pet: '반려동물 가능',
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
        <Header
          title="게시글 상세"
          onBack={props.onBack}
          onShare={props.onShare}
          onMenu={() => props.setMenuOpen(true)}
        />
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
        <Header
          title="게시글 상세"
          onBack={props.onBack}
          onShare={props.onShare}
          onMenu={() => props.setMenuOpen(true)}
        />
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
        <Header
          title="게시글 상세"
          onBack={props.onBack}
          onShare={props.onShare}
          onMenu={() => props.setMenuOpen(true)}
        />
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
        onShare={props.onShare}
        onMenu={() => props.setMenuOpen(true)}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="pb-28"
        stickyHeaderIndices={[2]}
      >
        <PhotoCarousel
          photos={props.photos}
          index={props.photoIndex}
          onIndexChange={props.setPhotoIndex}
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
            lifeStyles={props.post.lifeStyles}
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

      <BottomBar
        isOwner={props.isOwner}
        liked={props.liked}
        onLike={props.onLike}
        onChat={props.onChat}
        creatingChat={props.creatingChat}
        onEdit={props.onEdit}
        bottomPadding={props.bottomPadding}
      />

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
              onPress={() => {
                props.setMenuOpen(false);
                props.setReportOpen(true);
              }}
            />
          )}
        </View>
      </ReadyActionSheet>

      <ReportReasonSheet
        open={props.reportOpen}
        onOpenChange={props.setReportOpen}
        onReportReason={props.onReportReason}
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
  { key: 'options', label: '옵션' },
  { key: 'location', label: '위치' },
  { key: 'author', label: '등록자 정보' },
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
  return (
    <View className="border-b border-[#ECECF3] bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3"
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
            >
              <Text
                className={
                  selected
                    ? 'text-sm font-semibold text-[#17171B]'
                    : 'text-sm font-medium text-[#AAAABA]'
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
  onShare,
  onMenu,
}: {
  title: string;
  onBack: () => void;
  onShare: () => void;
  onMenu: () => void;
}) {
  return (
    <ReadyScreenHeader
      title={title}
      onBack={onBack}
      actions={[
        { icon: 'share-outline', label: '게시글 공유', onPress: onShare },
        { icon: 'ellipsis-horizontal', label: '게시글 메뉴', onPress: onMenu },
      ]}
    />
  );
}

function ReportReasonSheet({
  open,
  onOpenChange,
  onReportReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportReason: (reason: string) => void;
}) {
  return (
    <ReadyActionSheet open={open} onOpenChange={onOpenChange}>
      <Text className="mb-2 text-base font-semibold text-[#17171B]">신고 사유</Text>
      {ROOM_REPORT_REASONS.map((reason, index) => (
        <ReadyActionRow
          key={reason}
          icon="alert-circle-outline"
          label={reason}
          divider={index < ROOM_REPORT_REASONS.length - 1}
          onPress={() => onReportReason(reason)}
        />
      ))}
    </ReadyActionSheet>
  );
}

function PhotoCarousel({
  photos,
  index,
  onIndexChange,
}: {
  photos: string[];
  index: number;
  onIndexChange: (next: number) => void;
}) {
  const { width } = useWindowDimensions();
  const photoHeight = 180;

  if (photos.length === 0) {
    return (
      <View style={{ height: photoHeight }} className="items-center justify-center bg-neutral-100">
        <Ionicons name="image-outline" size={32} color="#AAAABA" />
        <Text className="mt-2 text-sm text-neutral-400">등록된 방 사진이 없어요</Text>
      </View>
    );
  }

  return (
    <View className="relative">
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
    <View className="gap-2 px-4 py-5">
      <View className="flex-row items-center gap-1.5">
        {isRecent(post.createdAt) ? <ReadyBadge label="NEW" tone="red" /> : null}
        <ReadyBadge label={ROOM_TYPE_LABEL[post.roomType] ?? post.roomType} tone="blue" />
      </View>
      <Text className="text-xl font-bold text-[#17171B]">{post.title}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-[#17171B]">
          보증금 {post.deposit.toLocaleString()} / 월세 {post.monthlyRent.toLocaleString()}
        </Text>
        {post.maintenanceFee !== undefined ? (
          <Text className="text-sm text-[#696976]">/ 관리비 {post.maintenanceFee}만원</Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={13} color="#696976" />
          <Text className="text-xs text-neutral-500">
            {post.region.city} {post.region.district}
          </Text>
        </View>
        <Text className="text-xs text-neutral-400">{fmtDate(post.createdAt)}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="information-circle-outline" size={13} color="#AAAABA" />
          <Text className="text-xs text-neutral-400">{post.views.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

function BasicInfoBlock({ post }: { post: RoomPost }) {
  if (!post.moveInDate) return null;
  return (
    <ReadySection title="입주 가능일">
      <Row label="입주 가능 시기" value={fmtDate(post.moveInDate)} />
    </ReadySection>
  );
}

function LifestyleBlock({
  lifeStyles,
  expanded,
  onToggle,
}: {
  lifeStyles: RoomPost['lifeStyles'];
  expanded: boolean;
  onToggle: () => void;
}) {
  const items = lifeStyles ?? [];
  const visible = expanded ? items : items.slice(0, 4);

  return (
    <ReadySection title="생활 패턴">
      {items.length ? (
        <View className="flex-row flex-wrap gap-3">
          {visible.map((item) => (
            <ReadyMetadataTile key={item.id} label={item.name} value={item.value} />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-[#AAAABA]">등록된 생활 패턴이 없어요</Text>
      )}
      {items.length > 4 ? <ReadyMoreButton expanded={expanded} onPress={onToggle} /> : null}
    </ReadySection>
  );
}

function OptionsBlock({ options }: { options: RoomOption[] }) {
  return (
    <ReadySection title="옵션">
      <View className="flex-row justify-around gap-2 py-2">
        {options.map((option) => (
          <View key={option} className="flex-1 items-center gap-2">
            <RoomOptionArtwork label={OPTION_LABEL[option]} size={40} />
            <Text className="text-center text-xs text-[#696976]">{OPTION_LABEL[option]}</Text>
          </View>
        ))}
      </View>
    </ReadySection>
  );
}

function PreferredRoommateBlock({ post }: { post: RoomPost }) {
  const { author } = post;
  const smoking = author.lifestyle?.smoking;
  const preferred = post.preferredRoommate;
  const importantLabels = (
    preferred?.importantConditions.length
      ? preferred.importantConditions
      : author.importantConditions
  ).slice(0, 3);
  return (
    <ReadySection title="룸메이트 조건">
      <View className="gap-3 rounded bg-[#F6F6FA] p-4">
        <KeyValueRow
          label="선호 성별"
          value={
            preferred?.genderLabel ??
            (author.preferredGender
              ? PREFERRED_GENDER_LABEL[author.preferredGender]
              : GENDER_LABEL[author.gender])
          }
        />
        <KeyValueRow
          label="흡연 여부"
          value={preferred?.smokingLabel ?? (smoking === 'no' ? '비흡연자' : '제한 없음')}
        />
        <KeyValueRow label="중요 조건" value={importantLabels.join(' · ') || '없음'} />
      </View>
    </ReadySection>
  );
}

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

const RING_SIZE = 84;
const RING_STROKE = 9;

function CompatibilityBlock({ post, isLoggedIn }: { post: RoomPost; isLoggedIn: boolean }) {
  const total = post.compatibilityScore;
  const subs = post.compatibilityDetails ?? [];
  const hasScore = isLoggedIn && total !== undefined;
  const scoreColor = hasScore ? '#256EF4' : '#9CA3AF';

  return (
    <ReadySection title="궁합 점수">
      <View className="flex-row items-center gap-5 px-4 py-3">
        <View
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: RING_STROKE,
            borderColor: hasScore ? '#256EF4' : '#E5E7EB',
            borderTopColor: hasScore ? '#DBE6FD' : '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-xl font-bold" style={{ color: scoreColor }}>
            {hasScore ? `${total}점` : isLoggedIn ? '--점' : '??점'}
          </Text>
        </View>

        <View className="flex-1 gap-3">
          {subs.slice(0, 3).map((score) => (
            <View key={score.label} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-neutral-500">{score.label}</Text>
                <Text className="text-sm font-bold" style={{ color: scoreColor }}>
                  {hasScore ? `${score.score}점` : isLoggedIn ? '--점' : '??점'}
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: hasScore ? `${score.score}%` : '0%',
                    backgroundColor: '#256EF4',
                  }}
                />
              </View>
            </View>
          ))}
          {subs.length === 0 && isLoggedIn ? (
            <Text className="text-[10px] text-neutral-400">궁합 세부 점수를 계산 중이에요</Text>
          ) : null}
          {!isLoggedIn ? (
            <Text className="text-[10px] text-neutral-400">* 프로필 완성 후 실제 점수 반영</Text>
          ) : null}
        </View>
      </View>
    </ReadySection>
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
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
      >
        <ReadyProfileAvatar name={author.name} imageUrl={author.avatarUrl} size={58} />
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-neutral-900">
            {author.name} · {author.age}세 · {GENDER_LABEL[author.gender]}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
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
        <Ionicons name="chevron-forward" size={18} color="#DADAE8" />
      </Pressable>
    </ReadySection>
  );
}

function BottomBar({
  isOwner,
  liked,
  onLike,
  onChat,
  creatingChat,
  onEdit,
  bottomPadding,
}: {
  isOwner: boolean;
  liked: boolean;
  onLike: () => void;
  onChat: () => void;
  creatingChat: boolean;
  onEdit: () => void;
  bottomPadding: number;
}) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-neutral-100 bg-white px-5 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      {!isOwner ? (
        <Pressable
          onPress={onLike}
          className="h-12 w-12 items-center justify-center rounded-xl border border-neutral-200"
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={23}
            color={liked ? '#EF4444' : '#AAAABA'}
          />
        </Pressable>
      ) : null}
      <Pressable
        onPress={isOwner ? onEdit : onChat}
        disabled={!isOwner && creatingChat}
        accessibilityRole="button"
        accessibilityLabel={isOwner ? '게시글 수정' : '채팅하기'}
        accessibilityState={{ disabled: !isOwner && creatingChat }}
        className={`h-12 flex-1 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90 ${
          !isOwner && creatingChat ? 'opacity-60' : ''
        }`}
      >
        {!isOwner && creatingChat ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-sm font-semibold text-white">
            {isOwner ? '게시글 수정' : '채팅하기'}
          </Text>
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

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function isRecent(date: Date): boolean {
  const age = Date.now() - date.getTime();
  return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
}
