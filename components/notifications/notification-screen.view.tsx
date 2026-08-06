import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { formatKstDateLabel, parseServerDate, type AlarmItem } from '@/lib/api';
import { ErrorState } from '@/components/ui/error-state';
import { ReadyEmptyState } from '@/components/ui/ready-to-dev-feedback';

import type { UseNotificationScreenReturn } from './use-notification-screen';

export type NotificationScreenViewProps = UseNotificationScreenReturn;

/**
 * 알림 카테고리. 알림 목록 API(AlarmListDto$Response$Alarm)는 타입 필드를 내려주지 않아
 * 서버 알림 템플릿(RoommateRequiredMessageTemplate)의 제목 문구로 카테고리를 판별한다.
 */
type AlarmCategory = {
  label: string;
  /** 룸메이트 계열 알림은 브랜드 블루, 그 외 일반 알림은 회색 아이콘을 쓴다. */
  accent: boolean;
};

const ROOMMATE_CATEGORY_ACCENT = '#4C87F6';
const DEFAULT_CATEGORY_ACCENT = '#DADAE8';

export function NotificationScreenView({
  alarms,
  loading,
  refreshing,
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
      <View className="h-14 flex-row items-center px-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#17171B" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-[17px] font-semibold text-[#17171B]">
          알림
        </Text>
        <View className="flex-1" />
        {isLoggedIn && hasUnread ? (
          <Pressable
            onPress={onReadAll}
            disabled={markingRead}
            accessibilityRole="button"
            accessibilityLabel="알림 모두 읽음 처리"
            className={`px-2 py-2 ${markingRead ? 'opacity-50' : 'active:opacity-70'}`}
          >
            <Text className="text-[13px] font-semibold text-[#256EF4]">모두 읽음</Text>
          </Pressable>
        ) : null}
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
        <ReadyEmptyState
          title="받은 알림이 없어요"
          description="새로운 소식이 생기면 알려드릴게요"
        />
      ) : (
        <ScrollView
          contentContainerClassName="pb-12"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRetry} tintColor="#256EF4" />
          }
        >
          {alarms.map((alarm, index) => (
            <AlarmRow
              key={String(alarm.id ?? `${alarm.createAt}-${index}`)}
              alarm={alarm}
              onPress={() => onAlarmPress(alarm)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function AlarmRow({ alarm, onPress }: { alarm: AlarmItem; onPress: () => void }) {
  const category = alarmCategory(alarm.title);
  const accent = category.accent ? ROOMMATE_CATEGORY_ACCENT : DEFAULT_CATEGORY_ACCENT;
  const unread = !alarm.isRead;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label} 알림: ${alarm.title ?? ''}`}
      className={`border-b border-[#ECECF3] px-4 py-4 ${unread ? 'bg-[#ECF2FE]' : 'bg-white'}`}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: accent }}
        >
          <Ionicons name="notifications" size={17} color="#FFFFFF" />
        </View>
        <Text
          className="flex-1 text-sm font-bold leading-[21px]"
          style={{ color: category.accent ? ROOMMATE_CATEGORY_ACCENT : '#696976' }}
          numberOfLines={1}
        >
          {category.label}
        </Text>
        <Text className="text-xs leading-[18px] text-[#AAAABA]">
          {formatAlarmTime(alarm.createAt)}
        </Text>
      </View>

      <View className="mt-3 gap-1">
        <Text className="text-base font-bold leading-[23px] text-[#17171B]">
          {alarm.title ?? '노크인 알림'}
        </Text>
        {alarm.contents ? (
          <Text className="text-[13px] leading-5 text-[#696976]">{alarm.contents}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * 서버 알림 제목으로 카테고리를 판별한다.
 * (RoommateRequiredMessageTemplate: PENDING "…님의 매칭 요청" / ACCEPTED "매칭 요청이 수락됐어요"
 *  / REJECTED "매칭 요청 거절")
 */
function alarmCategory(title?: string): AlarmCategory {
  const text = title ?? '';
  if (!text.includes('매칭')) return { label: '알림', accent: false };
  if (text.includes('수락')) return { label: '룸메이트 확정', accent: true };
  if (text.includes('거절')) return { label: '룸메이트 알림', accent: true };
  return { label: '룸메이트 요청', accent: true };
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** 디자인 표기: "10분 전". 7일이 지나면 날짜 라벨로 떨어뜨린다. */
function formatAlarmTime(value?: string): string {
  const date = parseServerDate(value);
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  if (diff < MINUTE_MS) return '방금 전';
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)}일 전`;
  return formatKstDateLabel(date);
}
