import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';

const SECTIONS = [
  {
    id: 'tos',
    title: '서비스 이용약관',
    body: `제1조 (목적)\n본 약관은 노크인(이하 "회사")이 제공하는 룸메이트 매칭 서비스(이하 "서비스") 이용에 관한 사항을 규정합니다.\n\n제2조 (책임 범위)\n회사는 매칭 알고리즘 및 정보 노출 도구를 제공할 뿐, 실제 입주 계약/거주 분쟁에 대해서는 책임을 지지 않습니다.\n\n제3조 (회원 의무)\n회원은 허위 정보 등록, 사기, 타인 사칭 행위를 금지합니다. 위반 시 서비스 이용이 제한될 수 있습니다.`,
  },
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    body: `제1조 (수집 항목)\n노크인은 다음 정보를 수집합니다: 이름, 생년월일, 성별, 연락처, 학교/회사 이메일(인증 시), 생활패턴 응답.\n\n제2조 (이용 목적)\n수집된 정보는 룸메이트 매칭 추천, 신원 인증 배지 부여, 신고 처리 목적으로만 사용됩니다.\n\n제3조 (보관 기간)\n회원 탈퇴 시 즉시 파기합니다. 신원 인증 서류는 인증 완료 후 30일 보관 후 파기합니다.`,
  },
  {
    id: 'community',
    title: '운영 정책',
    body: `1. 욕설/혐오 표현, 차별적 발언은 금지됩니다.\n2. 허위 매물 등록 시 영구 이용 정지 처리됩니다.\n3. 반복적인 신고가 누적되면 활동이 제한될 수 있습니다.\n4. 안전과 무관한 단순 분쟁의 경우 입주 전 공동생활 합의서 작성을 권장합니다.`,
  },
];

export default function TermsScreen() {
  const [activeId, setActiveId] = useState<string>('tos');
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <SupportHeader title="약관 및 정책" />
      <View className="flex-row gap-2 border-b border-neutral-100 px-5 py-3">
        {SECTIONS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setActiveId(s.id)}
            className={`rounded-full border px-3 py-1.5 ${
              activeId === s.id
                ? 'border-blue-600 bg-blue-600'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <Text
              className={
                activeId === s.id
                  ? 'text-xs font-medium text-white'
                  : 'text-xs text-neutral-700'
              }
            >
              {s.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerClassName="p-5">
        <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <Text className="text-base font-semibold text-neutral-900">
            {active.title}
          </Text>
          <Text className="text-sm leading-7 text-neutral-700">
            {active.body}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
