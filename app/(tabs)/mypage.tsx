import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Toggle } from '@/components/ui/headless';
import { useSession } from '@/lib/domain';

export default function MyPageScreen() {
  const router = useRouter();
  const { session, signIn, signOut } = useSession();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-5 pb-3 pt-2">
          <Text className="text-2xl font-bold text-neutral-900">마이</Text>
        </View>
        <View className="gap-3 p-5">
          <View className="gap-3 rounded-2xl bg-[#256EF4]/10 p-5">
            <Text className="text-base font-bold text-[#256EF4]">
              로그인하고 노크인을 시작해보세요
            </Text>
            <Text className="text-sm text-[#256EF4]/70">
              생활패턴 기반 룸메이트 매칭 · 학교/회사 이메일 인증
            </Text>
            <Pressable
              onPress={() => signIn()}
              className="self-start rounded-full bg-yellow-300 px-5 py-3 active:opacity-90"
            >
              <Text className="text-sm font-semibold text-neutral-900">카카오로 시작하기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const u = session.user;
  const verified = u.badges.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">마이</Text>
      </View>

      <ScrollView contentContainerClassName="gap-5 p-5">
        {/* 프로필 카드 */}
        <View className="gap-4 rounded-2xl border border-neutral-200 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#256EF4]/15">
              <Text className="text-lg font-semibold text-[#256EF4]">{u.name.charAt(0)}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold text-neutral-900">{u.name}</Text>
              <Text className="text-xs text-neutral-500">
                {u.age}세 · {u.gender === 'female' ? '여성' : '남성'} · {u.region.city}{' '}
                {u.region.district}
              </Text>
              <View className="mt-0.5 flex-row gap-1.5">
                <Tag label="방 없어요" />
                {verified ? <Tag label="🎓 학교 인증" tone="emerald" /> : null}
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
            <View>
              <Text className="text-sm font-medium text-neutral-800">프로필 공개</Text>
              <Text className="text-xs text-neutral-400">룸메이트 매칭 탭에 노출 중이에요</Text>
            </View>
            <Toggle defaultChecked>
              {({ checked }) => (
                <View
                  className={`h-7 w-12 justify-center rounded-full px-1 ${
                    checked ? 'bg-[#256EF4]' : 'bg-neutral-300'
                  }`}
                >
                  <View className={`h-5 w-5 rounded-full bg-white ${checked ? 'ml-5' : 'ml-0'}`} />
                </View>
              )}
            </Toggle>
          </View>
        </View>

        {/* 매칭 설정 */}
        <Section title="매칭 설정">
          <Row
            icon="👤"
            label="내 프로필"
            sub="생활패턴 · 방 조건 수정"
            onPress={() => router.push('/mypage/profile' as never)}
          />
          <Row
            icon="☆"
            label="선호 조건 (Phase 2)"
            sub="원하는 룸메이트 조건 설정"
            onPress={() => router.push('/mypage/preferences' as never)}
          />
          <Row
            icon="🏠"
            label="내 방 관리"
            sub="방 게시글 등록 · 수정"
            onPress={() => router.push('/mypage/my-rooms' as never)}
            last
          />
        </Section>

        {/* 계정 */}
        <Section title="계정">
          <Row
            icon="🔒"
            label="신원 인증"
            sub="학교 · 회사 이메일 인증"
            badge={verified ? undefined : '미인증'}
            onPress={() => router.push('/verification' as never)}
          />
          <View className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
            <Text className="text-lg">🔔</Text>
            <Text className="flex-1 text-sm text-neutral-800">알림</Text>
            <Toggle defaultChecked>
              {({ checked }) => (
                <View
                  className={`h-7 w-12 justify-center rounded-full px-1 ${
                    checked ? 'bg-[#256EF4]' : 'bg-neutral-300'
                  }`}
                >
                  <View className={`h-5 w-5 rounded-full bg-white ${checked ? 'ml-5' : 'ml-0'}`} />
                </View>
              )}
            </Toggle>
          </View>
          <Row
            icon="❓"
            label="고객센터"
            onPress={() => router.push('/support/inquiry' as never)}
          />
          <Row
            icon="⚙"
            label="계정 설정"
            onPress={() =>
              Alert.alert('계정 설정', '', [
                { text: '약관 확인', onPress: () => router.push('/support/terms' as never) },
                {
                  text: '로그아웃',
                  style: 'destructive',
                  onPress: () => {
                    signOut();
                    router.replace('/');
                  },
                },
                { text: '닫기', style: 'cancel' },
              ])
            }
            last
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-neutral-400">{title}</Text>
      <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  sub,
  badge,
  onPress,
  last,
}: {
  icon: string;
  label: string;
  sub?: string;
  badge?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-50 ${
        last ? '' : 'border-b border-neutral-100'
      }`}
    >
      <Text className="text-lg">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm text-neutral-800">{label}</Text>
        {sub ? <Text className="text-xs text-neutral-400">{sub}</Text> : null}
      </View>
      {badge ? (
        <Text className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">
          {badge}
        </Text>
      ) : null}
      <Text className="text-neutral-300">›</Text>
    </Pressable>
  );
}

function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'emerald' }) {
  const cls =
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500';
  return (
    <View className={`rounded px-2 py-0.5 ${cls.split(' ')[0]}`}>
      <Text className={`text-[10px] ${cls.split(' ')[1]}`}>{label}</Text>
    </View>
  );
}
