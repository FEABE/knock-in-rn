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
  bodyUnavailable,
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
          <Text className="text-sm text-[#AAAABA]">공지를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="px-4 pt-5">
          <ReadyErrorState title="공지를 불러오지 못했어요" description={error} onRetry={retry} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-4 pb-10 pt-5">
          <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">{title}</Text>
          <Text className="mt-[6px] text-xs leading-[18px] text-[#AAAABA]">{dateLabel}</Text>
          {bodyUnavailable ? (
            <View className="mt-3">
              <ReadyErrorState
                title="공지 본문을 불러오지 못했어요"
                description="잠시 후 다시 시도해주세요."
                onRetry={retry}
                compact
              />
            </View>
          ) : (
            <Text className="mt-3 text-sm leading-[21px] text-[#17171B]">{body}</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
