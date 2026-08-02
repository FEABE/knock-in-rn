import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { SupportHomeAction, UseSupportHomeScreenReturn } from './use-support-home-screen';

export type SupportHomeScreenViewProps = UseSupportHomeScreenReturn;

export function SupportHomeScreenView({
  actions,
  faqs,
  faqsLoading,
  faqsError,
  retryFaqs,
  operatingHoursLabel,
}: SupportHomeScreenViewProps) {
  const inquiry = findAction(actions, '문의하기');
  const inquiries = findAction(actions, '문의내역');
  const faq = findAction(actions, '자주 묻는 질문');
  const notice = findAction(actions, '공지사항');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="고객센터" />
      <ScrollView contentContainerClassName="gap-7 px-4 pb-10 pt-5">
        <View className="gap-3">
          <Text className="text-sm font-semibold text-[#696976]">1:1 문의</Text>
          <View className="rounded-md bg-[#F6F6FA] p-4">
            <Text className="text-base font-bold text-[#17171B]">운영팀에게 문의하기</Text>
            <Text className="mt-1 text-sm text-[#696976]">{operatingHoursLabel}</Text>
            <View className="mt-4 flex-row gap-3">
              <ActionButton action={inquiry} primary label="문의하기" />
              <ActionButton action={inquiries} label="문의 내역" />
            </View>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-[#696976]">자주 묻는 질문</Text>
            <Pressable onPress={faq?.onPress} hitSlop={8}>
              <Text className="text-xs text-[#AAAABA]">전체보기</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            {faqsLoading ? (
              <View className="rounded-md bg-[#F6F6FA] px-4 py-4">
                <Text className="text-sm text-[#AAAABA]">질문을 불러오는 중...</Text>
              </View>
            ) : faqsError ? (
              <ReadyErrorState
                title="질문을 불러오지 못했어요"
                description={faqsError}
                onRetry={retryFaqs}
                compact
                className="rounded-md bg-[#F6F6FA]"
              />
            ) : faqs.length === 0 ? (
              <View className="rounded-md bg-[#F6F6FA] px-4 py-4">
                <Text className="text-sm text-[#AAAABA]">등록된 질문이 없어요</Text>
              </View>
            ) : (
              faqs.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={faq?.onPress}
                  className="min-h-11 flex-row items-center rounded-md bg-[#F6F6FA] px-4 py-3 active:opacity-80"
                >
                  <Text numberOfLines={1} className="flex-1 text-sm text-[#3F3F47]">
                    {item.question}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#AAAABA" />
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-[#696976]">공지사항</Text>
          <Pressable
            onPress={notice?.onPress}
            className="flex-row items-center rounded-md bg-[#F6F6FA] px-4 py-4 active:opacity-80"
          >
            <View className="flex-1 gap-1">
              <Text className="text-sm font-bold text-[#17171B]">노크인 서비스 소식</Text>
              <Text className="text-xs text-[#AAAABA]">공지사항에서 최신 내용을 확인해주세요</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#AAAABA" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function findAction(actions: SupportHomeAction[], title: string) {
  return actions.find((action) => action.title === title);
}

function ActionButton({
  action,
  label,
  primary,
}: {
  action?: SupportHomeAction;
  label: string;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={action?.onPress}
      disabled={!action}
      className={`h-11 flex-1 items-center justify-center rounded-md border active:opacity-85 ${
        primary ? 'border-[#256EF4] bg-[#256EF4]' : 'border-[#AAAABA] bg-white'
      }`}
    >
      <Text className={`text-sm font-semibold ${primary ? 'text-white' : 'text-[#696976]'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
