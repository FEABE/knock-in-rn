import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { UseTermsScreenReturn } from './use-terms-screen';

export type TermsScreenViewProps = UseTermsScreenReturn;

export function TermsScreenView({
  sections,
  activeId,
  active,
  loading,
  error,
  retry,
  setActiveId,
}: TermsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="약관 및 정책" />
      <View className="flex-row gap-2 border-b border-neutral-100 px-5 py-3">
        {sections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => setActiveId(section.id)}
            className={`rounded-full border px-3 py-1.5 ${
              activeId === section.id
                ? 'border-[#256EF4] bg-[#256EF4]'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <Text
              className={
                activeId === section.id
                  ? 'text-xs font-medium text-white'
                  : 'text-xs text-neutral-700'
              }
            >
              {section.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerClassName="p-5">
        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-neutral-400">약관을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <ReadyErrorState
            title="약관을 불러오지 못했어요"
            description={error}
            onRetry={retry}
            compact
          />
        ) : active ? (
          <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <Text className="text-base font-semibold text-neutral-900">{active.title}</Text>
            <Text className="text-sm leading-7 text-neutral-700">{active.body}</Text>
          </View>
        ) : (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-8">
            <Text className="text-center text-sm text-neutral-400">등록된 약관이 없어요</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
