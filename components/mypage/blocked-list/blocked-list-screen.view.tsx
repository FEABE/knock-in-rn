import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';

import type { UseBlockedListScreenReturn } from './use-blocked-list-screen';

export type BlockedListScreenViewProps = UseBlockedListScreenReturn;

export function BlockedListScreenView({
  users,
  loading,
  error,
  onBack,
  onUnblock,
}: BlockedListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-14 flex-row items-center px-3">
        <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-[17px] font-semibold text-[#242429]">
          차단 목록
        </Text>
      </View>

      <View className="mx-4 mt-2 flex-row gap-3 rounded-lg bg-[#FFF4E8] px-4 py-3">
        <Ionicons name="information-circle-outline" size={20} color="#F28A2E" />
        <Text className="flex-1 text-xs leading-[18px] text-[#8A5A2B]">
          차단한 사용자에게는 서로 프로필이 노출되지 않아요
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">차단 목록을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-7">
          <Text className="text-center text-sm leading-5 text-[#696976]">
            차단 목록을 불러오지 못했어요.{`\n`}
            {error}
          </Text>
        </View>
      ) : users.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F6F6FA]">
            <Ionicons name="people-outline" size={26} color="#AAAABA" />
          </View>
          <Text className="text-sm text-[#8A8A98]">차단한 회원이 없어요</Text>
        </View>
      ) : (
        <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
          {users.map((user) => (
            <View
              key={user.id}
              className="min-h-[76px] flex-row items-center border-b border-[#F1F1F5] px-4 py-3"
            >
              <ReadyProfileAvatar name={user.name} size={48} />
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-[#242429]">{user.name}</Text>
                <Text className="mt-1 text-xs text-[#AAAABA]">차단일 {user.dateLabel}</Text>
              </View>
              <Pressable
                onPress={() => onUnblock(user)}
                className="h-9 items-center justify-center rounded bg-[#E8341A] px-4 active:opacity-85"
              >
                <Text className="text-[13px] font-semibold text-white">차단 해제</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
