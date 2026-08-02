import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import {
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';

import type {
  UseVerificationHomeScreenReturn,
  VerificationHomeCard,
} from './use-verification-home-screen';

export type VerificationHomeScreenViewProps = UseVerificationHomeScreenReturn;

export function VerificationHomeScreenView({
  cards,
  isLoggedIn,
  loading,
  error,
  onBack,
  onLogin,
  onRetry,
}: VerificationHomeScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Header onBack={onBack} />

      {!isLoggedIn ? (
        <View className="p-5">
          <LoginPromptCard
            title="로그인하고 신원 인증을 시작해보세요"
            description="학교나 회사 이메일을 인증하면 프로필에 신뢰 배지가 표시돼요"
            onPress={onLogin}
          />
        </View>
      ) : loading ? (
        <ReadyLoadingState label="인증 정보를 불러오는 중..." />
      ) : error ? (
        <ReadyErrorState
          title="인증 정보를 불러오지 못했어요"
          description={error}
          onRetry={onRetry}
        />
      ) : (
        <ScrollView contentContainerClassName="gap-5 px-4 pb-28 pt-5">
          <View className="gap-2">
            <Text className="text-xl font-bold text-[#17171B]">인증 방식을 선택해주세요</Text>
            <Text className="text-sm leading-5 text-[#696976]">
              인증 시 프로필에 배지가 표시되며, 상대에게 신뢰를 줄 수 있어요
            </Text>
          </View>

          <View className="gap-3">
            {cards.map((card) => (
              <VerificationCard key={card.id} card={card} />
            ))}
          </View>

          <View className="flex-row items-start gap-3 rounded-md bg-[#E9F0FE] px-4 py-4">
            <Ionicons name="information-circle-outline" size={21} color="#256EF4" />
            <Text className="flex-1 text-sm leading-5 text-[#256EF4]">
              인증 종류별로 각각 배지가 표시돼요{`\n`}하나만 인증해도 배지가 노출돼요
            </Text>
          </View>
        </ScrollView>
      )}

      {isLoggedIn && !loading && !error ? (
        <View className="absolute inset-x-0 bottom-0 bg-white px-4 pb-5 pt-3">
          <View className="h-12 items-center justify-center rounded-lg bg-[#ECECF3]">
            <Text className="text-base font-semibold text-[#AAAABA]">다음으로</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="flex-1 text-center text-base font-medium text-[#17171B]">신원 인증</Text>
      <View className="w-10" />
    </View>
  );
}

function VerificationCard({ card }: { card: VerificationHomeCard }) {
  return (
    <Pressable
      onPress={card.onPress}
      className="min-h-[92px] flex-row items-center gap-4 rounded-md bg-[#F6F6FA] px-5 py-4 active:opacity-80"
    >
      <View className="h-[52px] w-[52px] items-center justify-center bg-[#E1E2EB]">
        <Ionicons name={card.icon} size={25} color="#696976" />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-base font-bold text-[#17171B]">{card.title}</Text>
        <Text numberOfLines={1} className="text-sm text-[#696976]">
          {card.description}
        </Text>
      </View>
      <View className="items-end gap-2">
        <View className={`rounded px-3 py-1 ${card.verified ? 'bg-emerald-50' : 'bg-[#ECECF3]'}`}>
          <Text className={`text-xs ${card.verified ? 'text-emerald-700' : 'text-[#AAAABA]'}`}>
            {card.verified ? '인증완료' : '미인증'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#AAAABA" />
      </View>
    </Pressable>
  );
}
