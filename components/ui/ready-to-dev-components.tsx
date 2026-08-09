import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';

export type ReadyHeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export type ReadyTabItem<T extends string = string> = {
  value: T;
  label: string;
  badge?: number;
};

export function ReadyPageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-end justify-between gap-4 px-4 pb-7 pt-6">
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-xl font-bold leading-[30px] text-[#17171B]">{title}</Text>
        {subtitle ? (
          <Text className="text-sm leading-[21px] text-[#696976]">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function ReadyScreenHeader({
  title,
  onBack,
  actions = [],
}: {
  title: string;
  onBack: () => void;
  actions?: ReadyHeaderAction[];
}) {
  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable
        onPress={onBack}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
      >
        <Ionicons name="chevron-back" size={22} color="#696976" />
      </Pressable>
      <Text
        numberOfLines={1}
        className="mx-2 flex-1 text-center text-[17px] font-medium text-[#17171B]"
      >
        {title}
      </Text>
      <View className="flex-row" style={{ width: Math.max(40, actions.length * 40) }}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
          >
            <Ionicons name={action.icon} size={21} color="#696976" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const SEARCH_INPUT_STYLE = {
  includeFontPadding: false,
  paddingBottom: 0,
  paddingTop: 0,
  textAlignVertical: 'center',
  ...(Platform.OS === 'ios' ? { lineHeight: undefined } : { lineHeight: 21 }),
} as const;

const SEARCH_PLACEHOLDER_STYLE = {
  includeFontPadding: false,
  lineHeight: 21,
} as const;

export function ReadySearchHeader({
  value,
  onChangeText,
  onSubmit,
  onBack,
  onCancel,
  onClear,
  placeholder = '지역, 동 이름 검색',
  autoFocus = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 px-4 py-4">
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-8 w-5 items-start justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <View className="h-[38px] flex-1 flex-row items-center gap-1 rounded bg-[#F6F6FA] px-3">
        {value.length === 0 ? (
          <View className="h-[18px] w-[18px] items-center justify-center">
            <Ionicons name="search-outline" size={18} color="#AAAABA" />
          </View>
        ) : null}
        <View className="h-[38px] flex-1 justify-center">
          {value.length === 0 ? (
            <Text
              pointerEvents="none"
              numberOfLines={1}
              style={SEARCH_PLACEHOLDER_STYLE}
              className="absolute left-0 right-0 text-[14px] font-medium text-[#AAAABA]"
            >
              {placeholder}
            </Text>
          ) : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            placeholder=""
            returnKeyType="search"
            autoFocus={autoFocus}
            style={SEARCH_INPUT_STYLE}
            className="h-[38px] w-full p-0 text-[14px] font-medium text-[#17171B]"
          />
        </View>
        {value.length > 0 ? (
          <Pressable
            onPress={onClear}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
            className="h-5 w-5 items-center justify-center rounded-full bg-[#17171B]/20"
          >
            <Ionicons name="close" size={12} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onCancel}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="검색 취소"
      >
        <Text className="text-[15px] font-medium leading-[23px] text-[#696976]">취소</Text>
      </Pressable>
    </View>
  );
}

export function ReadyTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: ReadyTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="border-b border-[#DADAE8]">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-1"
      >
        {items.map((item) => {
          const selected = value === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => onChange(item.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`min-w-[112px] flex-1 flex-row items-center justify-center gap-1.5 border-b-2 pb-3 pt-2 ${
                selected ? 'border-[#256EF4]' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-base ${
                  selected ? 'font-semibold text-[#17171B]' : 'font-medium text-[#AAAABA]'
                }`}
              >
                {item.label}
              </Text>
              {item.badge != null && item.badge > 0 ? (
                <View className="min-w-5 items-center justify-center rounded-full bg-[#ECF2FE] px-1.5 py-0.5">
                  <Text className="text-[11px] font-semibold text-[#256EF4]">{item.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** 적용(selected) 상태 배경은 Primary/40(#4C87F6) + 흰 글자 — 디자인 3071:15963 기준. */
export function ReadyFilterChip({
  label,
  selected = false,
  count,
  onPress,
}: {
  label: string;
  selected?: boolean;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`h-8 flex-row items-center gap-1 rounded-full border px-3 ${
        selected ? 'border-[#4C87F6] bg-[#4C87F6]' : 'border-[#DADAE8] bg-white'
      }`}
    >
      <Text className={`text-[13px] font-medium ${selected ? 'text-white' : 'text-[#696976]'}`}>
        {label}
        {count != null && count > 0 ? ` ${count}` : ''}
      </Text>
      <Ionicons name="chevron-down" size={13} color={selected ? '#FFFFFF' : '#696976'} />
    </Pressable>
  );
}

export function ReadyDivider() {
  return <View className="h-1.5 bg-[#F6F6FA]" />;
}

export function ReadySection({
  title,
  accessory,
  children,
  className = '',
}: {
  title?: string;
  accessory?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`gap-4 px-4 py-6 ${className}`}>
      {title || accessory ? (
        <View className="flex-row items-center justify-between gap-3">
          {title ? <Text className="text-base font-semibold text-[#17171B]">{title}</Text> : null}
          {accessory}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function ReadyProfileAvatar({
  name,
  imageUrl,
  size = 48,
}: {
  name: string;
  imageUrl?: string;
  size?: number;
}) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full border border-[#DADAE8] bg-[#F6F6FA]"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Ionicons name="person" size={size * 0.68} color="#DADAE8" />
    </View>
  );
}

const BADGE_PALETTE = {
  neutral: ['bg-[#F1F1F6]', '#696976'],
  blue: ['bg-[#ECF2FE]', '#4C87F6'],
  sky: ['bg-[#E7F4FE]', '#0B78CB'],
  red: ['bg-[#FDEFEC]', '#DE3412'],
  green: ['bg-[#EAF7F1]', '#249F6A'],
  dark: ['bg-[#696976]', '#FFFFFF'],
} as const;

export function ReadyBadge({
  label,
  tone = 'neutral',
  icon,
  bold = false,
  className = '',
}: {
  label: string;
  tone?: 'neutral' | 'blue' | 'sky' | 'red' | 'green' | 'dark';
  icon?: keyof typeof Ionicons.glyphMap;
  /** 탐색 > 룸메 찾아요의 나이·성별 칩처럼 굵게 표시해야 할 때 켠다. */
  bold?: boolean;
  className?: string;
}) {
  const [backgroundClass, color] = BADGE_PALETTE[tone];

  return (
    <View
      className={`flex-row items-center gap-1 rounded px-1.5 py-1 ${backgroundClass} ${className}`}
    >
      {icon ? <Ionicons name={icon} size={11} color={color} /> : null}
      <Text className={`text-[11px] ${bold ? 'font-semibold' : 'font-medium'}`} style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

export function ReadyChatStatusBadge({ status }: { status: 'request' | 'roommate' }) {
  const isRequest = status === 'request';

  return (
    <View
      className={`h-[22px] w-14 shrink-0 items-center justify-center rounded ${
        isRequest ? 'bg-[#4C87F6]' : 'bg-[#696976]'
      }`}
    >
      <Text className="text-xs font-semibold leading-[17px] text-white">
        {isRequest ? '매칭 요청' : '룸메이트'}
      </Text>
    </View>
  );
}

export function ReadyActionSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle={false}
      contentClassName="rounded-t-[20px] bg-white px-4 pb-5 pt-4"
    >
      <View className="mb-2 items-end">
        <Pressable
          onPress={() => onOpenChange(false)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          className="h-9 w-9 items-center justify-center rounded-full active:bg-[#F6F6FA]"
        >
          <Ionicons name="close" size={23} color="#696976" />
        </Pressable>
      </View>
      {children}
    </BottomSheet>
  );
}

export function ReadyActionRow({
  icon,
  label,
  tone = 'neutral',
  onPress,
  divider = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'neutral' | 'danger';
  onPress: () => void;
  divider?: boolean;
}) {
  const color = tone === 'danger' ? '#F04438' : '#696976';
  return (
    <Pressable
      onPress={onPress}
      className={`h-14 flex-row items-center gap-3 px-1 active:bg-[#F6F6FA] ${
        divider ? 'border-b border-[#ECECF3]' : ''
      }`}
    >
      {/* 글리프마다 시각적 무게중심이 달라(예: exit-outline) 고정 폭 박스 안에서 중앙 정렬한다. */}
      <View className="w-6 items-center justify-center">
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-base font-medium" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ReadyMetadataTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-[76px] min-w-[47%] flex-1 justify-center gap-1 rounded bg-[#F6F6FA] px-5 py-3">
      <Text className="text-[13px] font-medium text-[#696976]">{label}</Text>
      <Text className="text-base font-semibold text-[#17171B]">{value}</Text>
    </View>
  );
}

export function ReadyInfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="min-h-[29px] flex-row items-center justify-between gap-4">
      <View className="flex-row items-center gap-2">
        {icon ? <Ionicons name={icon} size={17} color="#696976" /> : null}
        <Text className="text-sm leading-[21px] text-[#696976]">{label}</Text>
      </View>
      <Text
        numberOfLines={1}
        className="min-w-0 flex-1 text-right text-sm font-medium text-[#17171B]"
      >
        {value}
      </Text>
    </View>
  );
}

export function ReadyCompatibilityBar({
  score,
  label = '궁합 점수',
  caption,
}: {
  score?: number;
  label?: string;
  caption?: string;
}) {
  const normalized = Math.max(0, Math.min(100, score ?? 0));
  return (
    <View className="gap-2">
      <View className="flex-row items-end justify-between gap-3">
        <View className="gap-0.5">
          <Text className="text-[15px] font-semibold text-[#17171B]">{label}</Text>
          {caption ? <Text className="text-xs text-[#AAAABA]">{caption}</Text> : null}
        </View>
        <Text className="text-base font-bold text-[#256EF4]">
          {score == null ? '-' : `${normalized}점`}
        </Text>
      </View>
      <View className="h-[7px] overflow-hidden rounded-full bg-[#ECECF3]">
        <View className="h-full rounded-full bg-[#4C87F6]" style={{ width: `${normalized}%` }} />
      </View>
    </View>
  );
}

export function ReadyMoreButton({ expanded, onPress }: { expanded: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-center gap-0.5 py-1">
      <Text className="text-sm font-medium text-[#AAAABA]">{expanded ? '접기' : '더보기'}</Text>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#AAAABA" />
    </Pressable>
  );
}
