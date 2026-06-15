import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

import type { UseSupportHomeScreenReturn } from './use-support-home-screen';

export type SupportHomeScreenViewProps = UseSupportHomeScreenReturn;

export function SupportHomeScreenView({
  actions,
  operatingHoursLabel,
}: SupportHomeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="고객센터" />
      <ScrollView contentContainerClassName="gap-8 p-5">
        <View className="gap-2">
          <Text className="text-xl font-bold text-neutral-900">무엇을 도와드릴까요?</Text>
          <Text className="text-sm text-neutral-500">
            자주 묻는 질문을 확인하거나 운영팀에 문의할 수 있어요.
          </Text>
        </View>

        <View className="gap-2">
          {actions.map((action) => (
            <QuickRow key={action.title} {...action} />
          ))}
        </View>

        <View className="gap-3 rounded-lg bg-[#256EF4]/10 p-4">
          <Text className="text-sm font-semibold text-[#256EF4]">운영 시간</Text>
          <Text className="text-sm leading-5 text-[#256EF4]/80">{operatingHoursLabel}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickRow({
  icon,
  title,
  description,
  onPress,
}: UseSupportHomeScreenReturn['actions'][number]) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-neutral-100 py-4 active:bg-neutral-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
        <Ionicons name={icon} size={20} color="#525252" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-neutral-900">{title}</Text>
        <Text className="text-xs text-neutral-400">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D4D4D4" />
    </Pressable>
  );
}
