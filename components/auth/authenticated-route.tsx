import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/domain';
import { goKakaoLogin } from '@/lib/navigation/routes';

import { LoginPromptCard } from './login-prompt-card';

export function AuthenticatedRoute({
  children,
  title,
  promptTitle = '로그인 후 이용할 수 있어요',
  promptDescription,
}: {
  children: ReactNode;
  title: string;
  promptTitle?: string;
  promptDescription: string;
}) {
  const router = useRouter();
  const { session } = useSession();

  if (session) return children;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center px-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-medium text-[#17171B]">{title}</Text>
        <View className="w-10" />
      </View>
      <View className="p-5">
        <LoginPromptCard
          title={promptTitle}
          description={promptDescription}
          onPress={() => goKakaoLogin(router)}
        />
      </View>
    </SafeAreaView>
  );
}
