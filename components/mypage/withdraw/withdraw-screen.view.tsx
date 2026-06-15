import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { UseWithdrawScreenReturn, WithdrawReason } from './use-withdraw-screen';

export type WithdrawScreenViewProps = UseWithdrawScreenReturn;

export function WithdrawScreenView({
  reasons,
  selectedReasonIds,
  canSubmit,
  onBack,
  toggleReason,
  submit,
}: WithdrawScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404040" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">탈퇴하기</Text>
      </View>

      <ScrollView contentContainerClassName="gap-7 p-5">
        <View className="gap-2">
          <Text className="text-xl font-bold text-neutral-900">떠나기 전에 확인해주세요</Text>
          <Text className="text-sm leading-5 text-neutral-500">
            탈퇴 신청 후에는 프로필, 관심 목록, 채팅 기록 확인이 제한돼요. 실제 삭제는 서버 API 연동
            후 처리됩니다.
          </Text>
        </View>

        <View className="gap-2 rounded-lg bg-rose-50 p-4">
          <Text className="text-sm font-semibold text-rose-600">삭제 예정 정보</Text>
          <Text className="text-xs leading-5 text-rose-500">
            프로필 정보, 룸메이트 선호 조건, 관심 목록, 등록한 방 게시글, 채팅 연결 정보
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral-900">탈퇴 사유</Text>
          {reasons.map((reason) => (
            <ReasonRow
              key={reason.id}
              reason={reason}
              checked={selectedReasonIds.has(reason.id)}
              onPress={() => toggleReason(reason.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-neutral-100 p-5">
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          className={`h-12 items-center justify-center rounded-lg ${
            canSubmit ? 'bg-rose-600' : 'bg-neutral-300'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${canSubmit ? 'text-white' : 'text-neutral-500'}`}
          >
            탈퇴 신청
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReasonRow({
  reason,
  checked,
  onPress,
}: {
  reason: WithdrawReason;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 active:bg-neutral-50"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${
          checked ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
        }`}
      >
        {checked ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
      </View>
      <Text className="flex-1 text-sm text-neutral-800">{reason.label}</Text>
    </Pressable>
  );
}
