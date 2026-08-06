import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';

import type { UseTermsScreenReturn } from './use-terms-screen';

export type TermsScreenViewProps = UseTermsScreenReturn;

export function TermsScreenView({
  sections,
  active,
  loading,
  error,
  retry,
  open,
  closeDetail,
}: TermsScreenViewProps) {
  // 전문 화면(3941:49919): 헤더 제목이 약관 이름으로 바뀌고 뒤로가기는 목록으로 돌아간다.
  if (active) {
    const { heading, rest } = splitBodyHeading(active.body);
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <SupportHeader title={active.title} onBack={closeDetail} />
        <ScrollView contentContainerClassName="gap-3 px-4 pb-10 pt-2">
          {heading ? <Text className="text-lg font-bold text-[#17171B]">{heading}</Text> : null}
          <Text className="text-sm leading-6 text-[#3F3F47]">{rest}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="약관 및 정책" />
      <ScrollView contentContainerClassName="px-4 pb-10 pt-2">
        {loading ? (
          <View className="items-center gap-3 p-10">
            <ActivityIndicator color="#256EF4" />
            <Text className="text-sm text-[#AAAABA]">약관을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <ReadyErrorState
            title="약관을 불러오지 못했어요"
            description={error}
            onRetry={retry}
            compact
          />
        ) : sections.length === 0 ? (
          <View className="px-2 py-10">
            <Text className="text-center text-sm text-[#AAAABA]">등록된 약관이 없어요</Text>
          </View>
        ) : (
          sections.map((section) => (
            <Pressable
              key={section.id}
              onPress={() => open(section.id)}
              className="min-h-14 flex-row items-center border-b border-[#ECECF3] py-4 active:bg-[#F6F6FA]"
            >
              <Text className="flex-1 text-[15px] font-semibold text-[#17171B]">
                {section.title}
              </Text>
              <Ionicons name="chevron-forward" size={19} color="#696976" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 약관 본문 첫 줄은 "노크인 이용약관" 같은 문서 제목이다. 굵게 강조해서
 * 보여주려고 첫 줄과 나머지 본문을 분리한다. 줄바꿈이 없으면 그대로 본문 처리한다.
 */
function splitBodyHeading(body: string): { heading: string | null; rest: string } {
  const newlineIndex = body.indexOf('\n');
  if (newlineIndex === -1) return { heading: null, rest: body };
  return {
    heading: body.slice(0, newlineIndex).trim(),
    rest: body.slice(newlineIndex + 1).trimStart(),
  };
}
