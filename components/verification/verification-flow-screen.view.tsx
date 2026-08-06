import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { TextField } from '@/components/ui/headless';
import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';

import type { UseVerificationFlowScreenReturn } from './use-verification-flow-screen';

export type VerificationFlowScreenViewProps = UseVerificationFlowScreenReturn;

export function VerificationFlowScreenView({
  step,
  heading,
  description,
  email,
  code,
  loading,
  error,
  timerLabel,
  canSend,
  canVerify,
  setEmail,
  setCode,
  send,
  verify,
  completeReview,
}: VerificationFlowScreenViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="gap-7 px-4 py-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View className="gap-2">
          <Text className="text-xl font-bold leading-[30px] text-[#17171B]">{heading}</Text>
          <Text className="text-sm leading-5 text-[#696976]">{description}</Text>
        </View>

        {step === 'entry' ? (
          <View className="gap-3">
            <FieldLabel label="이메일" />
            <TextField
              value={email}
              onChangeValue={setEmail}
              placeholder="example@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              className="border-b border-neutral-300 py-2 text-base text-neutral-900"
            />
            <View className="gap-1">
              <Bullet text="개인 이메일은 인증할 수 없어요" />
              <Bullet text="인증 처리까지 최대 3일 소요될 수 있어요" />
            </View>
            <PrimaryButton
              label="인증 메일 발송"
              loading={loading}
              disabled={!canSend}
              onPress={send}
            />
          </View>
        ) : null}

        {step === 'code' ? (
          <View className="gap-5">
            <View className="gap-2">
              <FieldLabel label="인증 코드" />
              <View className="flex-row items-center border-b border-neutral-300 py-2">
                <TextField
                  value={code}
                  onChangeValue={setCode}
                  placeholder="인증코드 6자리 입력"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  className="flex-1 text-base text-neutral-900"
                />
                <Text className="text-sm font-semibold text-[#D63D4A]">{timerLabel}</Text>
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

            <PrimaryButton
              label="인증 확인"
              loading={loading}
              disabled={!canVerify}
              onPress={verify}
            />
          </View>
        ) : null}

        {step === 'review' || step === 'complete' || step === 'rejected' ? (
          <View className="items-center gap-8 pt-6">
            <EmptyHouseArtwork size={180} />
            <PrimaryButton
              label={step === 'rejected' ? '다시 인증하기' : '확인'}
              loading={loading}
              onPress={completeReview}
            />
          </View>
        ) : null}

        {error ? <Text className="text-sm text-rose-500">{error}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
  disabled,
  onPress,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      className={`h-12 w-full items-center justify-center rounded-lg ${
        loading || !disabled ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text
          className={`text-base font-semibold ${
            loading || !disabled ? 'text-white' : 'text-[#AAAABA]'
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
