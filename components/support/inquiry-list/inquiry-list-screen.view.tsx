import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

import type { InquiryListItem, UseInquiryListScreenReturn } from './use-inquiry-list-screen';

export type InquiryListScreenViewProps = UseInquiryListScreenReturn;

export function InquiryListScreenView({
  inquiries,
  publicCount,
  loading,
  error,
  onCreatePress,
}: InquiryListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="문의내역" />

      <ScrollView contentContainerClassName="gap-5 p-5">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-base font-semibold text-neutral-900">
              공개 문의 {publicCount}
            </Text>
            <Text className="text-xs text-neutral-400">문의 상태를 확인해요</Text>
          </View>
          <Pressable
            onPress={onCreatePress}
            className="h-10 flex-row items-center gap-1.5 rounded-full bg-[#256EF4] px-4 active:opacity-90"
          >
            <Ionicons name="create-outline" size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">문의하기</Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-neutral-400">문의내역을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="items-center gap-2 rounded-lg border border-neutral-200 p-8">
            <Text className="text-sm font-semibold text-neutral-800">
              문의내역을 불러오지 못했어요
            </Text>
            <Text className="text-xs text-neutral-400">{error}</Text>
          </View>
        ) : inquiries.length === 0 ? (
          <View className="items-center gap-2 rounded-lg border border-neutral-200 p-8">
            <Text className="text-sm font-semibold text-neutral-800">문의내역이 없어요</Text>
            <Text className="text-xs text-neutral-400">궁금한 점을 운영팀에 남겨주세요</Text>
          </View>
        ) : (
          <View className="gap-3">
            {inquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InquiryCard({ inquiry }: { inquiry: InquiryListItem }) {
  return (
    <View className="gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-semibold text-neutral-900">{inquiry.title}</Text>
        <View
          className={`rounded-full px-2 py-0.5 ${
            inquiry.answered ? 'bg-emerald-50' : 'bg-neutral-100'
          }`}
        >
          <Text
            className={`text-[10px] ${inquiry.answered ? 'text-emerald-700' : 'text-neutral-500'}`}
          >
            {inquiry.statusLabel}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-neutral-500">
        {inquiry.authorName} · {inquiry.dateLabel} · {inquiry.isPublic ? '공개' : '비공개'}
      </Text>
      <Text className="text-sm leading-5 text-neutral-700">{inquiry.body}</Text>

      {inquiry.answer ? (
        <View className="gap-1 rounded-lg bg-neutral-50 p-3">
          <Text className="text-[10px] font-semibold text-[#256EF4]">운영자 답변</Text>
          <Text className="text-sm leading-5 text-neutral-700">{inquiry.answer}</Text>
        </View>
      ) : null}
    </View>
  );
}
