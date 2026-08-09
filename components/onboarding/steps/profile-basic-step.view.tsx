import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

import { BottomSheet, Modal, TermsAgreement, TextField } from '@/components/ui/headless';
import { IdentityVerificationArtwork } from '@/components/ui/ready-to-dev-assets';
import { PROFILE_NAME_MAX_LENGTH, type Gender, type Term } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';
import {
  GENDER_OPTIONS,
  type ProfileBasicStage,
  type UseProfileBasicStepReturn,
} from './use-profile-basic-step';

export type ProfileBasicStepViewProps = UseProfileBasicStepReturn;

export function ProfileBasicStepView({
  profile,
  stage,
  birthText,
  fieldError,
  dialog,
  termsOpen,
  terms,
  termOptions,
  termsLoading,
  termsError,
  termsToastVisible,
  canAcceptTerms,
  submitting,
  submitError,
  canProceed,
  onBack,
  onContinue,
  onNameChange,
  onBirthChange,
  onGenderChange,
  onEmailChange,
  onDialogClose,
  onExit,
  onTermsOpenChange,
  onTermsChange,
  onTermsContinue,
  onTermDetailPress,
}: ProfileBasicStepViewProps) {
  const [genderOpen, setGenderOpen] = useState(false);
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  if (stage === 'intro') {
    return (
      <View className="flex-1 bg-white">
        <BasicInfoHeader onBack={onBack} />
        <View className="flex-1 items-center px-4 pt-6">
          <View className="w-full">
            <Text className="text-2xl font-bold leading-9 text-[#17171B]">
              노크인을 시작하기 위해{'\n'}기본 정보를 입력해주세요
            </Text>
          </View>
          <View className="w-full flex-1 items-center justify-center">
            <IdentityVerificationArtwork size={226} />
          </View>
        </View>
        <OnboardingFooter canProceed primaryLabel="30초만에 입력하기" onPress={onContinue} />
      </View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" style={keyboardAvoidingStyle}>
      <BasicInfoHeader onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text className="text-[20px] font-bold leading-[30px] text-[#17171B]">
          {STAGE_PROMPTS[stage]}
        </Text>

        <View className="mt-9">
          {stage === 'name' ? (
            <TextField
              key="name"
              autoFocus
              value={profile.name}
              onChangeValue={onNameChange}
              placeholder="이름"
              maxLength={PROFILE_NAME_MAX_LENGTH}
              invalid={Boolean(fieldError)}
              returnKeyType="next"
              onSubmitEditing={onContinue}
              className={inputClassName(Boolean(fieldError))}
            />
          ) : null}

          {stage === 'birth' ? (
            <TextField
              key="birth"
              autoFocus
              value={birthText}
              onChangeValue={onBirthChange}
              placeholder="생년월일 8자리"
              keyboardType="number-pad"
              invalid={Boolean(fieldError)}
              className={inputClassName(Boolean(fieldError))}
            />
          ) : null}

          {stage === 'gender' ? (
            <Pressable
              onPress={() => setGenderOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="성별 선택"
              className={inputClassName(Boolean(fieldError))}
            >
              <Text
                className={`flex-1 text-xl ${profile.gender ? 'text-[#17171B]' : 'text-[#AAAABA]'}`}
              >
                {genderLabel(profile.gender) ?? '성별'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#AAAABA" />
            </Pressable>
          ) : null}

          {stage === 'email' ? (
            <TextField
              key="email"
              autoFocus
              value={profile.email}
              onChangeValue={onEmailChange}
              placeholder="이메일"
              keyboardType="email-address"
              invalid={Boolean(fieldError)}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onContinue}
              className={inputClassName(Boolean(fieldError))}
            />
          ) : null}

          {fieldError ? (
            <Text className="mt-1.5 text-xs font-medium leading-[18px] text-[#D63D4A]">
              {fieldError}
            </Text>
          ) : null}
        </View>

        <CompletedBasicFields
          stage={stage}
          name={profile.name}
          birth={birthText}
          gender={profile.gender}
        />
      </ScrollView>

      {submitError ? (
        <View className="px-4 pb-1">
          <Text className="text-sm text-[#E5484D]">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음으로"
        loading={submitting}
        onPress={onContinue}
        keyboardAware
      />

      <BottomSheet
        open={genderOpen}
        onOpenChange={setGenderOpen}
        contentClassName="h-[201px] rounded-t-[20px] bg-white px-5 pt-2"
        handleClassName="mx-auto mb-7 h-0.5 w-[66px] rounded-full bg-black/60"
      >
        <Text className="mb-6 text-[19px] font-bold leading-[29px] text-[#17171B]">
          성별을 알려주세요
        </Text>
        <View className="gap-4">
          {GENDER_OPTIONS.map((option) => {
            const selected = profile.gender === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onGenderChange(option.value);
                  setGenderOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                className="h-[27px] flex-row items-center justify-between"
              >
                <Text
                  className={`text-lg font-medium leading-[27px] ${
                    selected ? 'text-[#256EF4]' : 'text-[#696976]'
                  }`}
                >
                  {option.label}
                </Text>
                {selected ? <Ionicons name="checkmark" size={22} color="#256EF4" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <TermsBottomSheet
        open={termsOpen}
        terms={terms}
        termOptions={termOptions}
        loading={termsLoading}
        error={termsError}
        toastVisible={termsToastVisible}
        canContinue={canAcceptTerms}
        onOpenChange={onTermsOpenChange}
        onTermsChange={onTermsChange}
        onContinue={onTermsContinue}
        onTermDetailPress={onTermDetailPress}
      />

      <BasicInfoDialog variant={dialog} onClose={onDialogClose} onExit={onExit} />
    </Animated.View>
  );
}

const STAGE_PROMPTS: Record<Exclude<ProfileBasicStage, 'intro'>, string> = {
  name: '이름을 알려주세요',
  birth: '생년월일을 알려주세요',
  gender: '성별을 알려주세요',
  email: '이메일을 알려주세요',
};

function BasicInfoHeader({ onBack }: { onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center justify-between px-4">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
      >
        <Ionicons name="chevron-back" size={24} color="#6B6B76" />
      </Pressable>
      <Text className="text-lg font-normal text-[#17171B]">기본 정보</Text>
      <View className="h-10 w-10" />
    </View>
  );
}

function inputClassName(invalid: boolean): string {
  return `h-[40px] w-full flex-row items-center border-b border-[#256EF4] p-0 text-xl text-[#17171B] ${
    invalid ? 'border-[#256EF4]' : ''
  }`;
}

function CompletedBasicFields({
  stage,
  name,
  birth,
  gender,
}: {
  stage: Exclude<ProfileBasicStage, 'intro'>;
  name: string;
  birth: string;
  gender: Gender | null;
}) {
  const fields =
    stage === 'birth'
      ? [{ label: '이름', value: name }]
      : stage === 'gender'
        ? [
            { label: '생년월일', value: birth },
            { label: '이름', value: name },
          ]
        : stage === 'email'
          ? [
              { label: '성별', value: genderLabel(gender) ?? '' },
              { label: '생년월일', value: birth },
              { label: '이름', value: name },
            ]
          : [];

  if (!fields.length) return null;

  return (
    <View className="mt-6 gap-6">
      {fields.map((field) => (
        <View key={field.label} className="gap-2">
          <Text className="text-sm leading-[21px] text-[#AAAABA]">{field.label}</Text>
          <View className="h-[34px] justify-start border-b border-[#AAAABA]">
            <Text className="text-xl leading-[30px] text-[#17171B]">{field.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function genderLabel(gender: Gender | null): string | null {
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? null;
}

function TermsBottomSheet({
  open,
  terms,
  termOptions,
  loading,
  error,
  toastVisible,
  canContinue,
  onOpenChange,
  onTermsChange,
  onContinue,
  onTermDetailPress,
}: {
  open: boolean;
  terms: Record<string, boolean>;
  termOptions: Term[];
  loading: boolean;
  error: string | null;
  toastVisible: boolean;
  canContinue: boolean;
  onOpenChange: (open: boolean) => void;
  onTermsChange: (terms: Record<string, boolean>) => void;
  onContinue: () => void;
  onTermDetailPress: (termKey: string) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      backdropClassName="flex-1 justify-end bg-[#17171B]/40"
      contentClassName="rounded-t-[20px] bg-white px-5 pt-2"
      handleClassName="mx-auto mb-7 h-0.5 w-[66px] rounded-full bg-black/60"
    >
      {toastVisible ? <RequiredTermToast /> : null}

      <Text className="text-[19px] font-bold leading-[29px] text-[#17171B]">
        기본 정보 입력이 완료되었어요{'\n'}서비스 이용에 필요한 약관을 확인해주세요
      </Text>

      <TermsAgreement.Root
        terms={termOptions}
        value={terms}
        onValueChange={onTermsChange}
        disabled={loading}
        className="mt-7 gap-3"
      >
        <TermsAgreement.ToggleAll className="h-7 flex-row items-center gap-3">
          {({ checked }) => (
            <>
              <CheckIcon checked={checked} size={24} />
              <Text
                className={`text-lg font-bold leading-[27px] ${
                  checked ? 'text-[#17171B]' : 'text-[#696976]'
                }`}
              >
                전체 동의
              </Text>
            </>
          )}
        </TermsAgreement.ToggleAll>

        <View className="h-px bg-[#DADAE8]" />

        <View className="gap-3">
          {termOptions.map((term) => (
            <TermsAgreement.Item
              key={term.key}
              termKey={term.key}
              className="h-8 flex-row items-center gap-3.5"
            >
              {({ checked, required, label }) => (
                <>
                  <CheckIcon checked={checked} size={20} />
                  <Text className="flex-1 text-[15px] leading-[23px] text-[#696976]">
                    [{required ? '필수' : '선택'}] {label}
                  </Text>
                  <TermDetailLink termKey={term.key} onPress={onTermDetailPress} />
                </>
              )}
            </TermsAgreement.Item>
          ))}
        </View>
      </TermsAgreement.Root>

      {error ? (
        <Text className="mt-2 text-xs leading-[18px] text-[#D63D4A]">
          약관을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </Text>
      ) : !loading && termOptions.length === 0 ? (
        <Text className="mt-2 text-xs leading-[18px] text-[#D63D4A]">
          서버에 등록된 약관이 없어요.
        </Text>
      ) : null}

      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        className={`mt-6 h-12 items-center justify-center rounded-lg ${
          canContinue ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
        }`}
      >
        <Text className={`text-base font-bold ${canContinue ? 'text-white' : 'text-[#AAAABA]'}`}>
          확인
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

function TermDetailLink({
  termKey,
  onPress,
}: {
  termKey: string;
  onPress: (termKey: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="약관 상세 보기"
      hitSlop={8}
      className="h-8 w-8 items-center justify-center active:opacity-60"
      onPress={(event) => {
        event.stopPropagation();
        onPress(termKey);
      }}
    >
      <Ionicons name="chevron-forward" size={24} color="#AAAABA" />
    </Pressable>
  );
}

function CheckIcon({ checked, size }: { checked: boolean; size: 20 | 24 }) {
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Ionicons name="checkmark" size={size} color={checked ? '#256EF4' : '#DADAE8'} />
    </View>
  );
}

function RequiredTermToast() {
  return (
    <View className="absolute -top-[42px] left-[34px] h-8 w-[252px] flex-row items-center justify-center gap-2 rounded-lg bg-[#696976]">
      <View className="h-4 w-4 items-center justify-center rounded-full bg-[#FFB114]">
        <Text className="text-[11px] font-bold leading-4 text-[#8A5C00]">!</Text>
      </View>
      <Text className="text-[13px] leading-5 text-white">필수 항목을 선택해주세요</Text>
    </View>
  );
}

function BasicInfoDialog({
  variant,
  onClose,
  onExit,
}: {
  variant: 'cancel' | 'underage' | null;
  onClose: () => void;
  onExit: () => void;
}) {
  if (!variant) return null;

  const underage = variant === 'underage';
  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Portal>
        <Modal.Backdrop className="flex-1 items-center justify-center bg-[#17171B]/40">
          <Pressable onPress={(event) => event.stopPropagation()}>
            <Modal.Content
              className={`w-[286px] items-center justify-center rounded-[10px] bg-white ${
                underage ? 'min-h-[162px] px-6 py-5' : 'h-[162px] p-5'
              }`}
            >
              <View className="items-center gap-2">
                <Text className="text-center text-lg font-bold leading-[27px] text-[#2D2D2D]">
                  {underage ? '만 14세 미만은 가입할 수 없어요' : '입력을 그만두시겠어요?'}
                </Text>
                <Text className="text-center text-sm leading-[21px] text-[#42454A]">
                  {underage
                    ? '관련 법령에 따라 만 14세 미만은\n회원가입이 제한돼요'
                    : '조금만 더 진행하면 완료돼요.'}
                </Text>
              </View>

              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={underage ? onExit : onClose}
                  className="h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#ECECF3]"
                >
                  <Text className="text-[15px] font-bold text-[#AAAABA]">
                    {underage ? '나가기' : '취소'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={underage ? onClose : onExit}
                  className="h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#256EF4]"
                >
                  <Text className="text-[15px] font-bold text-white">
                    {underage ? '확인' : '그만두기'}
                  </Text>
                </Pressable>
              </View>
            </Modal.Content>
          </Pressable>
        </Modal.Backdrop>
      </Modal.Portal>
    </Modal.Root>
  );
}
