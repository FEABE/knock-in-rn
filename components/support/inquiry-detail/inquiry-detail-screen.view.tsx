import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InquiryCategoryChip, InquiryStatusChip } from '@/components/support/inquiry-chip';
import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { UseInquiryDetailScreenReturn } from './use-inquiry-detail-screen';

export type InquiryDetailScreenViewProps = UseInquiryDetailScreenReturn;

export function InquiryDetailScreenView({
  inquiry,
  loading,
  error,
  retry,
}: InquiryDetailScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="문의 내역" />

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">문의를 불러오는 중...</Text>
        </View>
      ) : error || !inquiry ? (
        <ReadyErrorState
          title="문의를 불러오지 못했어요"
          description={error ?? '잠시 후 다시 시도해주세요.'}
          onRetry={retry}
          className="m-5"
        />
      ) : (
        <ScrollView contentContainerClassName="px-4 pb-10 pt-6">
          <View className="gap-2">
            {/* 디자인(3952:51727)에서 두 뱃지는 붙어 있지 않고 카드 좌우 끝으로 벌어진다. */}
            <View className="flex-row items-center justify-between gap-2">
              <InquiryCategoryChip label={inquiry.categoryLabel} />
              <InquiryStatusChip answered={inquiry.answered} label={inquiry.statusLabel} />
            </View>

            <Text className="text-base font-bold leading-6 text-[#17171B]">{inquiry.title}</Text>
          </View>

          <View className="mt-3 gap-[6px]">
            {inquiry.answer ? (
              <View className="gap-1 rounded-lg bg-[#F6F9FF] p-4">
                <Text className="text-sm font-semibold leading-[21px] text-[#256EF4]">답변</Text>
                <Text className="text-justify text-sm leading-[22px] text-[#17171B]">
                  {inquiry.answer}
                </Text>
              </View>
            ) : (
              <View className="rounded-lg bg-[#F6F6FA] p-4">
                <Text className="text-sm leading-[21px] text-[#696976]">
                  아직 답변이 등록되지 않았어요. 평균 응답 시간은 1~2 영업일이에요.
                </Text>
              </View>
            )}

            <Text className="text-xs leading-[18px] text-[#AAAABA]">{inquiry.dateLabel}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
