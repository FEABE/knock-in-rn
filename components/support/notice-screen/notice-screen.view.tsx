import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { NoticeListItem, UseNoticeScreenReturn } from './use-notice-screen';

export type NoticeScreenViewProps = UseNoticeScreenReturn;

export function NoticeScreenView({
  notices,
  loading,
  refreshing,
  error,
  unavailable,
  retry,
  onNoticePress,
}: NoticeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="공지사항" />
      <ScrollView
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerClassName="gap-4 pb-10 pt-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={retry} tintColor="#256EF4" />
        }
      >
        {unavailable ? (
          <View className="mx-4 items-center rounded-2xl border border-dashed border-[#DADAE8] p-10">
            <Text className="text-3xl">📢</Text>
            <Text className="mt-3 text-sm font-semibold text-[#17171B]">
              공지사항을 준비하고 있어요
            </Text>
            <Text className="mt-2 text-center text-xs text-[#AAAABA]">
              새로운 소식을 전할 수 있도록 준비 중이에요
            </Text>
          </View>
        ) : loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-[#AAAABA]">공지를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="px-4">
            <ReadyErrorState
              title="공지를 불러오지 못했어요"
              description={error}
              onRetry={retry}
              compact
            />
          </View>
        ) : notices.length === 0 ? (
          <View className="mx-4 rounded-2xl border border-dashed border-[#DADAE8] p-10">
            <Text className="text-center text-sm text-[#AAAABA]">등록된 공지가 없어요</Text>
          </View>
        ) : (
          notices.map((notice) => (
            <NoticeRow key={notice.id} notice={notice} onPress={() => onNoticePress(notice.id)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 디자인(3746:77831)에서 목록 본문은 좌우 16px 여백을 두지만, 행 구분선은 화면 끝까지 이어진다.
 * 그래서 ScrollView에는 가로 패딩을 주지 않고 행 안에서만 px-4를 적용한다.
 */
function NoticeRow({ notice, onPress }: { notice: NoticeListItem; onPress: () => void }) {
  return (
    <View className="gap-3">
      <Pressable onPress={onPress} accessibilityRole="button" className="gap-2 px-4 active:opacity-70">
        <Text numberOfLines={1} className="text-[15px] font-semibold leading-[23px] text-[#17171B]">
          {notice.title}
        </Text>
        <View className="gap-1">
          {notice.bodyPreview ? (
            <Text numberOfLines={2} className="text-[13px] leading-5 text-[#696976]">
              {notice.bodyPreview}
            </Text>
          ) : null}
          <Text className="text-xs leading-[18px] text-[#AAAABA]">{notice.dateLabel}</Text>
        </View>
      </Pressable>
      <View className="h-px w-full bg-[#ECECF3]" />
    </View>
  );
}
