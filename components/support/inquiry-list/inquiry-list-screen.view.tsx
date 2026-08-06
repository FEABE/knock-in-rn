import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      <ScrollView contentContainerClassName="gap-3 p-5">
        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-neutral-400">문의내역을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <ReadyErrorState
            title="문의내역을 불러오지 못했어요"
            description={error}
            onRetry={retry}
            compact
          />
        ) : inquiries.length === 0 ? (
          <View className="items-center gap-2 rounded-lg border border-neutral-200 p-8">
            <Text className="text-sm font-semibold text-neutral-800">문의내역이 없어요</Text>
            <Text className="text-xs text-neutral-400">궁금한 점을 운영팀에 남겨주세요</Text>
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
      className="gap-2 rounded-xl border border-[#ECECF3] bg-white p-4 active:bg-[#F7F7FA]"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="rounded-md border border-[#DADAE8] px-2 py-1">
          <Text className="text-[11px] font-medium text-[#696976]">{inquiry.categoryLabel}</Text>
        </View>
        <StatusBadge answered={inquiry.answered} label={inquiry.statusLabel} />
      </View>

      <Text className="text-[15px] font-bold text-[#17171B]">{inquiry.title}</Text>

      {inquiry.answer ? (
        <View className="gap-1 rounded-lg bg-[#F0F5FF] p-3">
          <Text className="text-xs font-semibold text-[#256EF4]">답변</Text>
          <Text className="text-sm leading-5 text-[#696976]" numberOfLines={2}>
            {inquiry.answer}
          </Text>
        </View>
      ) : null}

      <Text className="text-xs text-[#AAAABA]">{inquiry.dateLabel}</Text>
    </Pressable>
  );
}

function StatusBadge({ answered, label }: { answered: boolean; label: string }) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 ${
        answered ? 'bg-emerald-50' : 'border border-[#DADAE8] bg-white'
      }`}
    >
      <Text
        className={`text-[11px] font-medium ${answered ? 'text-emerald-700' : 'text-[#696976]'}`}
      >
        {label}
      </Text>
    </View>
  );
}
