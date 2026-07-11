import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/error-state';

import type { UseChatRequestScreenReturn } from './use-chat-request-screen';

export function ChatRequestScreenView({
  opponent,
  score,
  status,
  isRequester,
  loading,
  error,
  processing,
  onBack,
  onRetry,
  onAccept,
  onReject,
  onCancel,
}: UseChatRequestScreenReturn) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center border-b border-[#ECECF3] px-3 py-2">
        <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#17171B" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#17171B]">채팅 요청</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">요청 정보를 불러오는 중...</Text>
        </View>
      ) : error || !opponent ? (
        <ErrorState
          message="채팅 요청을 불러오지 못했어요"
          detail={error ?? '요청 정보를 찾을 수 없습니다.'}
          onRetry={onRetry}
        />
      ) : (
        <>
          <ScrollView contentContainerClassName="px-5 pb-28 pt-7">
            <View className="items-center gap-3">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-[#E9F0FE]">
                <Text className="text-[32px] font-bold text-[#256EF4]">
                  {(opponent.name ?? opponent.memberName ?? '사').charAt(0)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-[22px] font-bold text-[#17171B]">
                  {opponent.name ?? opponent.memberName ?? '사용자'}
                </Text>
                <Text className="text-sm text-[#696976]">
                  {formatMeta(opponent.memberAge, opponent.gender)}
                </Text>
              </View>
              {score != null ? (
                <View className="rounded-full bg-[#256EF4] px-4 py-2">
                  <Text className="text-sm font-bold text-white">궁합 {score}점</Text>
                </View>
              ) : null}
            </View>

            <View className="mt-8 border-t border-[#ECECF3] pt-5">
              <Text className="mb-3 text-base font-bold text-[#17171B]">생활 패턴</Text>
              <View className="gap-2">
                {(opponent.lifeStyles ?? []).length ? (
                  opponent.lifeStyles?.map((item, index) => (
                    <View
                      key={String(item.lifestyleId ?? index)}
                      className="flex-row items-center justify-between rounded-lg bg-[#F7F7FA] px-4 py-3"
                    >
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-semibold text-[#3F3F47]">
                          {item.name ?? '생활 패턴'}
                        </Text>
                        {item.description ? (
                          <Text className="text-xs text-[#AAAABA]">{item.description}</Text>
                        ) : null}
                      </View>
                      <Text className="text-sm font-semibold text-[#256EF4]">
                        {item.value ?? '-'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="py-6 text-center text-sm text-[#AAAABA]">
                    공개된 생활 패턴이 없어요
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {status === 'PENDING' ? (
            <View className="absolute bottom-0 left-0 right-0 flex-row gap-2 border-t border-[#ECECF3] bg-white px-5 pb-5 pt-3">
              {isRequester ? (
                <Pressable
                  onPress={onCancel}
                  disabled={processing}
                  className="h-12 flex-1 items-center justify-center rounded-lg border border-[#D9DAE5]"
                >
                  <Text className="text-sm font-semibold text-[#696976]">요청 취소</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={onReject}
                    disabled={processing}
                    className="h-12 flex-1 items-center justify-center rounded-lg border border-[#D9DAE5]"
                  >
                    <Text className="text-sm font-semibold text-[#696976]">거절</Text>
                  </Pressable>
                  <Pressable
                    onPress={onAccept}
                    disabled={processing}
                    className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4]"
                  >
                    {processing ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-sm font-semibold text-white">수락하고 채팅하기</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}

function formatMeta(age?: number, gender?: string): string {
  const values = [
    age ? `${age}세` : null,
    gender === 'FEMALE' ? '여성' : gender === 'MALE' ? '남성' : null,
  ].filter(Boolean);
  return values.join(' · ') || '프로필 정보 없음';
}
