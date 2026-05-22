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
} from '@/lib/domain';

const REPORT_REASONS = [
  '허위 매물',
  '욕설/혐오 표현',
  '불법/사기 의심',
  '동일/반복 게시',
  '기타',
];

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, signIn } = useSession();
  const { getById, posts, remove } = useRoomStore();
  const { report, blockUser, isPostBlocked, blockPost } = useModeration();

  const [liked, setLiked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const post = useMemo(() => {
    if (typeof id === 'string') {
      const found = getById(id);
      if (found) return found;
    }
    return posts[0];
  }, [id, getById, posts]);

  const isOwner = session?.user.id === post.author.id;
  const blocked = isPostBlocked(post.id);

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

      <ScrollView className="flex-1" contentContainerClassName="pb-24">
        {post.thumbnailUrl ? (
          <Image
            source={{ uri: post.thumbnailUrl }}
            style={{ width: '100%', height: 240 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-60 items-center justify-center bg-neutral-100">
            <Text className="text-5xl">🏠</Text>
          </View>
        )}

        <View className="gap-5 p-5">
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                {labelFor(post.roomType)}
              </Text>
              <Text className="text-xs text-neutral-400">
                {post.region.city} {post.region.district} ·{' '}
                {fmtDate(post.createdAt)}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-neutral-900">
              {post.title}
            </Text>
            <Text className="text-xs text-neutral-400">
              조회 {post.views.toLocaleString()} · 관심{' '}
              {post.likes.toLocaleString()}
            </Text>
          </View>

          <View className="gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <Row label="보증금" value={`${post.deposit.toLocaleString()}만원`} />
            <Row
              label="월세"
              value={`${post.monthlyRent.toLocaleString()}만원`}
            />
          </View>

          <View className="gap-3">
            <Text className="text-base font-bold text-neutral-900">
              방 설명
            </Text>
            <Text className="text-sm leading-6 text-neutral-700">
              {post.description}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push(`/roommate/rc-${post.author.id}` as never)
            }
            className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
          >
            <Text className="text-base font-bold text-neutral-900">
              작성자
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Text className="font-semibold text-neutral-600">
                  {post.author.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-semibold text-neutral-900">
                    {post.author.name}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {post.author.age}세 · {labelGender(post.author.gender)}
                  </Text>
                </View>
                <Text numberOfLines={1} className="text-xs text-neutral-500">
                  {post.author.bio}
                </Text>
              </View>
              <Text className="text-neutral-300">›</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {post.author.badges.map((b) => (
                <Text
                  key={b.kind}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                >
                  {b.kind === 'school' ? '🎓 학교 인증' : '🏢 회사 인증'}
                </Text>
              ))}
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-neutral-100 bg-white px-5 py-3">
        <Pressable
          onPress={() => requireLogin(() => setLiked((p) => !p))}
          className="h-12 w-12 items-center justify-center rounded-xl border border-neutral-200"
        >
          <Text className={liked ? 'text-xl text-red-500' : 'text-xl'}>
            {liked ? '♥' : '♡'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onRequestChat}
          className="h-12 flex-1 items-center justify-center rounded-xl bg-blue-600 active:opacity-90"
        >
          <Text className="text-sm font-semibold text-white">
            1:1 대화 요청
          </Text>
        </Pressable>
      </View>

      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <Text className="mb-3 text-base font-semibold text-neutral-900">
          더보기
        </Text>
        <View className="gap-2">
          {isOwner ? (
            <>
              <MenuItem
                label="수정"
                onPress={() => {
                  setMenuOpen(false);
                  router.push(`/room/${post.id}/edit` as never);
                }}
              />
              <MenuItem
                label="삭제"
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
            <>
              <MenuItem
                label="게시글 신고"
                onPress={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
              />
              <MenuItem
                label="작성자 차단"
                danger
                onPress={() => {
                  setMenuOpen(false);
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
                          router.back();
                        },
                      },
                    ],
                  );
                }}
              />
            </>
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
      <Pressable
        onPress={onMenu}
        className="h-9 w-9 items-center justify-center"
      >
        <Text className="text-xl text-neutral-700">⋯</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-base font-semibold text-neutral-900">{value}</Text>
    </View>
  );
}

function MenuItem({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-neutral-200 px-4 py-3 active:bg-neutral-50"
    >
      <Text
        className={`text-sm ${
          danger ? 'text-red-500' : 'text-neutral-800'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function labelFor(rt: string): string {
  return (
    {
      'one-room': '원룸',
      'two-room': '투룸',
      'three-room+': '쓰리룸+',
      officetel: '오피스텔',
      'share-house': '쉐어하우스',
    }[rt] ?? rt
  );
}

function labelGender(g: string): string {
  return g === 'female' ? '여성' : g === 'male' ? '남성' : '기타';
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
