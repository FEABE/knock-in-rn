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
        <ScrollView contentContainerClassName="gap-5 px-4 pb-10 pt-5">
          <View className="gap-2">
            <Text className="text-xl font-bold text-[#17171B]">인증할 항목을 선택해주세요</Text>
            <Text className="text-sm leading-5 text-[#696976]">
              인증을 완료하면 프로필에 뱃지가 표시되어 신뢰를 높일 수 있어요
            </Text>
          </View>

          <View className="gap-3">
            {cards.map((card) => (
              <VerificationCard key={card.id} card={card} onPress={card.onPress} />
            ))}
          </View>

          <View className="flex-row items-start gap-3 rounded-md bg-[#FFF7E8] px-4 py-4">
            <Ionicons name="information-circle-outline" size={21} color="#C77800" />
            <Text className="flex-1 text-sm leading-5 text-[#A15C00]">
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
      <Text className="flex-1 text-center text-base font-medium text-[#17171B]">신원 인증</Text>
      <View className="w-10" />
    </View>
  );
}

function VerificationCard({ card, onPress }: { card: VerificationHomeCard; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-[92px] flex-row items-center gap-4 rounded-md bg-[#F6F6FA] px-5 py-4 active:opacity-80"
    >
      {card.id === 'school' ? <SchoolBadgeArtwork size={40} /> : <CompanyBadgeArtwork size={40} />}
      <View className="flex-1 gap-1">
        <Text className="text-base font-bold text-[#17171B]">{card.title}</Text>
        <Text numberOfLines={1} className="text-sm text-[#696976]">
          {card.description}
        </Text>
      </View>
      <View className="items-end gap-2">
        <View
          className={`h-[28px] w-[72px] items-center justify-center rounded px-2 pb-[5px] pt-1 ${
            card.verified ? 'bg-[#256EF4]' : 'border border-dashed border-[#256EF4] bg-[#EAF1FE]'
          }`}
        >
          <Text
            className={`text-xs font-medium ${card.verified ? 'text-white' : 'text-[#256EF4]'}`}
          >
            {card.verified ? '인증 완료' : '인증 필요'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
