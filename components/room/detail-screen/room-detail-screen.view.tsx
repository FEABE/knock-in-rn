import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/headless';
import { RoomOptionArtwork } from '@/components/ui/ready-to-dev-assets';
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

export type RoomDetailScreenViewProps = UseRoomDetailScreenReturn;

export function RoomDetailScreenView(props: RoomDetailScreenViewProps) {
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

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        <PhotoCarousel
          photos={props.photos}
          index={props.photoIndex}
          onIndexChange={props.setPhotoIndex}
        />

        <View className="gap-5 p-5">
          <TitleBlock post={props.post} />
          <PreferredRoommateBlock post={props.post} />
          <BasicInfoBlock post={props.post} />
          <DescriptionBlock
            description={props.post.description}
            expanded={props.descExpanded}
            onToggle={props.toggleDescription}
          />
          <LifestyleBlock
            author={props.post.author}
            expanded={props.lifestyleExpanded}
            onToggle={props.toggleLifestyle}
          />
          {props.post.options && props.post.options.length > 0 ? (
            <OptionsBlock options={props.post.options} />
          ) : null}
          <LocationBlock post={props.post} />
          {!props.isOwner ? (
            <CompatibilityBlock post={props.post} isLoggedIn={props.isLoggedIn} />
          ) : null}
          <AuthorBlock author={props.post.author} onPress={props.onAuthorPress} />
        </View>
      </ScrollView>

      <BottomBar
        isOwner={props.isOwner}
        liked={props.liked}
        onLike={props.onLike}
        onRequest={props.onRequestChat}
        onEdit={props.onEdit}
        bottomPadding={props.bottomPadding}
      />

      <BottomSheet
        open={props.menuOpen}
        onOpenChange={props.setMenuOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <View className="gap-2">
          {props.isOwner ? (
            <>
              <MenuRow
                iconName="create-outline"
                title="게시글 수정"
                description="내용을 수정할 수 있어요"
                onPress={props.onEdit}
              />
              <MenuRow
                iconName="trash-outline"
                title="게시글 삭제"
                description="삭제 후 복구할 수 없어요"
                danger
                onPress={props.onDelete}
              />
            </>
          ) : (
            <MenuRow
              iconName="warning-outline"
              title="신고하기"
              description="허위 정보나 부적절한 게시글을 신고해요"
              warning
              onPress={() => {
                props.setMenuOpen(false);
                props.setReportOpen(true);
              }}
            />
          )}
        </View>
      </BottomSheet>

      <BottomSheet
        open={props.reportOpen}
        onOpenChange={props.setReportOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <Text className="mb-3 text-base font-semibold text-neutral-900">게시글 신고</Text>
        <View className="gap-2">
          {ROOM_REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => props.onReportReason(reason)}
              className="rounded-xl border border-neutral-200 px-4 py-3 active:bg-neutral-50"
            >
              <Text className="text-sm text-neutral-800">{reason}</Text>
            </Pressable>
          ))}
          {!props.isOwner ? (
            <Pressable
              onPress={props.onBlockAuthor}
              className="mt-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 active:opacity-80"
            >
              <Text className="text-sm text-rose-600">작성자 차단</Text>
            </Pressable>
          ) : null}
        </View>
      </BottomSheet>
    </SafeAreaView>
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
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404047" />
      </Pressable>
      <Text
        numberOfLines={1}
        className="mx-2 flex-1 text-center text-base font-semibold text-neutral-900"
      >
        {title}
      </Text>
      <View className="flex-row">
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="게시글 공유"
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="share-outline" size={21} color="#404047" />
        </Pressable>
        <Pressable onPress={onMenu} className="h-9 w-9 items-center justify-center">
          <Ionicons name="ellipsis-horizontal" size={22} color="#404047" />
        </Pressable>
      </View>
    </View>
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
  const photoHeight = Math.round(width * 0.46);

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
      <View className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1">
        <Text className="text-xs text-white">
          {index + 1} / {photos.length}
        </Text>
      </View>
    </View>
  );
}

function TitleBlock({ post }: { post: RoomPost }) {
  return (
    <View className="gap-1">
      <Text className="text-xl font-bold text-neutral-900">{post.title}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-neutral-700">
          보증금 {post.deposit.toLocaleString()} / 월세 {post.monthlyRent.toLocaleString()}
        </Text>
        {post.maintenanceFee !== undefined ? (
          <Text className="text-sm text-neutral-500">/ 관리비 {post.maintenanceFee}만원</Text>
        ) : null}
      </View>
      <Text className="text-sm text-neutral-700">
        {ROOM_TYPE_LABEL[post.roomType] ?? post.roomType}
      </Text>
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
    <View className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
      <Row label="입주 가능 시기" value={fmtDate(post.moveInDate)} />
    </View>
  );
}

function LifestyleBlock({
  author,
  expanded,
  onToggle,
}: {
  author: UserSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const lifestyle = author.lifestyle ?? {};
  const hasHiddenLifestyle = lifestyle.pet !== undefined;

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">생활패턴</Text>
      <View className="flex-row flex-wrap gap-2">
        <InfoTile
          label="취침 시간"
          value={sleepRangeLabel(lifestyle.sleepTime, lifestyle.wakeTime)}
        />
        <InfoTile label="청결 민감도" value={levelLabel(lifestyle.cleanliness)} />
        <InfoTile label="소음 민감도" value={levelLabel(lifestyle.noise)} />
        <InfoTile
          label="흡연"
          value={lifestyle.smoking ? SMOKING_LABEL[lifestyle.smoking] : '미입력'}
        />
      </View>
      {expanded && hasHiddenLifestyle ? (
        <View className="rounded-2xl bg-neutral-50 px-4 py-3">
          <Text className="text-xs text-neutral-600">
            반려동물:{' '}
            {lifestyle.pet === 'no' ? '불가' : lifestyle.pet === 'small' ? '소형 가능' : '협의'}
          </Text>
        </View>
      ) : null}
      {hasHiddenLifestyle ? (
        <Pressable onPress={onToggle} className="flex-row items-center justify-center gap-1 py-1">
          <Text className="text-xs text-neutral-500">{expanded ? '접기' : '더보기'}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color="#696976" />
        </Pressable>
      ) : null}
    </View>
  );
}

function OptionsBlock({ options }: { options: RoomOption[] }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">옵션</Text>
      <View className="flex-row justify-around gap-2 py-2">
        {options.map((option) => (
          <View key={option} className="flex-1 items-center gap-2">
            <RoomOptionArtwork label={OPTION_LABEL[option]} size={30} />
            <Text className="text-center text-xs text-neutral-700">{OPTION_LABEL[option]}</Text>
          </View>
        ))}
      </View>
    </View>
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
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">선호 룸메이트 조건</Text>
      <View className="gap-2 rounded-2xl bg-neutral-50 p-4">
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
    </View>
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
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">게시글 내용</Text>
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
      {hasOverflow === true ? (
        <Pressable onPress={onToggle} className="flex-row items-center gap-1">
          <Text className="text-xs text-neutral-500">{expanded ? '접기' : '더보기'}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color="#696976" />
        </Pressable>
      ) : null}
    </View>
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
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">나와 궁합</Text>
      <View className="flex-row items-center gap-5 rounded-2xl border border-neutral-100 bg-white px-5 py-5">
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
    </View>
  );
}

function LocationBlock({ post }: { post: RoomPost }) {
  const regionLabel = `${post.region.city} ${post.region.district}`.trim();
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">위치</Text>
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
    </View>
  );
}

function AuthorBlock({ author, onPress }: { author: UserSummary; onPress: () => void }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">등록자 정보</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
      >
        {author.avatarUrl ? (
          <Image
            source={{ uri: author.avatarUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Text className="font-semibold text-neutral-600">{author.name.charAt(0)}</Text>
          </View>
        )}
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-neutral-900">
            {author.name} · {author.age}세 · {GENDER_LABEL[author.gender]}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {author.badges.map((badge) => (
              <View
                key={badge.kind}
                className="flex-row items-center gap-1 rounded bg-emerald-50 px-2 py-0.5"
              >
                <Ionicons
                  name={badge.kind === 'school' ? 'school-outline' : 'business-outline'}
                  size={11}
                  color="#047857"
                />
                <Text className="text-[10px] text-emerald-700">
                  {badge.kind === 'school' ? '학교 인증' : '회사 인증'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#DADAE8" />
      </Pressable>
    </View>
  );
}

function BottomBar({
  isOwner,
  liked,
  onLike,
  onRequest,
  onEdit,
  bottomPadding,
}: {
  isOwner: boolean;
  liked: boolean;
  onLike: () => void;
  onRequest: () => void;
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
        onPress={isOwner ? onEdit : onRequest}
        className="h-12 flex-1 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-sm font-semibold text-white">
          {isOwner ? '게시글 수정' : '매칭 요청'}
        </Text>
      </Pressable>
    </View>
  );
}

function MenuRow({
  iconName,
  title,
  description,
  onPress,
  danger,
  warning,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
  warning?: boolean;
}) {
  const titleColor = danger ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-neutral-900';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl px-3 py-3 active:bg-neutral-50"
    >
      <Ionicons
        name={iconName}
        size={21}
        color={danger ? '#E11D48' : warning ? '#D97706' : '#404047'}
      />
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${titleColor}`}>{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-neutral-500">{description}</Text>
        ) : null}
      </View>
    </Pressable>
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

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-0.5 rounded-2xl bg-neutral-50 p-3">
      <Text className="text-[11px] text-neutral-500">{label}</Text>
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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
