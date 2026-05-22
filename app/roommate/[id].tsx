import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MOCK_ROOMMATE_CARDS,
  useModeration,
  useSession,
} from '@/lib/domain';
import { IMPORTANT_CONDITIONS } from '@/lib/onboarding';

export default function RoommateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, signIn } = useSession();
  const { blockUser, report, isUserBlocked } = useModeration();
  const [liked, setLiked] = useState(false);

  const card = useMemo(
    () =>
      MOCK_ROOMMATE_CARDS.find((c) => c.id === id) ?? MOCK_ROOMMATE_CARDS[0],
    [id],
  );
  const u = card.user;
  const blocked = isUserBlocked(u.id);

  const conditionLabels = u.importantConditions
    .map((id) => IMPORTANT_CONDITIONS.find((c) => c.id === id)?.label)
    .filter(Boolean) as string[];

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
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('차단/신고', '', [
              { text: '취소', style: 'cancel' },
              {
                text: '신고하기',
                onPress: () => {
                  report({ kind: 'user', id: u.id }, '부적절한 사용자');
                  Alert.alert('신고 접수 완료');
                },
              },
              {
                text: '차단하기',
                style: 'destructive',
                onPress: () => {
                  blockUser(u.id);
                  Alert.alert('차단되었어요', '', [
                    { text: '확인', onPress: () => router.back() },
                  ]);
                },
              },
            ])
          }
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-xl text-neutral-700">⋯</Text>
        </Pressable>
      </View>

      {blocked ? (
        <View className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm font-semibold text-red-700">
            차단한 사용자에요
          </Text>
          <Text className="mt-1 text-xs text-red-700/80">
            상호 비노출 처리됩니다. 채팅도 불가합니다.
          </Text>
        </View>
      ) : null}
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-24">
        <View className="items-center gap-3">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
            <Text className="text-2xl font-semibold text-neutral-600">
              {u.name.charAt(0)}
            </Text>
          </View>
          <View className="items-center gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold text-neutral-900">
                {u.name}
              </Text>
              <Text className="text-sm text-neutral-500">
                {u.age}세 · {labelGender(u.gender)}
              </Text>
            </View>
            <Text className="text-xs text-neutral-500">
              {u.region.city} {u.region.district}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {u.badges.length === 0 ? (
              <Text className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-400">
                인증 없음
              </Text>
            ) : (
              u.badges.map((b) => (
                <Text
                  key={b.kind}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                >
                  {b.kind === 'school' ? '🎓 학교 인증' : '🏢 회사 인증'}
                </Text>
              ))
            )}
          </View>
          {typeof card.compatibilityScore === 'number' ? (
            <View className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2">
              <Text className="text-sm font-semibold text-blue-700">
                궁합 점수 {card.compatibilityScore}점
              </Text>
            </View>
          ) : null}
        </View>

        <Section title="한 줄 소개">
          <Text className="text-sm leading-6 text-neutral-700">{u.bio}</Text>
        </Section>

        <Section title="생활 패턴">
          <View className="gap-2">
            <Row
              label="취침 / 기상"
              value={`${u.lifestyle.sleepTime ?? '-'} / ${u.lifestyle.wakeTime ?? '-'}`}
            />
            <Row
              label="청결 민감도"
              value={`${u.lifestyle.cleanliness ?? '-'} / 5`}
            />
            <Row
              label="소음 민감도"
              value={`${u.lifestyle.noise ?? '-'} / 5`}
            />
            <Row
              label="흡연"
              value={
                u.lifestyle.smoking === 'no'
                  ? '비흡연'
                  : u.lifestyle.smoking === 'outdoor'
                    ? '실외 흡연'
                    : '흡연'
              }
            />
            <Row
              label="반려동물"
              value={
                u.lifestyle.pet === 'no'
                  ? '없음'
                  : u.lifestyle.pet === 'small'
                    ? '소형만'
                    : '제한 없음'
              }
            />
          </View>
        </Section>

        <Section title="중요 조건">
          <View className="flex-row flex-wrap gap-2">
            {conditionLabels.map((label) => (
              <Text
                key={label}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700"
              >
                {label}
              </Text>
            ))}
          </View>
        </Section>

        <Section title="희망 조건">
          <View className="gap-2">
            {card.budgetMin !== undefined &&
            card.budgetMax !== undefined ? (
              <Row
                label="예산"
                value={`${card.budgetMin}~${card.budgetMax}만원`}
              />
            ) : null}
            {card.moveInBy ? (
              <Row
                label="입주 희망"
                value={`${card.moveInBy.getFullYear()}.${String(card.moveInBy.getMonth() + 1).padStart(2, '0')}`}
              />
            ) : null}
            <Row
              label="희망 지역"
              value={card.preferredRegions
                .map((r) => `${r.city} ${r.district}`)
                .join(', ')}
            />
          </View>
        </Section>
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
          onPress={() =>
            requireLogin(() => router.push(`/chat/${u.id}` as never))
          }
          className="h-12 flex-1 items-center justify-center rounded-xl bg-blue-600 active:opacity-90"
        >
          <Text className="text-sm font-semibold text-white">
            1:1 대화 요청
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-800">{value}</Text>
    </View>
  );
}

function labelGender(g: string): string {
  return g === 'female' ? '여성' : g === 'male' ? '남성' : '기타';
}
