import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  BirthDateField,
  RegionPicker,
  SegmentedControl,
  TextField,
} from '@/components/ui/headless';
import {
  REGIONS,
  useOnboardingProfile,
  type Gender,
  type PreferredGender,
} from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
] as const;

const PREFERRED_GENDER_OPTIONS = [
  { value: 'same', label: '동성만' },
  { value: 'any', label: '성별 무관' },
] as const;

export function ProfileBasicStep() {
  const { profile, patch } = useOnboardingProfile();

  const canProceed =
    profile.name.trim().length > 0 &&
    profile.birthDate !== null &&
    profile.gender !== null &&
    profile.preferredGender !== null &&
    profile.regions.length > 0 &&
    profile.bio.trim().length > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            기본 정보를 알려주세요
          </Text>
          <Text className="text-sm text-neutral-500">
            룸메이트 매칭에 필요한 기본 정보예요.
          </Text>
        </View>

        <Field label="이름">
          <TextField
            value={profile.name}
            onChangeValue={(v) => patch({ name: v })}
            placeholder="실명 또는 별명"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
        </Field>

        <Field label="생년월일">
          <BirthDateField
            value={profile.birthDate}
            onValueChange={(v) => patch({ birthDate: v })}
          >
            {({ yearField, monthField, dayField, isValid, isComplete }) => (
              <View className="gap-1">
                <View className="flex-row gap-2">
                  <TextInput
                    ref={yearField.ref}
                    value={yearField.value}
                    onChangeText={yearField.onChangeText}
                    maxLength={yearField.maxLength}
                    keyboardType={yearField.keyboardType}
                    placeholder={yearField.placeholder}
                    className="flex-[2] rounded-xl border border-neutral-200 px-4 py-3 text-center text-base"
                  />
                  <TextInput
                    ref={monthField.ref}
                    value={monthField.value}
                    onChangeText={monthField.onChangeText}
                    maxLength={monthField.maxLength}
                    keyboardType={monthField.keyboardType}
                    placeholder={monthField.placeholder}
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-center text-base"
                  />
                  <TextInput
                    ref={dayField.ref}
                    value={dayField.value}
                    onChangeText={dayField.onChangeText}
                    maxLength={dayField.maxLength}
                    keyboardType={dayField.keyboardType}
                    placeholder={dayField.placeholder}
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-center text-base"
                  />
                </View>
                {isComplete && !isValid ? (
                  <Text className="text-xs text-red-500">
                    올바른 날짜를 입력해주세요
                  </Text>
                ) : null}
              </View>
            )}
          </BirthDateField>
        </Field>

        <Field label="성별">
          <SegmentedControl<Gender>
            options={GENDER_OPTIONS as unknown as { value: Gender; label: string }[]}
            value={profile.gender}
            onValueChange={(v) => patch({ gender: v })}
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`flex-1 items-center rounded-xl border px-4 py-3 ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected ? 'text-blue-600' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Field>

        <Field
          label="선호 룸메이트 성별"
          helper="동성만 선택 시 이성 카드는 노출되지 않아요."
        >
          <SegmentedControl<PreferredGender>
            options={
              PREFERRED_GENDER_OPTIONS as unknown as {
                value: PreferredGender;
                label: string;
              }[]
            }
            value={profile.preferredGender}
            onValueChange={(v) => patch({ preferredGender: v })}
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`flex-1 items-center rounded-xl border px-4 py-3 ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected ? 'text-blue-600' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Field>

        <Field
          label="희망 지역"
          helper="검색하여 거주 희망 지역을 선택하세요. (최대 5개)"
        >
          <RegionPicker
            regions={REGIONS}
            value={profile.regions}
            onValueChange={(v) => patch({ regions: v })}
            max={5}
          >
            {({
              query,
              setQuery,
              clearQuery,
              items,
              value,
              remove,
              remaining,
            }) => (
              <View className="gap-3">
                <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
                  <Text className="text-base text-neutral-400">⌕</Text>
                  <TextField
                    value={query}
                    onChangeValue={setQuery}
                    placeholder="구/동 이름으로 검색"
                    className="flex-1 text-base"
                  />
                  {query.length > 0 ? (
                    <Text
                      className="text-xs text-neutral-400"
                      onPress={clearQuery}
                    >
                      지우기
                    </Text>
                  ) : null}
                </View>

                {value.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {value.map((r) => (
                      <View
                        key={r.id}
                        className="flex-row items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5"
                      >
                        <Text className="text-sm text-blue-700">
                          {r.city} {r.district}
                        </Text>
                        <Text
                          className="text-base text-blue-400"
                          onPress={() => remove(r.id)}
                        >
                          ×
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {remaining !== null ? (
                  <Text className="text-xs text-neutral-400">
                    남은 선택 가능 {remaining}개
                  </Text>
                ) : null}

                <View className="max-h-64 gap-1 rounded-xl border border-neutral-100">
                  <ScrollView nestedScrollEnabled>
                    {items.length === 0 ? (
                      <View className="px-4 py-6">
                        <Text className="text-sm text-neutral-400">
                          일치하는 지역이 없어요
                        </Text>
                      </View>
                    ) : (
                      items.map((item) => (
                        <View
                          key={item.region.id}
                          className="border-b border-neutral-50 last:border-b-0"
                          onTouchEnd={item.disabled ? undefined : item.onPress}
                        >
                          <View className="flex-row items-center justify-between px-4 py-3">
                            <Text
                              className={
                                item.disabled && !item.selected
                                  ? 'text-sm text-neutral-300'
                                  : 'text-sm text-neutral-800'
                              }
                            >
                              {item.region.city} {item.region.district}
                            </Text>
                            {item.selected ? (
                              <Text className="text-sm text-blue-600">✓</Text>
                            ) : null}
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
          </RegionPicker>
        </Field>

        <Field label="한 줄 소개">
          <TextField
            value={profile.bio}
            onChangeValue={(v) => patch({ bio: v })}
            placeholder="간단한 자기소개를 적어주세요"
            multiline
            numberOfLines={3}
            className="min-h-[80px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
        </Field>
      </ScrollView>

      <OnboardingFooter canProceed={canProceed} />
    </View>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {helper ? (
        <Text className="text-xs text-neutral-500">{helper}</Text>
      ) : null}
      {children}
    </View>
  );
}
