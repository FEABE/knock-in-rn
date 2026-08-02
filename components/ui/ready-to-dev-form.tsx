import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

export function ReadyFieldLabel({
  children,
  required = false,
  optional = false,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">{children}</Text>
      {required ? <Text className="text-[13px] font-medium text-[#D63D4A]">필수</Text> : null}
      {optional ? <Text className="text-[13px] text-[#AAAABA]">선택</Text> : null}
    </View>
  );
}

export function ReadySelectField({
  value,
  placeholder,
  onPress,
  disabled = false,
  error,
}: {
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <View className="gap-1.5">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value || placeholder}
        className={`h-[50px] flex-row items-center justify-between rounded-lg bg-[#F6F6FA] px-4 ${
          error ? 'border border-[#D63D4A]' : ''
        } ${disabled ? 'opacity-50' : 'active:bg-[#ECECF3]'}`}
      >
        <Text className={`text-[15px] ${value ? 'text-[#17171B]' : 'text-[#AAAABA]'}`}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#696976" />
      </Pressable>
      {error ? <Text className="text-xs text-[#D63D4A]">{error}</Text> : null}
    </View>
  );
}

export function ReadyTextAreaField({
  value,
  onChangeText,
  placeholder,
  maxLength = 500,
  minHeight = 112,
  error,
  editable = true,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  minHeight?: number;
  error?: string;
  editable?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <View
        className={`rounded-lg bg-[#F6F6FA] px-4 pb-3 pt-3 ${error ? 'border border-[#D63D4A]' : ''}`}
        style={{ minHeight }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAABA"
          multiline
          maxLength={maxLength}
          editable={editable}
          textAlignVertical="top"
          className="min-h-[72px] flex-1 p-0 text-sm leading-[21px] text-[#17171B]"
        />
        <Text className="self-end text-xs text-[#696976]">
          {value.length}/{maxLength}
        </Text>
      </View>
      {error ? <Text className="text-xs text-[#D63D4A]">{error}</Text> : null}
    </View>
  );
}

export function ReadyNotice({
  children,
  tone = 'warning',
}: {
  children: ReactNode;
  tone?: 'info' | 'warning';
}) {
  const isWarning = tone === 'warning';
  return (
    <View
      className={`flex-row items-start gap-2 rounded-lg px-3 py-3 ${
        isWarning ? 'bg-[#FFF2D8]' : 'bg-[#ECF2FE]'
      }`}
    >
      <Ionicons
        name="information-circle-outline"
        size={18}
        color={isWarning ? '#C77800' : '#256EF4'}
      />
      <Text
        className="min-w-0 flex-1 text-[12px] leading-[18px]"
        style={{ color: isWarning ? '#A15C00' : '#256EF4' }}
      >
        {children}
      </Text>
    </View>
  );
}

export function ReadyBottomButton({
  label,
  onPress,
  disabled = false,
  processing = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  processing?: boolean;
  destructive?: boolean;
}) {
  const blocked = disabled || processing;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-12 items-center justify-center rounded-lg ${
        blocked ? 'bg-[#ECECF3]' : destructive ? 'bg-[#D63D4A]' : 'bg-[#256EF4]'
      } ${blocked ? '' : 'active:opacity-85'}`}
    >
      {processing ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className={`text-[15px] font-bold ${blocked ? 'text-[#AAAABA]' : 'text-white'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ReadyBottomActionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  processing = false,
  secondaryLabel,
  onSecondary,
  destructive = false,
  bottomPadding = 0,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  processing?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  destructive?: boolean;
  bottomPadding?: number;
}) {
  return (
    <View
      className="border-t border-[#ECECF3] bg-white px-4 pb-4 pt-3"
      style={{ paddingBottom: Math.max(16, bottomPadding) }}
    >
      <View className="flex-row gap-2">
        {secondaryLabel && onSecondary ? (
          <Pressable
            onPress={onSecondary}
            className="h-12 flex-1 items-center justify-center rounded-lg border border-[#DADAE8] active:bg-[#F6F6FA]"
          >
            <Text className="text-[15px] font-semibold text-[#696976]">{secondaryLabel}</Text>
          </Pressable>
        ) : null}
        <View className="flex-1">
          <ReadyBottomButton
            label={primaryLabel}
            onPress={onPrimary}
            disabled={primaryDisabled}
            processing={processing}
            destructive={destructive}
          />
        </View>
      </View>
    </View>
  );
}
