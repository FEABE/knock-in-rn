import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReadyConfirmDialog } from '@/components/ui/ready-to-dev-feedback';
import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';

import type { UseWithdrawScreenReturn } from './use-withdraw-screen';

export type WithdrawScreenViewProps = UseWithdrawScreenReturn;

type NoticePart = { text: string; emphasis?: boolean };

const NOTICE_ITEMS: NoticePart[][] = [
  [
    { text: '탈퇴 후 ' },
    { text: '3일간 동일계정으로 재가입이 불가', emphasis: true },
    { text: '해요\n3일 이후에는 재가입이 가능해요' },
  ],
  [
    { text: '등록된 방 게시글, 프로필, 채팅 내역등 ' },
    { text: '모든 데이터는 삭제', emphasis: true },
    { text: '돼요' },
  ],
  [
    { text: '진행중인 매칭 및 채팅이 ' },
    { text: '자동으로 종료', emphasis: true },
    { text: '돼요' },
  ],
  [{ text: '탈퇴 후 ' }, { text: '데이터는 복구되지 않아요', emphasis: true }],
];

export function WithdrawScreenView({
  submitting,
  confirmOpen,
  onBack,
  openConfirm,
  closeConfirm,
  confirmWithdraw,
}: WithdrawScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center justify-center">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="absolute left-2 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#17171B" />
        </Pressable>
        <Text className="text-base font-semibold text-[#17171B]">탈퇴하기</Text>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-6">
        <View className="items-center py-6">
          <EmptyHouseArtwork size={180} />
        </View>

        <View className="flex-row items-center gap-1.5 pb-4">
          <Ionicons name="warning" size={20} color="#FFB020" />
          <Text className="text-[17px] font-bold leading-[26px] text-[#17171B]">
            탈퇴 전 유의사항
          </Text>
        </View>

        <View className="gap-3">
          {NOTICE_ITEMS.map((parts, index) => (
            <NoticeRow key={index} parts={parts} />
          ))}
        </View>

        <View className="mt-6 rounded-lg bg-[#FDEFEC] px-4 py-3">
          <Text className="text-[13px] font-bold leading-5 text-[#D63D4A]">
            탈퇴후 3일간 계정 데이터가 보관되며, 이후에는 영구 삭제되어 복구가 불가합니다.
          </Text>
        </View>
      </ScrollView>

      <View className="gap-3 px-5 pb-3 pt-2">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="취소"
          className="h-12 items-center justify-center rounded-lg bg-[#F6F6FA] active:bg-[#ECECF3]"
        >
          <Text className="text-[15px] font-semibold text-[#AAAABA]">취소</Text>
        </Pressable>
        <Pressable
          onPress={openConfirm}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="탈퇴하기"
          className={`h-12 items-center justify-center rounded-lg bg-[#256EF4] ${
            submitting ? 'opacity-50' : 'active:opacity-85'
          }`}
        >
          <Text className="text-[15px] font-semibold text-white">탈퇴하기</Text>
        </Pressable>
      </View>

      <ReadyConfirmDialog
        open={confirmOpen}
        title="정말 탈퇴하시겠어요?"
        description={'탈퇴 후 3일간 재가입이 불가하며,\n모든 데이터는 복구되지 않아요'}
        cancelLabel="취소"
        confirmLabel="탈퇴하기"
        destructive
        processing={submitting}
        onCancel={closeConfirm}
        onConfirm={confirmWithdraw}
      />
    </SafeAreaView>
  );
}

function NoticeRow({ parts }: { parts: NoticePart[] }) {
  return (
    <View className="flex-row gap-2">
      <Text className="text-sm leading-[21px] text-[#17171B]">•</Text>
      <Text className="flex-1 text-sm leading-[21px] text-[#17171B]">
        {parts.map((part, index) => (
          <Text
            key={index}
            className={
              part.emphasis
                ? 'text-sm font-bold leading-[21px] text-[#D63D4A]'
                : 'text-sm leading-[21px] text-[#17171B]'
            }
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}
