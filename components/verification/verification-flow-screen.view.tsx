import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom: bottomInset } = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - bottomInset),
  }));

  const isResultStep = step === 'review' || step === 'complete' || step === 'rejected';
  const headingBlock = (
    <View className="gap-2">
      <Text className="text-xl font-bold leading-[30px] text-[#17171B]">{heading}</Text>
      <Text className="text-[14px] leading-[22px] text-[#696976]">{description}</Text>
    </View>
  );

  // 검토중/완료/반려는 스크롤할 내용이 없다. ScrollView 안에서는 flex-1 이 남은 높이를
  // 받지 못해 이미지가 위로 붙으므로, 결과 화면만 일반 View 로 그려 세로 가운데에 둔다.
  if (isResultStep) {
    return (
      <Animated.View className="flex-1 bg-white" style={keyboardAvoidingStyle}>
        <View className="flex-1 px-4 pb-6 pt-6">
          {headingBlock}

          <View className="flex-1 items-center justify-center">
            <EmptyHouseArtwork size={188} height={173} />
          </View>

          {error ? <Text className="text-center text-sm text-rose-500">{error}</Text> : null}
        </View>

        <VerificationFooter>
          <PrimaryButton
            label={step === 'rejected' ? '다시 인증하기' : '확인'}
            loading={loading}
            onPress={completeReview}
          />
        </VerificationFooter>
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" style={keyboardAvoidingStyle}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6 pt-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {headingBlock}

        {step === 'entry' ? (
          <View className="mt-8 gap-2">
            <View className="gap-3">
              <FieldLabel label="이메일" />
              <UnderlinedTextField
                value={email}
                onChangeValue={setEmail}
                placeholder="example@gmail.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View className="gap-1.5">
              <Bullet text="개인 이메일은 인증할 수 없어요" />
              <Bullet text="인증 처리까지 최대 3일 소요될 수 있어요" />
            </View>
          </View>
        ) : null}

        {step === 'code' ? (
          <View className="mt-8 gap-5">
            <View className="gap-3">
              <FieldLabel label="인증 코드" />
              <View className="gap-1">
                <View className="h-[23px] flex-row items-center">
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
                    className="h-[23px] flex-1 text-[15px] text-[#17171B]"
                  />
                  <Text className="text-[14px] font-semibold leading-[21px] text-[#D63D4A]">
                    {timerLabel}
                  </Text>
                </View>
                <View className="h-px bg-[#AAAABA]" />
              </View>
            </View>

            <View className="gap-3">
              <FieldLabel label="이메일" />
              <View className="gap-1">
                <View className="h-[23px] flex-row items-center">
                  <Text className="flex-1 text-[15px] leading-[23px] text-[#17171B]">{email}</Text>
                  <Pressable onPress={send} disabled={loading} hitSlop={8}>
                    <Text className="text-[14px] font-semibold leading-[21px] text-[#256EF4]">
                      재발송
                    </Text>
                  </Pressable>
                </View>
                <View className="h-px bg-[#AAAABA]" />
              </View>
            </View>

            <View className="gap-1.5">
              <Bullet text="인증 코드는 5분간 유효해요" />
              <Bullet text="메일이 오지 않으면 스팸함을 확인해주세요" />
            </View>
          </View>
        ) : null}

        {error ? <Text className="mt-3 text-sm text-rose-500">{error}</Text> : null}
      </ScrollView>

      {step === 'entry' ? (
        <VerificationFooter>
          <PrimaryButton
            label="인증 메일 발송"
            loading={loading}
            disabled={!canSend}
            onPress={send}
          />
        </VerificationFooter>
      ) : null}
      {step === 'code' ? (
        <VerificationFooter>
          <PrimaryButton
            label="인증 확인"
            loading={loading}
            disabled={!canVerify}
            onPress={verify}
          />
        </VerificationFooter>
      ) : null}
    </Animated.View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">{label}</Text>;
}

function UnderlinedTextField({
  value,
  onChangeValue,
  placeholder,
  autoCapitalize,
  keyboardType,
}: {
  value: string;
  onChangeValue: (next: string) => void;
  placeholder: string;
  autoCapitalize: 'none';
  keyboardType: 'email-address';
}) {
  return (
    <View className="gap-1">
      <TextField
        value={value}
        onChangeValue={onChangeValue}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        className="h-[23px] text-[15px] text-[#17171B]"
      />
      <View className="h-px bg-[#AAAABA]" />
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-[3px] w-[3px] rounded-full bg-[#696976]" />
      <Text className="text-[13px] leading-5 text-[#696976]">{text}</Text>
    </View>
  );
}

function VerificationFooter({ children }: { children: ReactNode }) {
  return <View className="h-20 justify-center bg-white px-4">{children}</View>;
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
