import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { type MatchDetailData, useRoommateMatchDetail } from '@/lib/api';
import { useSession } from '@/lib/domain';

export default function RoommateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, signIn } = useSession();
  const [liked, setLiked] = useState(false);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);

  const { data, loading, error } = useRoommateMatchDetail(id ?? '');

  // 룸메이트 상세 진입.
  useEffect(() => {
    if (id) logEvent(AnalyticsEvent.ROOMMATE_DETAIL_VIEW, { target_user_id: id });
  }, [id]);

  // "나와의 궁합" 섹션까지 스크롤 도달 시 1회 발화. (스크롤 유도가 충분한지 파악)
  const compatY = useRef(0);
  const firedCompat = useRef(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (firedCompat.current || !id) return;
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= compatY.current + 40) {
      firedCompat.current = true;
      logEvent(AnalyticsEvent.ROOMMATE_COMPATIBILITY_VIEW, { target_user_id: id });
    }
  };

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header onBack={() => router.back()} />

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">불러오는 중...</Text>
        </View>
      ) : error || !data ? (
        <View className="flex-1 items-center justify-center gap-2 p-10">
          <Text className="text-sm text-neutral-500">정보를 불러오지 못했어요</Text>
          {error ? <Text className="text-xs text-neutral-400">{error}</Text> : null}
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 p-5 pb-28"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <ProfileHead data={data} />
            <RoomStatus data={data} />
            <LifestyleBlock
              data={data}
              expanded={lifestyleExpanded}
              onToggle={() => setLifestyleExpanded((p) => !p)}
            />
            <PreferredLivingBlock data={data} />
            <PreferredRoommateBlock data={data} />
            <View onLayout={(e) => (compatY.current = e.nativeEvent.layout.y)}>
              <CompatibilityBlock data={data} />
            </View>
          </ScrollView>

          <BottomBar
            liked={liked}
            onLike={() =>
              requireLogin(() => {
                const next = !liked;
                // 관심 추가 시에만 발화 (프로필 열람 대비 관심 전환율).
                if (next) logEvent(AnalyticsEvent.ROOMMATE_INTEREST_ADD, { target_user_id: id });
                setLiked(next);
              })
            }
            onRequest={() =>
              requireLogin(() =>
                Alert.alert('매칭 요청', `${data.name}님께 매칭을 요청할까요?`, [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '요청',
                    onPress: () => {
                      // 관심 → 매칭 요청 전환율.
                      logEvent(AnalyticsEvent.ROOMMATE_MATCH_REQUEST, { target_user_id: id });
                      router.push(`/chat/${id}` as never);
                    },
                  },
                ]),
              )
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Text className="text-2xl text-neutral-700">‹</Text>
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">룸메이트 찾기</Text>
      <View className="h-9 w-9" />
    </View>
  );
}

function ProfileHead({ data }: { data: MatchDetailData }) {
  return (
    <View className="items-center gap-3">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
        <Text className="text-2xl font-semibold text-neutral-600">{data.name.charAt(0)}</Text>
      </View>
      <View className="items-center gap-1">
        <Text className="text-xl font-bold text-neutral-900">{data.name}</Text>
        <Text className="text-xs text-neutral-500">{data.region}</Text>
      </View>
      <View className="flex-row gap-2">
        {data.isAuthStudent === 'true' ? <Badge label="✓ 학교 인증" tone="emerald" /> : null}
        {data.isAuthEmployee === 'true' ? <Badge label="✓ 회사 인증" tone="emerald" /> : null}
        <Badge label="신원 확인" tone="sky" />
      </View>
    </View>
  );
}

function RoomStatus({ data }: { data: MatchDetailData }) {
  const hasRoom = !!data.roomProfileType;
  return (
    <Section title="방 여부">
      <View className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="text-sm text-neutral-600">
          {hasRoom ? `${data.roomProfileType} · ${data.region}` : '아직 방이 없어요'}
        </Text>
      </View>
    </Section>
  );
}

function LifestyleBlock({
  data,
  expanded,
  onToggle,
}: {
  data: MatchDetailData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const items = expanded ? data.lifeStyles : data.lifeStyles.slice(0, 4);
  return (
    <Section title="생활 패턴">
      <View className="flex-row flex-wrap gap-2">
        {items.map((ls) => (
          <View
            key={ls.lifestyleId}
            className="min-w-[47%] flex-1 gap-0.5 rounded-2xl bg-neutral-50 p-3"
          >
            <Text className="text-[11px] text-neutral-500">{ls.name}</Text>
            <Text className="text-sm font-semibold text-neutral-800">{ls.value}</Text>
          </View>
        ))}
      </View>
      {data.lifeStyles.length > 4 ? (
        <Pressable onPress={onToggle} className="items-center py-1">
          <Text className="text-xs text-neutral-500">{expanded ? '접기 ⌃' : '더보기 ⌄'}</Text>
        </Pressable>
      ) : null}
    </Section>
  );
}

function PreferredLivingBlock({ data }: { data: MatchDetailData }) {
  return (
    <Section title="희망 거주 조건">
      <View className="gap-2">
        <KeyVal label="예산 보증금" value={`${data.maxDeposit}만원 이하`} />
        <KeyVal label="예산 월세" value={`${data.maxMounthRent}만원 이하`} />
        <KeyVal label="입주 희망 시기" value={data.comeableAt} />
        <KeyVal label="희망 룸 형태" value={data.roomProfileType} />
        <KeyVal label="희망 지역" value={data.region} />
      </View>
    </Section>
  );
}

function PreferredRoommateBlock({ data }: { data: MatchDetailData }) {
  const conditionText = data.conditions.map((c) => c.name).join(' · ');
  return (
    <Section title="희망 룸메이트 조건">
      <View className="gap-2">
        {data.preferences.map((p) => (
          <KeyVal key={p.preferencesId} label={p.name} value={p.value} />
        ))}
        {conditionText ? <KeyVal label="중요 조건" value={conditionText} /> : null}
      </View>
    </Section>
  );
}

function CompatibilityBlock({ data }: { data: MatchDetailData }) {
  const score = Number(data.compatibility.score) || 0;
  return (
    <Section title="나와 궁합">
      <View className="flex-row items-center gap-4 rounded-2xl border border-neutral-100 p-4">
        <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-[#256EF4]">
          <Text className="text-xl font-bold text-[#256EF4]">{score}점</Text>
        </View>
        <View className="flex-1 gap-2">
          {data.compatibility.lifeStyleInfo.map((info, i) => {
            const pct = Number(info.percent) || 0;
            return (
              <View key={i} className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-neutral-600">{info.title}</Text>
                  <Text className="text-xs font-semibold text-[#256EF4]">{info.percent}점</Text>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                  <View
                    style={{ width: `${Math.min(100, pct)}%` }}
                    className="h-full rounded-full bg-[#256EF4]"
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-neutral-800">{title}</Text>
      {children}
    </View>
  );
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-sm font-semibold text-neutral-800">{value}</Text>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'emerald' | 'sky' }) {
  const cls = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700';
  return (
    <View className={`rounded px-2 py-1 ${cls.split(' ')[0]}`}>
      <Text className={`text-[11px] ${cls.split(' ')[1]}`}>{label}</Text>
    </View>
  );
}
