import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileCard } from '@/components/domain';
import {
  SegmentedControl,
  Toggle,
} from '@/components/ui/headless';
import { useSession } from '@/lib/domain';

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: '공개 중' },
  { value: 'hidden' as const, label: '숨김' },
  { value: 'matched' as const, label: '매칭 완료' },
];

export default function MyPageScreen() {
  const router = useRouter();
  const { session, signIn, signOut, setVisibility } = useSession();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="border-b border-neutral-100 px-5 pb-3 pt-2">
          <Text className="text-xl font-bold text-neutral-900">마이페이지</Text>
        </View>
        <ScrollView contentContainerClassName="gap-6 p-5">
          <View className="gap-3 rounded-2xl bg-blue-50 p-5">
            <Text className="text-base font-bold text-blue-900">
              로그인하고 노크인을 시작해보세요
            </Text>
            <Text className="text-sm text-blue-900/70">
              생활패턴 기반 룸메이트 매칭 · 학교/회사 이메일 인증
            </Text>
            <Pressable
              onPress={() => signIn()}
              className="self-start rounded-full bg-yellow-300 px-5 py-3 active:opacity-90"
            >
              <Text className="text-sm font-semibold text-neutral-900">
                카카오로 시작하기
              </Text>
            </Pressable>
          </View>

          <MenuSection title="고객센터">
            <MenuRow
              label="문의하기"
              onPress={() => router.push('/support/inquiry' as never)}
            />
            <MenuRow
              label="FAQ"
              onPress={() => router.push('/support/faq' as never)}
            />
            <MenuRow
              label="공지사항"
              onPress={() => router.push('/support/notice' as never)}
            />
          </MenuSection>

          <MenuSection title="약관">
            <MenuRow label="서비스 이용약관" onPress={() => {}} />
            <MenuRow label="개인정보 처리방침" onPress={() => {}} />
          </MenuSection>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-neutral-100 px-5 pb-3 pt-2">
        <Text className="text-xl font-bold text-neutral-900">마이페이지</Text>
      </View>

      <ScrollView contentContainerClassName="gap-6 p-5">
        <ProfileCard
          user={session.user}
          visibility={session.visibility}
          onEdit={() => router.push('/onboarding' as never)}
        />

        <Section title="프로필 노출 상태">
          <SegmentedControl<'public' | 'hidden' | 'matched'>
            options={VISIBILITY_OPTIONS}
            value={session.visibility}
            onValueChange={setVisibility}
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`flex-1 items-center rounded-xl border py-3 ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'text-sm font-medium text-blue-600'
                      : 'text-sm text-neutral-700'
                  }
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Section>

        <Section title="선택 조건">
          <MenuRow
            label="예산 / 입주 시기 / 방 형태 설정"
            onPress={() => router.push('/onboarding' as never)}
          />
        </Section>

        <Section title="신원 인증">
          <MenuRow
            label="학교 이메일 인증"
            onPress={() => router.push('/verification/school' as never)}
            badge={
              session.user.badges.some((b) => b.kind === 'school')
                ? '인증완료'
                : undefined
            }
          />
          <MenuRow
            label="회사 이메일 인증"
            onPress={() => router.push('/verification/company' as never)}
            badge={
              session.user.badges.some((b) => b.kind === 'company')
                ? '인증완료'
                : undefined
            }
          />
        </Section>

        <Section title="내 방 관리">
          <MenuRow
            label="내가 쓴 방 살피기 게시글"
            onPress={() => router.push('/mypage/my-rooms' as never)}
          />
          <MenuRow
            label="공동생활 합의서"
            onPress={() => router.push('/mypage/agreement' as never)}
          />
        </Section>

        <Section title="안전">
          <MenuRow
            label="차단 / 신고 관리"
            onPress={() => router.push('/mypage/blocked' as never)}
          />
        </Section>

        <Section title="알림">
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <Text className="text-sm text-neutral-800">푸시 알림 수신</Text>
            <Toggle defaultChecked>
              {({ checked }) => (
                <View
                  className={`h-7 w-12 flex-row items-center rounded-full px-1 ${
                    checked ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <View
                    className={`h-5 w-5 rounded-full bg-white ${
                      checked ? 'ml-5' : 'ml-0'
                    }`}
                  />
                </View>
              )}
            </Toggle>
          </View>
        </Section>

        <Section title="고객센터">
          <MenuRow
            label="문의하기"
            onPress={() => router.push('/support/inquiry' as never)}
          />
          <MenuRow
            label="FAQ"
            onPress={() => router.push('/support/faq' as never)}
          />
          <MenuRow
            label="공지사항"
            onPress={() => router.push('/support/notice' as never)}
          />
        </Section>

        <Section title="계정">
          <MenuRow
            label="약관 확인"
            onPress={() => router.push('/support/terms' as never)}
          />
          <MenuRow
            label="로그아웃"
            onPress={() => {
              Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
                { text: '취소', style: 'cancel' },
                {
                  text: '로그아웃',
                  onPress: () => {
                    signOut();
                    router.replace('/');
                  },
                  style: 'destructive',
                },
              ]);
            }}
          />
          <MenuRow
            label="회원 탈퇴"
            onPress={() => {
              Alert.alert('회원 탈퇴', '정말로 탈퇴하시겠어요?', [
                { text: '취소', style: 'cancel' },
                {
                  text: '탈퇴',
                  onPress: () => {
                    signOut();
                    router.replace('/');
                  },
                  style: 'destructive',
                },
              ]);
            }}
            danger
          />
        </Section>
      </ScrollView>
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
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {children}
      </View>
    </View>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return <Section title={title}>{children}</Section>;
}

function MenuRow({
  label,
  onPress,
  badge,
  danger,
}: {
  label: string;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3.5 last:border-b-0 active:bg-neutral-50"
    >
      <Text
        className={`text-sm ${
          danger ? 'text-red-500' : 'text-neutral-800'
        }`}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {badge ? (
          <Text className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
            {badge}
          </Text>
        ) : null}
        <Text className="text-neutral-300">›</Text>
      </View>
    </Pressable>
  );
}
