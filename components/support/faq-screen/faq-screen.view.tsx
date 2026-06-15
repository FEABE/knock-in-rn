import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

import type { UseFaqScreenReturn } from './use-faq-screen';

export type FaqScreenViewProps = UseFaqScreenReturn;

export function FaqScreenView({ items, openId, toggle }: FaqScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="자주 묻는 질문" />
      <ScrollView contentContainerClassName="gap-2 p-5">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <View key={item.id} className="overflow-hidden rounded-2xl border border-neutral-200">
              <Pressable
                onPress={() => toggle(item.id)}
                className="flex-row items-center justify-between px-4 py-4 active:bg-neutral-50"
              >
                <View className="flex-1 flex-row items-start gap-2 pr-3">
                  <Text className="text-[#256EF4]">Q.</Text>
                  <Text className="flex-1 text-sm font-medium text-neutral-900">
                    {item.question}
                  </Text>
                </View>
                <Text className="text-neutral-400">{open ? '▴' : '▾'}</Text>
              </Pressable>
              {open ? (
                <View className="gap-2 border-t border-neutral-100 bg-neutral-50 px-4 py-4">
                  <View className="flex-row items-start gap-2">
                    <Text className="text-neutral-400">A.</Text>
                    <Text className="flex-1 text-sm leading-6 text-neutral-700">{item.answer}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
