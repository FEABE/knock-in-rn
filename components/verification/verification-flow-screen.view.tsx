import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import type {
  UseVerificationFlowScreenReturn,
  VerificationStatusTone,
} from './use-verification-flow-screen';

export type VerificationFlowScreenViewProps = UseVerificationFlowScreenReturn;

export function VerificationFlowScreenView({
  step,
  title,
  label,
  iconName,
  placeholder,
  email,
  code,
  loading,
  error,
  statusLabel,
  statusTone,
  description,
  reviewTitle,
  setEmail,
  setCode,
  send,
  verify,
  completeReview,
}: VerificationFlowScreenViewProps) {
  return (
    <View className="flex-1 bg-white">
      <View className="gap-7 px-4 py-6">
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
            <Ionicons name={iconName} size={18} color="#525252" />
          </View>
          <Text className="text-base font-semibold text-neutral-900">{title}</Text>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name={iconName} size={18} color="#111827" />
              <Text className="text-base font-bold text-neutral-900">{label}</Text>
            </View>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>

          <Text className="text-sm leading-5 text-neutral-500">{description}</Text>
        </View>

        {step === 'entry' ? (
          <View className="gap-3">
            <FieldLabel label="이메일" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              className="border-b border-neutral-300 py-2 text-base text-neutral-900"
            />
            <PrimaryButton label="인증 코드 받기" loading={loading} onPress={send} />
          </View>
        ) : null}

        {step === 'code' ? (
          <View className="gap-5">
            <View className="gap-2">
              <FieldLabel label="인증 코드" />
              <View className="flex-row items-center border-b border-neutral-300 py-2">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 text-base text-neutral-900"
                />
                <Text className="text-sm text-[#256EF4]">04:59</Text>
              </View>
            </View>

            <View className="gap-2">
              <FieldLabel label="이메일" />
              <View className="flex-row items-center border-b border-neutral-300 py-2">
                <Text className="flex-1 text-base text-neutral-900">{email}</Text>
                <Pressable onPress={send} disabled={loading} hitSlop={8}>
                  <Text className="text-sm font-semibold text-[#256EF4]">재발송</Text>
                </Pressable>
              </View>
            </View>

            <View className="gap-1">
              <Bullet text="인증 코드는 5분간 유효해요" />
              <Bullet text="메일이 오지 않으면 스팸함을 확인해주세요" />
            </View>

            <PrimaryButton label="인증 확인" loading={loading} onPress={verify} />
          </View>
        ) : null}

        {step === 'review' || step === 'complete' ? (
          <View className="gap-5">
            <View className="flex-row items-center gap-4 rounded-lg bg-neutral-50 px-4 py-3">
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  step === 'complete' ? 'bg-emerald-100' : 'bg-amber-100'
                }`}
              >
                <Ionicons
                  name={step === 'complete' ? 'checkmark' : 'time-outline'}
                  size={20}
                  color={step === 'complete' ? '#047857' : '#B45309'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-neutral-900">{reviewTitle}</Text>
                <Text className="text-xs text-neutral-500">{email}</Text>
              </View>
            </View>

            <PrimaryButton
              label={step === 'review' ? '완료 상태 확인' : '확인'}
              onPress={completeReview}
            />
          </View>
        ) : null}

        {error ? <Text className="text-sm text-rose-500">{error}</Text> : null}
      </View>
    </View>
  );
}

function StatusPill({ label, tone }: { label: string; tone: VerificationStatusTone }) {
  const bgClass =
    tone === 'complete' ? 'bg-emerald-50' : tone === 'review' ? 'bg-amber-50' : 'bg-neutral-100';
  const textClass =
    tone === 'complete'
      ? 'text-emerald-700'
      : tone === 'review'
        ? 'text-amber-700'
        : 'text-neutral-500';

  return (
    <View className={`rounded-full px-3 py-1 ${bgClass}`}>
      <Text className={`text-xs font-semibold ${textClass}`}>{label}</Text>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="text-sm font-semibold text-neutral-800">{label}</Text>;
}

function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-1 w-1 rounded-full bg-neutral-400" />
      <Text className="text-xs text-neutral-500">{text}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="h-12 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
