import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  ChipMultiSelect,
  RegionPicker,
  SegmentedControl,
  TextField,
} from '@/components/ui/headless';
import { REGIONS, ROOM_TYPES, type Region, type RoomType } from '@/lib/onboarding';

export type RoomFormValues = {
  title: string;
  deposit: number;
  monthlyRent: number;
  roomType: RoomType;
  region: Region;
  description: string;
  features: string[];
};

export type RoomFormDraft = {
  title: string;
  deposit: string;
  rent: string;
  roomType: RoomType | null;
  regions: Region[];
  description: string;
  features: string[];
};

export function emptyRoomFormDraft(): RoomFormDraft {
  return {
    title: '',
    deposit: '',
    rent: '',
    roomType: null,
    regions: [],
    description: '',
    features: [],
  };
}

export function isRoomFormDraftValid(draft: RoomFormDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    Number(draft.deposit) > 0 &&
    Number(draft.rent) > 0 &&
    draft.roomType !== null &&
    draft.regions.length > 0 &&
    draft.description.trim().length > 0
  );
}

export function draftToValues(draft: RoomFormDraft): RoomFormValues | null {
  if (!isRoomFormDraftValid(draft) || draft.roomType === null) return null;
  return {
    title: draft.title.trim(),
    deposit: Number(draft.deposit),
    monthlyRent: Number(draft.rent),
    roomType: draft.roomType,
    region: draft.regions[0],
    description: draft.description.trim(),
    features: draft.features,
  };
}

const FEATURE_OPTIONS = [
  { value: 'fullopt', label: '풀옵션' },
  { value: 'pet', label: '반려동물 가능' },
  { value: 'no-smoking', label: '실내 금연' },
  { value: 'female-only', label: '여성 전용' },
  { value: 'male-only', label: '남성 전용' },
  { value: 'short-term', label: '단기 가능' },
];

export type RoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  submitLabel: string;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
}: RoomPostFormProps) {
  const [draft, setDraft] = useState<RoomFormDraft>({
    ...emptyRoomFormDraft(),
    ...initial,
  });

  const patch = (next: Partial<RoomFormDraft>) =>
    setDraft((prev) => ({ ...prev, ...next }));

  const canSubmit = isRoomFormDraftValid(draft);

  return (
    <>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-28">
        <Field label="제목">
          <TextField
            value={draft.title}
            onChangeValue={(v) => patch({ title: v })}
            placeholder="방을 한 줄로 소개해주세요"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="보증금 (만원)">
              <TextInput
                value={draft.deposit}
                onChangeText={(t) =>
                  patch({ deposit: t.replace(/\D/g, '') })
                }
                keyboardType="number-pad"
                placeholder="1000"
                className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="월세 (만원)">
              <TextInput
                value={draft.rent}
                onChangeText={(t) => patch({ rent: t.replace(/\D/g, '') })}
                keyboardType="number-pad"
                placeholder="80"
                className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
              />
            </Field>
          </View>
        </View>

        <Field label="방 형태">
          <SegmentedControl<RoomType>
            options={ROOM_TYPES}
            value={draft.roomType}
            onValueChange={(v) => patch({ roomType: v })}
            className="flex-row flex-wrap gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`rounded-full border px-4 py-2 ${
                  selected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'text-sm font-medium text-white'
                      : 'text-sm text-neutral-700'
                  }
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Field>

        <Field label="지역 (최대 3개)">
          <RegionPicker
            regions={REGIONS}
            value={draft.regions}
            onValueChange={(v) => patch({ regions: v })}
            max={3}
          >
            {({ query, setQuery, clearQuery, items, value, remove }) => (
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
                <View className="max-h-56 rounded-xl border border-neutral-100">
                  <ScrollView nestedScrollEnabled>
                    {items.map((item) => (
                      <View
                        key={item.region.id}
                        onTouchEnd={item.disabled ? undefined : item.onPress}
                        className="flex-row items-center justify-between border-b border-neutral-50 px-4 py-3"
                      >
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
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </RegionPicker>
        </Field>

        <Field label="옵션 (선택)">
          <ChipMultiSelect
            options={FEATURE_OPTIONS}
            value={draft.features}
            onValueChange={(v) => patch({ features: v })}
            className="flex-row flex-wrap gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`rounded-full border px-3 py-1.5 ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'text-xs font-medium text-blue-600'
                      : 'text-xs text-neutral-700'
                  }
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Field>

        <Field label="상세 설명">
          <TextField
            value={draft.description}
            onChangeValue={(v) => patch({ description: v })}
            placeholder="방의 위치, 옵션, 입주 조건 등을 자유롭게 적어주세요"
            multiline
            numberOfLines={6}
            className="min-h-[140px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
        </Field>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 py-3">
        <Pressable
          onPress={() => {
            const values = draftToValues(draft);
            if (values) onSubmit(values);
          }}
          disabled={!canSubmit}
          className={`h-12 items-center justify-center rounded-xl ${
            canSubmit ? 'bg-blue-600' : 'bg-neutral-300'
          }`}
        >
          <Text
            className={
              canSubmit
                ? 'text-base font-semibold text-white'
                : 'text-base font-semibold text-neutral-500'
            }
          >
            {submitLabel}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
