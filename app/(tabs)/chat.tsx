import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_USERS, useModeration, useSession } from '@/lib/domain';

export default function ChatScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { isUserBlocked } = useModeration();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">
            채팅 기능은 로그인 후 이용 가능해요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-neutral-100 px-5 pb-3 pt-2">
        <Text className="text-xl font-bold text-neutral-900">채팅</Text>
        <Text className="text-xs text-neutral-400">최대 15개 채팅방</Text>
      </View>

      <ScrollView contentContainerClassName="gap-1 p-2">
        {MOCK_USERS.slice(1, 5)
          .filter((u) => !isUserBlocked(u.id))
          .map((u) => (
          <View
            key={u.id}
            onTouchEnd={() => router.push(`/chat/${u.id}` as never)}
            className="flex-row items-center gap-3 rounded-xl p-3 active:bg-neutral-50"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Text className="font-semibold text-neutral-600">
                {u.name.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold text-neutral-900">
                  {u.name}
                </Text>
                {u.badges.length > 0 ? (
                  <Text className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                    인증
                  </Text>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                className="text-xs text-neutral-500"
              >
                채팅이 시작되었어요. 인사를 건네보세요.
              </Text>
            </View>
            <Text className="text-[10px] text-neutral-400">방금</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
