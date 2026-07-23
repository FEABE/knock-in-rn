import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { TextField, SegmentedControl } from '@/components/ui/headless';
import { PROFILE_NAME_MAX_LENGTH, type Gender } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';
import { GENDER_OPTIONS, type UseProfileBasicStepReturn } from './use-profile-basic-step';

const INPUT_CLS = 'rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900';

export type ProfileBasicStepViewProps = UseProfileBasicStepReturn;

export function ProfileBasicStepView({
  profile,
  birthText,
  submitting,
  submitError,
  canProceed,
  onNameChange,
  onBirthChange,
  onGenderChange,
  onEmailChange,
  onNext,
}: ProfileBasicStepViewProps) {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-7 px-5 py-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">안녕하세요! 👋</Text>
          <Text className="text-2xl font-bold text-neutral-900">기본 정보를 알려주세요</Text>
          <Text className="mt-1 text-sm text-neutral-500">정확한 매칭을 위해 필요한 정보예요</Text>
        </View>

        <Field label="이름">
          <TextField
            value={profile.name}
            onChangeValue={onNameChange}
            placeholder="이름을 입력해주세요"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            className={INPUT_CLS}
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-semibold text-neutral-800">생년월일</Text>
            <TextField
              value={birthText}
              onChangeValue={onBirthChange}
              placeholder="YYYY.MM.DD"
              keyboardType="numbers-and-punctuation"
              className={INPUT_CLS}
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-semibold text-neutral-800">성별</Text>
            <SegmentedControl<Gender>
              options={GENDER_OPTIONS as unknown as { value: Gender; label: string }[]}
              value={profile.gender}
              onValueChange={onGenderChange}
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`rounded-full border px-4 py-2.5 ${
                    selected ? 'border-[#256EF4] bg-[#256EF4]/15' : 'border-neutral-300 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-neutral-600'
                    }
                  >
                    {option.label}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        <Field label="이메일">
          <TextField
            value={profile.email}
            onChangeValue={onEmailChange}
            placeholder="이메일을 입력해주세요"
            keyboardType="email-address"
            autoCapitalize="none"
            className={INPUT_CLS}
          />
        </Field>
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-1">
          <Text className="text-sm text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음"
        loading={submitting}
        onPress={onNext}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
