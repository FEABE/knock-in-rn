import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

import type { UseNoticeScreenReturn } from './use-notice-screen';

export type NoticeScreenViewProps = UseNoticeScreenReturn;

export function NoticeScreenView({ notices, loading, error }: NoticeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="공지사항" />
      <ScrollView contentContainerClassName="gap-3 p-5">
        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-neutral-400">공지를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-500">공지를 불러오지 못했어요</Text>
            <Text className="mt-2 text-center text-xs text-neutral-400">{error}</Text>
          </View>
        ) : notices.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">등록된 공지가 없어요</Text>
          </View>
        ) : (
          notices.map((notice) => (
            <View
              key={notice.id}
              className="gap-2 rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <Text className="text-base font-semibold text-neutral-900">{notice.title}</Text>
              <Text className="text-xs text-neutral-400">{notice.dateLabel}</Text>
              <Text className="text-sm leading-6 text-neutral-700">{notice.body}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
