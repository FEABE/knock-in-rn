import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/error-state';
import {
  ReadyBadge,
  ReadyMetadataTile,
  ReadyProfileAvatar,
  ReadyScreenHeader,
  ReadySection,
} from '@/components/ui/ready-to-dev-components';

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
      <ReadyScreenHeader title="채팅 요청" onBack={onBack} />

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
          <ScrollView contentContainerClassName="pb-28 pt-7">
            <View className="items-center gap-3">
              <ReadyProfileAvatar
                name={opponent.name ?? opponent.memberName ?? '사용자'}
                size={96}
              />
              <View className="items-center gap-1">
                <Text className="text-[22px] font-bold text-[#17171B]">
                  {opponent.name ?? opponent.memberName ?? '사용자'}
                </Text>
                <ReadyBadge label={formatMeta(opponent.memberAge, opponent.gender)} tone="red" />
              </View>
              {score != null ? <ReadyBadge label={`궁합 ${score}점`} tone="dark" /> : null}
            </View>

            <ReadySection title="생활 패턴" className="mt-8 border-t border-[#ECECF3]">
              <View className="flex-row flex-wrap gap-3">
                {(opponent.lifeStyles ?? []).length ? (
                  opponent.lifeStyles?.map((item, index) => (
                    <ReadyMetadataTile
                      key={String(item.lifestyleId ?? index)}
                      label={item.name ?? item.description ?? '생활 패턴'}
                      value={item.value ?? '-'}
                    />
                  ))
                ) : (
                  <Text className="py-6 text-center text-sm text-[#AAAABA]">
                    공개된 생활 패턴이 없어요
                  </Text>
                )}
              </View>
            </ReadySection>
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
