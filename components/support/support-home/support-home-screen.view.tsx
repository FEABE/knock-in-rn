import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';
import type { SupportFaqItem } from '@/lib/api';

import type { UseSupportHomeScreenReturn } from './use-support-home-screen';

export type SupportHomeScreenViewProps = UseSupportHomeScreenReturn;

export function SupportHomeScreenView({
  faqs,
  faqsLoading,
  faqsError,
  retryFaqs,
  openFaqIds,
  toggleFaq,
  operatingHoursLabel,
  onInquiryNew,
  onInquiryList,
}: SupportHomeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="고객센터" />
      <ScrollView contentContainerClassName="gap-10 px-4 pb-10 pt-6">
        <View className="gap-2">
          <SectionLabel label="1:1 문의" />
          <View className="rounded-lg bg-[#F6F6FA] px-4 py-5">
            <View className="gap-[3px]">
              <Text className="text-base font-bold leading-6 text-[#17171B]">
                운영팀에게 문의하기
              </Text>
              <Text className="text-[13px] leading-5 text-[#696976]">{operatingHoursLabel}</Text>
            </View>
            <View className="mt-3 flex-row gap-3">
              <ActionButton onPress={onInquiryNew} primary label="문의하기" />
              <ActionButton onPress={onInquiryList} label="문의 내역" />
            </View>
          </View>
        </View>

        {/* 디자인(3746:78520)에서 FAQ는 별도 페이지가 아니라 고객센터 홈 안의 아코디언이다. */}
        <View className="gap-4">
          <SectionLabel label="자주 묻는 질문" />
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
            <View className="gap-3">
              {faqs.map((item) => (
                <FaqRow
                  key={item.id}
                  item={item}
                  open={openFaqIds.includes(item.id)}
                  onToggle={() => toggleFaq(item.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 디자인(3746:78700)의 섹션 제목. 1:1 문의 / 자주 묻는 질문이 같은 스타일을 쓴다. */
function SectionLabel({ label }: { label: string }) {
  return <Text className="text-[15px] font-bold leading-[23px] text-[#696976]">{label}</Text>;
}

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: SupportFaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-3">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="min-h-[26px] flex-row items-center gap-3 active:opacity-70"
      >
        <Text className="flex-1 text-sm font-medium leading-[21px] text-[#17171B]">
          {item.question}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={24} color="#696976" />
      </Pressable>
      {open ? <Text className="text-sm leading-6 text-[#696976]">{item.answer}</Text> : null}
      <View className="h-px w-full bg-[#ECECF3]" />
    </View>
  );
}

function ActionButton({
  onPress,
  label,
  primary,
}: {
  onPress: () => void;
  label: string;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-[42px] flex-1 items-center justify-center rounded-lg active:opacity-85 ${
        primary ? 'bg-[#256EF4]' : 'border border-[#DADAE8] bg-white'
      }`}
    >
      <Text
        className={`text-[15px] leading-[23px] ${
          primary ? 'font-semibold text-white' : 'font-medium text-[#696976]'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
