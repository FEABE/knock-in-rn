import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmailVerificationForm } from '@/components/verification/email-verification-form';

export default function CompanyVerificationScreen() {
  const router = useRouter();

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
          회사 이메일 인증
        </Text>
      </View>

      <View className="flex-1 p-5">
        <EmailVerificationForm
          title="회사 이메일을 입력해주세요"
          description="회사 도메인 이메일로 직장인 인증을 진행해요. 1일 이내 처리돼요."
          emailPlaceholder="name@company.com"
          onVerified={() => {
            Alert.alert('인증 요청 완료', '심사가 완료되면 배지가 부여돼요.');
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
