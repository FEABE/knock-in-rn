import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text className="text-sm text-neutral-400">문의를 불러오는 중...</Text>
        </View>
      ) : error || !inquiry ? (
        <ReadyErrorState
          title="문의를 불러오지 못했어요"
          description={error ?? '잠시 후 다시 시도해주세요.'}
          onRetry={retry}
          className="m-5"
        />
      ) : (
        <ScrollView contentContainerClassName="gap-4 p-5">
          <View className="flex-row items-center gap-2">
            <View className="rounded-md border border-[#DADAE8] px-2 py-1">
              <Text className="text-[11px] font-medium text-[#696976]">
                {inquiry.categoryLabel}
              </Text>
            </View>
            <View
              className={`rounded-full px-2 py-0.5 ${
                inquiry.answered ? 'bg-emerald-50' : 'border border-[#DADAE8] bg-white'
              }`}
            >
              <Text
                className={`text-[11px] font-medium ${
                  inquiry.answered ? 'text-emerald-700' : 'text-[#696976]'
                }`}
              >
                {inquiry.statusLabel}
              </Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-[#17171B]">{inquiry.title}</Text>

          {inquiry.answer ? (
            <View className="gap-2 rounded-lg bg-[#F0F5FF] p-4">
              <Text className="text-sm font-semibold text-[#256EF4]">답변</Text>
              <Text className="text-sm leading-6 text-[#3A3A44]">{inquiry.answer}</Text>
            </View>
          ) : (
            <View className="gap-1 rounded-lg bg-[#F6F6FA] p-4">
              <Text className="text-sm text-[#696976]">
                아직 답변이 등록되지 않았어요. 평균 응답 시간은 1~2 영업일이에요.
              </Text>
            </View>
          )}

          <Text className="text-xs text-[#AAAABA]">{inquiry.dateLabel}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
