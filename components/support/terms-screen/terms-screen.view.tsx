import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

import type { UseTermsScreenReturn } from './use-terms-screen';

export type TermsScreenViewProps = UseTermsScreenReturn;

export function TermsScreenView({ sections, activeId, active, setActiveId }: TermsScreenViewProps) {
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
        <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <Text className="text-base font-semibold text-neutral-900">{active.title}</Text>
          <Text className="text-sm leading-7 text-neutral-700">{active.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
