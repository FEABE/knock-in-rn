import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { UseNoticeDetailScreenReturn } from './use-notice-detail-screen';

export type NoticeDetailScreenViewProps = UseNoticeDetailScreenReturn;

export function NoticeDetailScreenView({
  title,
  dateLabel,
  body,
  loading,
  error,
  retry,
}: NoticeDetailScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="공지사항" />
      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">공지를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="p-5">
          <ReadyErrorState title="공지를 불러오지 못했어요" description={error} onRetry={retry} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-2 p-5">
          <Text className="text-lg font-bold text-neutral-900">{title}</Text>
          <Text className="text-xs text-neutral-400">{dateLabel}</Text>
          <Text className="mt-3 text-sm leading-6 text-neutral-700">{body}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
