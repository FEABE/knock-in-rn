import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InquiryCategoryChip, InquiryStatusChip } from '@/components/support/inquiry-chip';
import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { InquiryListItem, UseInquiryListScreenReturn } from './use-inquiry-list-screen';

export type InquiryListScreenViewProps = UseInquiryListScreenReturn;

export function InquiryListScreenView({
  inquiries,
  loading,
  error,
  retry,
  onItemPress,
}: InquiryListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="문의 내역" />

      {/* 디자인(3746:78781)에서 헤더 아래 본문 영역 배경은 흰색이 아니라 #F6F6FA다. */}
      <ScrollView className="flex-1 bg-[#F6F6FA]" contentContainerClassName="gap-4 px-4 pb-10 pt-5">
        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-[#AAAABA]">문의내역을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <ReadyErrorState
            title="문의내역을 불러오지 못했어요"
            description={error}
            onRetry={retry}
            compact
          />
        ) : inquiries.length === 0 ? (
          <View className="items-center gap-2 rounded-lg bg-white p-8">
            <Text className="text-sm font-semibold text-[#17171B]">문의내역이 없어요</Text>
            <Text className="text-xs text-[#AAAABA]">궁금한 점을 운영팀에 남겨주세요</Text>
          </View>
        ) : (
          inquiries.map((inquiry) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              onPress={() => onItemPress(inquiry.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function InquiryCard({ inquiry, onPress }: { inquiry: InquiryListItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="gap-3 rounded-lg bg-white p-[14px] active:opacity-80"
    >
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <InquiryCategoryChip label={inquiry.categoryLabel} />
          <InquiryStatusChip answered={inquiry.answered} label={inquiry.statusLabel} />
        </View>

        <Text className="text-base font-bold leading-6 text-[#17171B]">{inquiry.title}</Text>
      </View>

      <View className="gap-2">
        {inquiry.answer ? (
          <View className="gap-[2px] rounded-lg bg-[#F6F9FF] p-3">
            <Text className="text-[13px] font-semibold leading-5 text-[#256EF4]">답변</Text>
            <Text className="text-[13px] leading-5 text-[#696976]" numberOfLines={2}>
              {inquiry.answer}
            </Text>
          </View>
        ) : null}

        <Text className="text-xs leading-[18px] text-[#AAAABA]">{inquiry.dateLabel}</Text>
      </View>
    </Pressable>
  );
}
