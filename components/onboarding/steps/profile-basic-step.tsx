import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';

import { SegmentedControl, TermsAgreement, TextField } from '@/components/ui/headless';
import { TERMS, useOnboardingProfile, useOnboardingTerms, type Gender } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

function formatBirth(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/** "YYYY.MM.DD" / "YYYY-MM-DD" 문자열을 Date 로. 유효하지 않으면 null. */
function parseBirth(text: string): Date | null {
  const m = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 와이어프레임의 회색 채움 입력 박스 스타일 */
const INPUT_CLS = 'rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900';

export function ProfileBasicStep() {
  const { profile, patch } = useOnboardingProfile();
  const { terms, setTerms, isTermsValid } = useOnboardingTerms();
  const [birthText, setBirthText] = useState(() => formatBirth(profile.birthDate));

  const onBirthChange = (text: string) => {
    setBirthText(text);
    patch({ birthDate: parseBirth(text) });
  };

  const canProceed =
    profile.name.trim().length > 0 &&
    profile.gender !== null &&
    profile.birthDate !== null &&
    EMAIL_RE.test(profile.email) &&
    isTermsValid;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">안녕하세요! 👋</Text>
          <Text className="text-2xl font-bold text-neutral-900">기본 정보를 알려주세요</Text>
          <Text className="mt-1 text-sm text-neutral-500">정확한 매칭을 위해 필요한 정보예요</Text>
        </View>

        <Field label="이름">
          <TextField
            value={profile.name}
            onChangeValue={(v) => patch({ name: v })}
            placeholder="이름을 입력해주세요"
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
              onValueChange={(v) => patch({ gender: v })}
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`rounded-full border px-4 py-2.5 ${
                    selected ? 'border-violet-600 bg-violet-100' : 'border-neutral-300 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-violet-700' : 'text-sm text-neutral-600'
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
            onChangeValue={(v) => patch({ email: v })}
            placeholder="이메일을 입력해주세요"
            keyboardType="email-address"
            autoCapitalize="none"
            className={INPUT_CLS}
          />
        </Field>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral-800">약관 동의</Text>
          <TermsAgreement.Root
            terms={TERMS}
            value={terms}
            onValueChange={setTerms}
            className="gap-3"
          >
            <TermsAgreement.ToggleAll className="flex-row items-center gap-2">
              {({ checked }) => (
                <>
                  <CheckBox checked={checked} circle />
                  <Text className="text-sm font-medium text-neutral-700">전체 동의</Text>
                </>
              )}
            </TermsAgreement.ToggleAll>

            <View className="h-px bg-neutral-100" />

            {TERMS.map((term) => (
              <TermsAgreement.Item
                key={term.key}
                termKey={term.key}
                className="flex-row items-center gap-2"
              >
                {({ checked, required, label, href }) => (
                  <>
                    <CheckBox checked={checked} />
                    <Text className="flex-1 text-sm text-neutral-500">
                      [{required ? '필수' : '선택'}] {label}
                    </Text>
                    <Text
                      className="text-base text-neutral-300"
                      onPress={href ? () => Linking.openURL(href) : undefined}
                    >
                      ›
                    </Text>
                  </>
                )}
              </TermsAgreement.Item>
            ))}
          </TermsAgreement.Root>
        </View>
      </ScrollView>

      <OnboardingFooter canProceed={canProceed} primaryLabel="다음" />
    </View>
  );
}

function CheckBox({ checked, circle = false }: { checked: boolean; circle?: boolean }) {
  const shape = circle ? 'rounded-full' : 'rounded';
  return (
    <View
      className={`h-5 w-5 items-center justify-center ${shape} ${
        checked ? 'bg-violet-600' : 'border border-neutral-300 bg-white'
      }`}
    >
      {checked ? <Text className="text-[11px] font-bold text-white">✓</Text> : null}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
