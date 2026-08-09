import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';

type FeedbackTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const FEEDBACK_PALETTE = {
  neutral: {
    background: 'bg-[#F6F6FA]',
    border: 'border-[#ECECF3]',
    title: '#17171B',
    icon: '#696976',
  },
  info: {
    background: 'bg-[#ECF2FE]',
    border: 'border-[#DCE8FD]',
    title: '#256EF4',
    icon: '#256EF4',
  },
  success: {
    background: 'bg-[#EAF7F1]',
    border: 'border-[#D6F0E4]',
    title: '#249F6A',
    icon: '#249F6A',
  },
  warning: {
    background: 'bg-[#FFF2D8]',
    border: 'border-[#FFE3AB]',
    title: '#A15C00',
    icon: '#C77800',
  },
  danger: {
    background: 'bg-[#FDEFEC]',
    border: 'border-[#F8DCD6]',
    title: '#D63D4A',
    icon: '#D63D4A',
  },
} as const;

export function ReadyLoadingState({
  label = '불러오는 중...',
  compact = false,
  className = '',
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`items-center justify-center gap-3 px-8 ${compact ? 'py-10' : 'flex-1 py-16'} ${className}`}
    >
      <ActivityIndicator color="#256EF4" />
      <Text className="text-center text-sm leading-[21px] text-[#AAAABA]">{label}</Text>
    </View>
  );
}

/** 무한 스크롤 목록의 다음 페이지 로딩 표시(FlatList ListFooterComponent 용). */
export function ReadyListFooterLoading({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View className="items-center justify-center py-5">
      <ActivityIndicator color="#256EF4" />
    </View>
  );
}

export function ReadyEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  artwork,
  compact = false,
  className = '',
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  artwork?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`items-center justify-center px-8 ${compact ? 'gap-4 py-10' : 'flex-1 gap-6 pb-16'} ${className}`}
    >
      <View className="items-center gap-6">
        {artwork ?? <EmptyHouseArtwork size={compact ? 150 : 180} />}
        <View className="items-center gap-1">
          <Text className="text-center text-[17px] font-semibold leading-[26px] text-[#17171B]">
            {title}
          </Text>
          {description ? (
            <Text className="max-w-[280px] text-center text-sm leading-[21px] text-[#AAAABA]">
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="h-11 min-w-[139px] flex-row items-center justify-center gap-2 rounded-full border-[1.5px] border-[#256EF4] px-4 active:opacity-80"
        >
          <Text className="text-base font-medium text-[#256EF4]">{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#256EF4" />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ReadyErrorState({
  title = '문제가 발생했어요',
  description,
  retryLabel = '다시 시도',
  onRetry,
  compact = false,
  className = '',
}: {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`items-center justify-center gap-4 px-8 ${compact ? 'py-10' : 'flex-1 py-16'} ${className}`}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FDEFEC]">
        <Ionicons name="alert-circle-outline" size={26} color="#D63D4A" />
      </View>
      <View className="items-center gap-1">
        <Text className="text-center text-[17px] font-semibold leading-[26px] text-[#17171B]">
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={3} className="text-center text-sm leading-[21px] text-[#AAAABA]">
            {description}
          </Text>
        ) : null}
      </View>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          className="h-10 items-center justify-center rounded-full border border-[#DADAE8] px-5 active:bg-[#F6F6FA]"
        >
          <Text className="text-sm font-medium text-[#696976]">{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ReadyStatusBanner({
  title,
  description,
  tone = 'info',
  icon,
  actionLabel,
  onAction,
  disabled = false,
}: {
  title: string;
  description?: string;
  tone?: FeedbackTone;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  const palette = FEEDBACK_PALETTE[tone];
  return (
    <View
      className={`min-h-[76px] flex-row items-center gap-3 border-b px-[18px] py-3 ${palette.background} ${palette.border}`}
    >
      {icon ? <Ionicons name={icon} size={22} color={palette.icon} /> : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-[15px] font-bold leading-[23px]" style={{ color: palette.title }}>
          {title}
        </Text>
        {description ? (
          <Text className="text-[13px] leading-5 text-[#696976]">{description}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className={`h-8 items-center justify-center rounded px-3 ${
            tone === 'danger' ? 'bg-[#D63D4A]' : 'bg-[#256EF4]'
          } ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
        >
          <Text className="text-[13px] font-bold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ReadyToast({
  visible,
  message,
  tone = 'neutral',
  icon = 'checkmark-circle',
  bottomOffset,
}: {
  visible: boolean;
  message: string;
  tone?: 'neutral' | 'success' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  bottomOffset?: number;
}) {
  const { bottom } = useSafeAreaInsets();
  if (!visible) return null;

  const background = tone === 'danger' ? 'bg-[#D63D4A]' : 'bg-[#696976]';
  const iconColor = tone === 'success' ? '#32C76F' : '#FFFFFF';
  const resolvedBottomOffset = bottomOffset ?? bottom + 88;
  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 z-50 h-[69px] items-center justify-center px-6"
      style={{ bottom: Math.max(0, resolvedBottomOffset - 18) }}
    >
      <View className="absolute inset-0 bg-white/70" />
      <View
        className={`min-h-[34px] min-w-[252px] flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 ${background}`}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
        <Text className="text-[13px] font-medium text-white">{message}</Text>
      </View>
    </View>
  );
}

export function ReadyConfirmDialog({
  open,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  destructive = false,
  processing = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  processing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-[#17171B]/40 px-9">
        <View className="w-full max-w-[320px] gap-5 rounded-2xl bg-white px-6 pb-5 pt-6">
          <View className="gap-2">
            <Text className="text-center text-lg font-bold leading-[27px] text-[#17171B]">
              {title}
            </Text>
            {description ? (
              <Text className="text-center text-sm leading-[21px] text-[#696976]">
                {description}
              </Text>
            ) : null}
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={onCancel}
              disabled={processing}
              className="h-11 flex-1 items-center justify-center rounded-lg border border-[#DADAE8] active:bg-[#F6F6FA]"
            >
              <Text className="text-sm font-semibold text-[#696976]">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={processing}
              className={`h-11 flex-1 items-center justify-center rounded-lg ${
                destructive ? 'bg-[#D63D4A]' : 'bg-[#256EF4]'
              } ${processing ? 'opacity-50' : 'active:opacity-85'}`}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-sm font-semibold text-white">{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
