import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { UseNoticeScreenReturn } from './use-notice-screen';

export type NoticeScreenViewProps = UseNoticeScreenReturn;

export function NoticeScreenView({
  notices,
  loading,
  error,
  unavailable,
  retry,
  onNoticePress,
}: NoticeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="공지사항" />
      <ScrollView contentContainerClassName="gap-3 p-5">
        {unavailable ? (
          <View className="items-center rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-3xl">📢</Text>
            <Text className="mt-3 text-sm font-semibold text-neutral-700">
              공지사항을 준비하고 있어요
            </Text>
            <Text className="mt-2 text-center text-xs text-neutral-400">
              새로운 소식을 전할 수 있도록 준비 중이에요
            </Text>
          </View>
        ) : loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-neutral-400">공지를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <ReadyErrorState
            title="공지를 불러오지 못했어요"
            description={error}
            onRetry={retry}
            compact
          />
        ) : notices.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">등록된 공지가 없어요</Text>
          </View>
        ) : (
          notices.map((notice) => (
            <Pressable
              key={notice.id}
              onPress={() => onNoticePress(notice.id)}
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 active:opacity-80"
            >
              <View className="flex-1 gap-2">
                <Text className="text-base font-semibold text-neutral-900">{notice.title}</Text>
                <Text className="text-xs text-neutral-400">{notice.dateLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AAAABA" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
