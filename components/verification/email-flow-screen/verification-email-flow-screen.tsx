import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { VerificationFlowScreen } from '@/components/verification/verification-flow-screen';
import type { VerificationKind } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';

export type VerificationEmailFlowScreenProps = {
  kind: VerificationKind;
  title: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  defaultEmail: string;
  placeholder: string;
};

export function VerificationEmailFlowScreen({
  kind,
  title,
  label,
  iconName,
  defaultEmail,
  placeholder,
}: VerificationEmailFlowScreenProps) {
  const router = useRouter();
  const { session, requireLogin } = useRequireLogin();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Header title={title} onBack={() => router.back()} />
      {session ? (
        <VerificationFlowScreen
          kind={kind}
          title={title}
          label={label}
          iconName={iconName}
          defaultEmail={defaultEmail}
          placeholder={placeholder}
          onDone={() => router.back()}
        />
      ) : (
        <View className="p-5">
          <LoginPromptCard
            title="로그인 후 이메일을 인증할 수 있어요"
            description="인증 결과는 내 프로필의 신뢰 배지에 반영돼요"
            onPress={() => requireLogin(() => undefined)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="h-12 items-center justify-center px-4">
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="absolute left-3 h-8 w-8 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="text-[17px] font-medium leading-[26px] text-[#17171B]">{title}</Text>
    </View>
  );
}
