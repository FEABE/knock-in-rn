import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { ReadyErrorState, ReadyLoadingState } from '@/components/ui/ready-to-dev-feedback';
import { CompanyBadgeArtwork, SchoolBadgeArtwork } from '@/components/ui/ready-to-dev-assets';

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
        <ScrollView contentContainerClassName="px-4 pb-10 pt-6">
          <View className="gap-2">
            <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
              인증할 항목을 선택해주세요
            </Text>
            <Text className="text-sm leading-[21px] text-[#696976]">
              인증을 완료하면 프로필에 뱃지가 표시되어 신뢰를 높일 수 있어요
            </Text>
          </View>

          <View className="mt-6 gap-3">
            {cards.map((card) => (
              <VerificationCard key={card.id} card={card} onPress={card.onPress} />
            ))}
          </View>

          <View className="mt-3 flex-row items-start gap-2 rounded-lg bg-[#FFF3DB] py-3 pl-[14px] pr-3">
            <Ionicons name="information-circle-outline" size={18} color="#9E6A00" />
            <Text className="flex-1 text-xs font-medium leading-[18px] text-[#9E6A00]">
              인증 종류별로 뱃지가 표시되며, 하나만 인증해도 프로필에 노출돼요
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="flex-1 text-center text-[17px] font-medium text-[#17171B]">신원 인증</Text>
      <View className="w-10" />
    </View>
  );
}

function VerificationCard({ card, onPress }: { card: VerificationHomeCard; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between gap-3 rounded-lg bg-[#F6F6FA] px-4 py-5 active:opacity-80"
    >
      <View className="flex-1 gap-[6px]">
        <View className="flex-row items-center gap-2">
          {card.id === 'school' ? (
            <SchoolBadgeArtwork size={28} />
          ) : (
            <CompanyBadgeArtwork size={26} />
          )}
          <Text className="text-[17px] font-bold leading-[26px] text-[#17171B]">{card.title}</Text>
        </View>
        <Text numberOfLines={1} className="text-[13px] leading-[20px] text-[#696976]">
          {card.description}
        </Text>
      </View>
      <View
        className={`h-[28px] w-[72px] items-center justify-center rounded px-2 ${
          card.verified ? 'bg-[#4C87F6]' : 'border border-dashed border-[#B1CEFB] bg-[#ECF2FE]'
        }`}
      >
        <Text
          className={`text-[13px] font-semibold leading-[18px] ${
            card.verified ? 'text-white' : 'text-[#86AFF9]'
          }`}
        >
          {card.verified ? '인증 완료' : '인증 필요'}
        </Text>
      </View>
    </Pressable>
  );
}
