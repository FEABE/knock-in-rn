import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  UseVerificationHomeScreenReturn,
  VerificationHomeCard,
} from './use-verification-home-screen';

export type VerificationHomeScreenViewProps = UseVerificationHomeScreenReturn;

export function VerificationHomeScreenView({ cards, onBack }: VerificationHomeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404040" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">신원 인증</Text>
      </View>

      <ScrollView contentContainerClassName="gap-5 p-5">
        <View className="gap-2">
          <Text className="text-xl font-bold text-neutral-900">신뢰 배지를 추가해보세요</Text>
          <Text className="text-sm leading-5 text-neutral-500">
            학교 또는 회사 이메일로 인증하면 프로필에 배지가 표시되고 상대방에게 신뢰를 줄 수
            있어요.
          </Text>
        </View>

        {cards.map((card) => (
          <VerificationCard key={card.id} card={card} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function VerificationCard({ card }: { card: VerificationHomeCard }) {
  return (
    <Pressable
      onPress={card.onPress}
      className="gap-4 rounded-lg border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#256EF4]/10">
            <Ionicons name={card.icon} size={20} color="#256EF4" />
          </View>
          <View className="gap-0.5">
            <Text className="text-base font-semibold text-neutral-900">{card.title}</Text>
            <Text className="text-xs text-neutral-500">{card.description}</Text>
          </View>
        </View>
        <StatusPill verified={card.verified} />
      </View>

      <View className="gap-1">
        {card.bullets.map((bullet) => (
          <Text key={bullet} className="text-[11px] text-neutral-400">
            · {bullet}
          </Text>
        ))}
      </View>

      <View className="flex-row items-center justify-between border-t border-neutral-100 pt-3">
        <Text className="text-sm font-semibold text-[#256EF4]">
          {card.verified ? '상태 확인' : '인증하기'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#256EF4" />
      </View>
    </Pressable>
  );
}

function StatusPill({ verified }: { verified: boolean }) {
  return (
    <View className={`rounded-full px-2 py-0.5 ${verified ? 'bg-emerald-50' : 'bg-[#256EF4]/10'}`}>
      <Text className={`text-[10px] ${verified ? 'text-emerald-700' : 'text-[#256EF4]'}`}>
        {verified ? '인증완료' : '미인증'}
      </Text>
    </View>
  );
}
