import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/headless';
import {
  useModeration,
  useRoomStore,
  useSession,
  type RoomOption,
  type RoomPost,
} from '@/lib/domain';
import type { UserSummary } from '@/lib/domain';

const REPORT_REASONS = [
  '허위 매물',
  '욕설/혐오 표현',
  '불법/사기 의심',
  '동일/반복 게시',
  '기타',
];

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

const SLEEP_RANGE_LABEL = (sleep?: string, wake?: string) => {
  if (!sleep && !wake) return '미입력';
  return `${sleep ?? '?'} ~ ${wake ?? '?'}`;
};

const LEVEL_LABEL = (n?: number) => {
  if (n === undefined) return '미입력';
  if (n >= 4) return '높음';
  if (n >= 3) return '보통';
  return '낮음';
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

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, signIn } = useSession();
  const { getById, posts, remove } = useRoomStore();
  const { report, blockUser, isPostBlocked, blockPost } = useModeration();

  const [liked, setLiked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);

  const post = useMemo(() => {
    if (typeof id === 'string') {
      const found = getById(id);
      if (found) return found;
    }
    return posts[0];
  }, [id, getById, posts]);

  const isOwner = session?.user.id === post.author.id;
  const blocked = isPostBlocked(post.id);

  const photos = post.photoUrls?.length
    ? post.photoUrls
    : post.thumbnailUrl
      ? [post.thumbnailUrl]
      : [];

  const requireLogin = (then: () => void) => {
    if (!session) {
      Alert.alert('로그인이 필요해요', '로그인하시겠어요?', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => signIn() },
      ]);
      return;
    }
    then();
  };

  const onRequestChat = () => {
    requireLogin(() => {
      Alert.alert(
        '매칭 요청',
        `${post.author.name}님께 1:1 대화 요청을 보낼까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '요청 보내기',
            onPress: () => router.push(`/chat/${post.author.id}` as never),
          },
        ],
      );
    });
  };

  if (blocked) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Header
          onBack={() => router.back()}
          onMenu={() => setMenuOpen(true)}
        />
        <View className="flex-1 items-center justify-center gap-3 p-10">
          <Text className="text-base text-neutral-500">
            차단한 게시글이에요
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-neutral-100 px-5 py-3"
          >
            <Text className="text-sm text-neutral-700">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header onBack={() => router.back()} onMenu={() => setMenuOpen(true)} />

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        <PhotoCarousel
          photos={photos}
          index={photoIndex}
          onIndexChange={setPhotoIndex}
        />

        <View className="gap-5 p-5">
          <TitleBlock post={post} />
          <BasicInfoBlock post={post} />
          <LifestyleBlock
            author={post.author}
            expanded={lifestyleExpanded}
            onToggle={() => setLifestyleExpanded((p) => !p)}
          />
          {post.options && post.options.length > 0 ? (
            <OptionsBlock options={post.options} />
          ) : null}
          <PreferredRoommateBlock author={post.author} />
          <DescriptionBlock
            description={post.description}
            expanded={descExpanded}
            onToggle={() => setDescExpanded((p) => !p)}
          />
          <CompatibilityBlock isLoggedIn={!!session} />
          <LocationBlock post={post} />
          <AuthorBlock
            author={post.author}
            onPress={() =>
              router.push(`/roommate/rc-${post.author.id}` as never)
            }
          />
        </View>
      </ScrollView>

      <BottomBar
        liked={liked}
        onLike={() => requireLogin(() => setLiked((p) => !p))}
        onRequest={onRequestChat}
      />

      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <View className="gap-2">
          {isOwner ? (
            <>
              <MenuRow
                icon="✎"
                title="게시글 수정"
                description="내용을 수정할 수 있어요"
                onPress={() => {
                  setMenuOpen(false);
                  router.push(`/room/${post.id}/edit` as never);
                }}
              />
              <MenuRow
                icon="🗑"
                title="게시글 삭제"
                description="삭제 후 복구할 수 없어요"
                danger
                onPress={() => {
                  setMenuOpen(false);
                  Alert.alert('삭제', '게시글을 삭제할까요?', [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '삭제',
                      style: 'destructive',
                      onPress: () => {
                        remove(post.id);
                        router.back();
                      },
                    },
                  ]);
                }}
              />
            </>
          ) : (
            <MenuRow
              icon="⚠"
              title="신고하기"
              description="허위 정보나 부적절한 게시글을 신고해요"
              warning
              onPress={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}
            />
          )}
        </View>
      </BottomSheet>

      <BottomSheet
        open={reportOpen}
        onOpenChange={setReportOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <Text className="mb-3 text-base font-semibold text-neutral-900">
          게시글 신고
        </Text>
        <View className="gap-2">
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => {
                report({ kind: 'post', id: post.id }, reason);
                setReportOpen(false);
                Alert.alert('신고 접수 완료', '검토 후 조치할게요.');
              }}
              className="rounded-xl border border-neutral-200 px-4 py-3 active:bg-neutral-50"
            >
              <Text className="text-sm text-neutral-800">{reason}</Text>
            </Pressable>
          ))}
          {!isOwner ? (
            <Pressable
              onPress={() => {
                Alert.alert(
                  '차단',
                  `${post.author.name}님을 차단할까요? 상호 비노출 처리돼요.`,
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '차단',
                      style: 'destructive',
                      onPress: () => {
                        blockUser(post.author.id);
                        blockPost(post.id);
                        setReportOpen(false);
                        router.back();
                      },
                    },
                  ],
                );
              }}
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
  onBack,
  onMenu,
}: {
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
      <Pressable
        onPress={onBack}
        className="h-9 w-9 items-center justify-center"
      >
        <Text className="text-2xl text-neutral-700">‹</Text>
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">
        방 살피기 상세
      </Text>
      <View className="flex-row">
        <Pressable className="h-9 w-9 items-center justify-center">
          <Text className="text-base text-neutral-700">↑</Text>
        </Pressable>
        <Pressable
          onPress={onMenu}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-xl text-neutral-700">⋯</Text>
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
  if (photos.length === 0) {
    return (
      <View className="h-72 items-center justify-center bg-neutral-100">
        <Text className="text-sm text-neutral-400">방 이미지</Text>
        <Text className="mt-1 text-xs text-neutral-400">
          [사진 캐러셀 영역]
        </Text>
      </View>
    );
  }

  return (
    <View className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const w = e.nativeEvent.layoutMeasurement.width;
          onIndexChange(Math.round(e.nativeEvent.contentOffset.x / w));
        }}
      >
        {photos.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            source={{ uri: url }}
            style={{ width: 360, height: 280 }}
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
          보증금 {post.deposit.toLocaleString()} / 월세{' '}
          {post.monthlyRent.toLocaleString()}
        </Text>
        {post.maintenanceFee !== undefined ? (
          <Text className="text-sm text-neutral-500">
            / 관리비 {post.maintenanceFee}만원
          </Text>
        ) : null}
      </View>
      <Text className="text-sm text-neutral-700">
        {ROOM_TYPE_LABEL[post.roomType] ?? post.roomType}
      </Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-xs text-neutral-500">
          📍 {post.region.city} {post.region.district}
        </Text>
        <Text className="text-xs text-neutral-400">{fmtDate(post.createdAt)}</Text>
        <Text className="text-xs text-neutral-400">
          ⓘ {post.views.toLocaleString()}
        </Text>
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
  const ls = author.lifestyle ?? {};
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">생활패턴</Text>
      <View className="flex-row flex-wrap gap-2">
        <InfoTile label="취침 시간" value={SLEEP_RANGE_LABEL(ls.sleepTime, ls.wakeTime)} />
        <InfoTile label="청결 민감도" value={LEVEL_LABEL(ls.cleanliness)} />
        <InfoTile label="소음 민감도" value={LEVEL_LABEL(ls.noise)} />
        <InfoTile
          label="흡연"
          value={ls.smoking ? SMOKING_LABEL[ls.smoking] : '미입력'}
        />
      </View>
      {expanded ? (
        <View className="rounded-2xl bg-neutral-50 px-4 py-3">
          <Text className="text-xs text-neutral-600">
            반려동물: {ls.pet === 'no' ? '불가' : ls.pet === 'small' ? '소형 가능' : '협의'}
          </Text>
        </View>
      ) : null}
      <Pressable onPress={onToggle} className="items-center py-1">
        <Text className="text-xs text-neutral-500">
          {expanded ? '접기 ⌃' : '더보기 ⌄'}
        </Text>
      </Pressable>
    </View>
  );
}

function OptionsBlock({ options }: { options: RoomOption[] }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">옵션</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => (
          <View
            key={o}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5"
          >
            <Text className="text-xs text-neutral-700">{OPTION_LABEL[o]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PreferredRoommateBlock({ author }: { author: UserSummary }) {
  const smoking = author.lifestyle?.smoking;
  const importantLabels = author.importantConditions.slice(0, 3);
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">
        선호 룸메이트 조건
      </Text>
      <View className="gap-2 rounded-2xl bg-neutral-50 p-4">
        <KeyValueRow
          label="선호 성별"
          value={
            author.preferredGender
              ? PREFERRED_GENDER_LABEL[author.preferredGender]
              : GENDER_LABEL[author.gender]
          }
        />
        <KeyValueRow
          label="흡연 여부"
          value={smoking === 'no' ? '비흡연자' : '제한 없음'}
        />
        <KeyValueRow
          label="중요 조건"
          value={importantLabels.join(' · ')}
        />
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
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">
        게시글 내용
      </Text>
      <Text
        numberOfLines={expanded ? undefined : 3}
        className="text-sm leading-6 text-neutral-700"
      >
        {description}
      </Text>
      <Pressable onPress={onToggle}>
        <Text className="text-xs text-neutral-500">
          {expanded ? '접기 ⌃' : '더보기 ⌄'}
        </Text>
      </Pressable>
    </View>
  );
}

const RING_SIZE = 84;
const RING_STROKE = 9;

function CompatibilityBlock({ isLoggedIn }: { isLoggedIn: boolean }) {
  // TODO: 로그인 시 실제 궁합 점수는 추후 API 응답으로 대체
  const total = 82;
  const subs = [
    { label: '생활 패턴', value: 90 },
    { label: '청결·소음', value: 74 },
  ];

  const scoreColor = isLoggedIn ? '#256EF4' : '#9CA3AF';

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
            borderColor: isLoggedIn ? '#256EF4' : '#E5E7EB',
            borderTopColor: isLoggedIn ? '#DBE6FD' : '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-xl font-bold" style={{ color: scoreColor }}>
            {isLoggedIn ? `${total}점` : '??점'}
          </Text>
        </View>

        <View className="flex-1 gap-3">
          {subs.map((s) => (
            <View key={s.label} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-neutral-500">{s.label}</Text>
                <Text className="text-sm font-bold" style={{ color: scoreColor }}>
                  {isLoggedIn ? `${s.value}점` : '??점'}
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <View
                  className="h-full rounded-full"
                  style={{ width: isLoggedIn ? `${s.value}%` : '0%', backgroundColor: '#256EF4' }}
                />
              </View>
            </View>
          ))}
          {!isLoggedIn ? (
            <Text className="text-[10px] text-neutral-400">* 프로필 완성 후 실제 점수 반영</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function LocationBlock({ post }: { post: RoomPost }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">위치</Text>
      <View className="h-40 items-center justify-center rounded-2xl bg-neutral-100">
        <Text className="text-sm text-neutral-400">지도 영역</Text>
      </View>
      <Text className="text-xs text-neutral-600">
        📍 {post.region.city} {post.region.district}
      </Text>
    </View>
  );
}

function AuthorBlock({
  author,
  onPress,
}: {
  author: UserSummary;
  onPress: () => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">등록자 정보</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Text className="font-semibold text-neutral-600">
            {author.name.charAt(0)}
          </Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-neutral-900">
            {author.name} · {author.age}세 · {GENDER_LABEL[author.gender]}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {author.badges.map((b) => (
              <View
                key={b.kind}
                className="rounded bg-emerald-50 px-2 py-0.5"
              >
                <Text className="text-[10px] text-emerald-700">
                  {b.kind === 'school' ? '🎓 학교 인증' : '🏢 회사 인증'}
                </Text>
              </View>
            ))}
            <View className="rounded bg-sky-50 px-2 py-0.5">
              <Text className="text-[10px] text-sky-700">회원 확인</Text>
            </View>
          </View>
        </View>
        <Text className="text-neutral-300">›</Text>
      </Pressable>
    </View>
  );
}

function BottomBar({
  liked,
  onLike,
  onRequest,
}: {
  liked: boolean;
  onLike: () => void;
  onRequest: () => void;
}) {
  return (
    <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-neutral-100 bg-white px-5 py-3">
      <Pressable
        onPress={onLike}
        className="h-12 w-12 items-center justify-center rounded-xl border border-neutral-200"
      >
        <Text className={liked ? 'text-xl text-red-500' : 'text-xl text-neutral-400'}>
          {liked ? '♥' : '♡'}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRequest}
        className="h-12 flex-1 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-sm font-semibold text-white">매칭 요청</Text>
      </Pressable>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  description,
  onPress,
  danger,
  warning,
}: {
  icon: string;
  title: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
  warning?: boolean;
}) {
  const titleColor = danger
    ? 'text-rose-600'
    : warning
      ? 'text-amber-600'
      : 'text-neutral-900';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl px-3 py-3 active:bg-neutral-50"
    >
      <Text className={`text-xl ${titleColor}`}>{icon}</Text>
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

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
