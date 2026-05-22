import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/domain';

export default function VerificationIndex() {
  const router = useRouter();
  const { session } = useSession();
  const schoolVerified =
    session?.user.badges.some((b) => b.kind === 'school') ?? false;
  const companyVerified =
    session?.user.badges.some((b) => b.kind === 'company') ?? false;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">
          신원 인증
        </Text>
      </View>

      <View className="gap-4 p-5">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            신뢰도를 높여보세요
          </Text>
          <Text className="text-sm text-neutral-500">
            인증 배지가 있는 프로필은 매칭 확률이 높아져요.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/verification/school' as never)}
          className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 active:bg-neutral-50"
        >
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-neutral-900">
              🎓 학교 이메일 인증
            </Text>
            <Text className="text-xs text-neutral-500">
              .ac.kr 도메인 이메일로 학생 인증
            </Text>
          </View>
          {schoolVerified ? (
            <Text className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              인증완료
            </Text>
          ) : (
            <Text className="text-neutral-300">›</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/verification/company' as never)}
          className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 active:bg-neutral-50"
        >
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-neutral-900">
              🏢 회사 이메일 인증
            </Text>
            <Text className="text-xs text-neutral-500">
              회사 도메인 이메일로 직장인 인증
            </Text>
          </View>
          {companyVerified ? (
            <Text className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              인증완료
            </Text>
          ) : (
            <Text className="text-neutral-300">›</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
