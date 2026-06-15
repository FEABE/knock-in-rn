import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VerificationFlowScreen } from '@/components/verification/verification-flow-screen';
import type { VerificationKind } from '@/lib/api';

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Header title={title} onBack={() => router.back()} />
      <VerificationFlowScreen
        kind={kind}
        title={title}
        label={label}
        iconName={iconName}
        defaultEmail={defaultEmail}
        placeholder={placeholder}
        onDone={() => router.back()}
      />
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404040" />
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">{title}</Text>
    </View>
  );
}
