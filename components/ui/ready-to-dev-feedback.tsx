import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';

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

/**
 * 모든 토스트가 공유하는 높이. 화면 하단(세이프 에어리어 포함)에서 이만큼 위에 띄운다.
 * 기준: 룸메 상세 > 사용자 차단하기 > "차단되었어요" 토스트.
 */
export const TOAST_BOTTOM_OFFSET = 88;
/** 69pt 레이어 안에서 토스트가 가운데 정렬되므로, 실제 여백만큼 레이어를 내린다. */
const TOAST_LAYER_INSET = 18;

/**
 * 바텀시트 안에서 ReadyToast를 쓸 때 넘길 containerBottomInset.
 * BottomSheet 콘텐츠의 하단 패딩(= useSafeBottomPadding(16, 32))만큼 빼면
 * 화면 하단 기준 높이가 다른 화면 토스트와 같아진다.
 * 단, 토스트를 시트 콘텐츠의 직계 자식으로 둬야 한다(중첩되면 그만큼 더 떠오르고
 * Android에서는 부모 밖으로 나간 만큼 잘린다).
 */
export function useSheetToastInset(): number {
  return useSafeBottomPadding(16, 32);
}

export function ReadyToast({
  visible,
  message,
  tone = 'neutral',
  icon = 'checkmark-circle',
  iconColor: iconColorOverride,
  containerBottomInset = 0,
}: {
  visible: boolean;
  message: string;
  tone?: 'neutral' | 'success' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  /** 톤 기본색 대신 쓸 아이콘 색 (예: 경고 앰버). */
  iconColor?: string;
  /**
   * 토스트를 감싼 컨테이너의 하단이 화면 하단에서 떨어진 거리.
   * 화면 전체를 덮는 컨테이너면 0, 바텀시트 안이면 useSheetToastInset()을 쓴다.
   * 높이 자체는 TOAST_BOTTOM_OFFSET 하나로 고정되고, 이 값은 보정용이다.
   */
  containerBottomInset?: number;
}) {
  const { bottom } = useSafeAreaInsets();
  if (!visible) return null;

  const background = tone === 'danger' ? 'bg-[#D63D4A]' : 'bg-[#696976]';
  const iconColor = iconColorOverride ?? (tone === 'success' ? '#32C76F' : '#FFFFFF');
  const layerBottom = bottom + TOAST_BOTTOM_OFFSET - containerBottomInset - TOAST_LAYER_INSET;
  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 z-50 h-[69px] items-center justify-center px-6"
      style={{ bottom: Math.max(0, layerBottom) }}
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

/**
 * 화면 이탈 확인 모달 (Figma `3229:19267`).
 * 취소는 회색 채움, 확인은 파랑 채움 — 취소 버튼이 테두리인 ReadyConfirmDialog와는 다른 시안이다.
 */
export function ReadyExitDialog({
  open,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-[#17171B]/40">
        <View className="w-[286px] items-center justify-center rounded-[10px] bg-white p-5">
          <View className="items-center gap-2">
            <Text className="text-center text-lg font-bold leading-[27px] text-[#2D2D2D]">
              {title}
            </Text>
            {description ? (
              <Text className="text-center text-sm leading-[21px] text-[#42454A]">
                {description}
              </Text>
            ) : null}
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              className="h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#ECECF3] active:opacity-85"
            >
              <Text className="text-[15px] font-bold text-[#AAAABA]">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              className="h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#256EF4] active:opacity-85"
            >
              <Text className="text-[15px] font-bold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** 확인 버튼 하나짜리 안내 모달 (예: 채팅방 생성 개수 제한). */
export function ReadyInfoDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onConfirm}>
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
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            className="h-11 items-center justify-center rounded-lg bg-[#4C87F6] active:opacity-85"
          >
            <Text className="text-sm font-semibold text-white">{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
