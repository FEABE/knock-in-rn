import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { ErrorState } from '@/components/ui/error-state';

import type { UseNotificationScreenReturn } from './use-notification-screen';

export type NotificationScreenViewProps = UseNotificationScreenReturn;

export function NotificationScreenView({
  alarms,
  loading,
  error,
  isLoggedIn,
  hasUnread,
  markingRead,
  onBack,
  onLogin,
  onRetry,
  onAlarmPress,
  onReadAll,
}: NotificationScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center border-b border-[#ECECF3] px-3 py-2">
        <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#17171B" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#17171B]">알림</Text>
        {isLoggedIn && hasUnread ? (
          <Pressable onPress={onReadAll} disabled={markingRead} className="px-2 py-2">
            <Text className="text-sm font-semibold text-[#256EF4]">모두 읽음</Text>
          </Pressable>
        ) : (
          <View className="w-16" />
        )}
      </View>

      {!isLoggedIn ? (
        <View className="p-5">
          <LoginPromptCard
            title="로그인하고 알림을 확인해보세요"
            description="새 채팅과 룸메이트 매칭 소식을 바로 확인할 수 있어요"
            onPress={onLogin}
          />
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">알림을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <ErrorState message="알림을 불러오지 못했어요" detail={error} onRetry={onRetry} />
      ) : alarms.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="notifications-outline" size={42} color="#D9DAE5" />
          <Text className="text-base font-semibold text-[#3F3F47]">새로운 알림이 없어요</Text>
          <Text className="text-center text-sm text-[#AAAABA]">
            채팅이나 매칭 소식이 생기면 여기에 알려드릴게요
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="pb-12">
          {alarms.map((alarm, index) => (
            <Pressable
              key={String(alarm.id ?? `${alarm.createAt}-${index}`)}
              onPress={() => onAlarmPress(alarm)}
              className={`flex-row gap-3 border-b border-[#ECECF3] px-4 py-4 ${
                alarm.isRead ? 'bg-white' : 'bg-[#256EF4]/5'
              }`}
            >
              <View
                className={`mt-0.5 h-9 w-9 items-center justify-center rounded-full ${
                  alarm.isRead ? 'bg-[#ECECF3]' : 'bg-[#256EF4]/10'
                }`}
              >
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={alarm.isRead ? '#AAAABA' : '#256EF4'}
                />
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-start gap-2">
                  <Text className="flex-1 text-[15px] font-semibold text-[#17171B]">
                    {alarm.title ?? '노크인 알림'}
                  </Text>
                  {!alarm.isRead ? (
                    <View className="mt-2 h-2 w-2 rounded-full bg-[#256EF4]" />
                  ) : null}
                </View>
                <Text className="text-sm leading-5 text-[#696976]">{alarm.contents ?? ''}</Text>
                <Text className="text-xs text-[#AAAABA]">{formatAlarmTime(alarm.createAt)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatAlarmTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}
