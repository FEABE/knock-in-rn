import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import { REGIONS, ROOM_TYPES, type Region, type RoomType } from '@/lib/onboarding';
import type { RoomOption, UserSummary } from '@/lib/domain';

export type RoomFormValues = {
  title: string;
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
  roomType: RoomType;
  region: Region;
  description: string;
  moveInDate?: Date;
  options: RoomOption[];
  showProfileInfo: boolean;
};

export type RoomFormDraft = {
  title: string;
  deposit: string;
  rent: string;
  maintenance: string;
  roomType: RoomType | null;
  regions: Region[];
  description: string;
  moveInDate: string; // yyyy-mm-dd
  options: RoomOption[];
  showProfileInfo: boolean;
};

export function emptyRoomFormDraft(): RoomFormDraft {
  return {
    title: '',
    deposit: '',
    rent: '',
    maintenance: '',
    roomType: null,
    regions: [],
    description: '',
    moveInDate: '',
    options: [],
    showProfileInfo: true,
  };
}

export function isRoomFormDraftValid(draft: RoomFormDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    Number(draft.deposit) >= 0 &&
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
    deposit: Number(draft.deposit) || 0,
    monthlyRent: Number(draft.rent),
    maintenanceFee: Number(draft.maintenance) || 0,
    roomType: draft.roomType,
    region: draft.regions[0],
    description: draft.description.trim(),
    moveInDate: parseDate(draft.moveInDate),
    options: draft.options,
    showProfileInfo: draft.showProfileInfo,
  };
}

function parseDate(text: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const OPTION_LIST: { value: RoomOption; label: string }[] = [
  { value: 'full-option', label: '풀옵션' },
  { value: 'parking', label: '주차 가능' },
  { value: 'elevator', label: '엘리베이터' },
  { value: 'pet', label: '반려동물 가능' },
];

const MAX_PHOTOS = 10;
const PHOTO_SLOTS = 4;

export type RoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  profile?: UserSummary;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
  mode = 'create',
  profile,
}: RoomPostFormProps) {
  const [draft, setDraft] = useState<RoomFormDraft>({
    ...emptyRoomFormDraft(),
    ...initial,
  });

  const patch = (next: Partial<RoomFormDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  const canSubmit = isRoomFormDraftValid(draft);
  const photoCount = 3; // placeholder count for visual

  return (
    <>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-28">
        {mode === 'edit' ? (
          <View className="flex-row items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
            <Text className="text-base">✎</Text>
            <Text className="flex-1 text-xs text-violet-700">
              기존 게시글을 수정하고 있어요. 수정 완료 후 저장해주세요
            </Text>
          </View>
        ) : null}

        <Section title="사진">
          <View className="flex-row gap-2">
            {Array.from({ length: PHOTO_SLOTS }).map((_, i) => (
              <PhotoSlot key={i} index={i} isAdd={i === PHOTO_SLOTS - 1} />
            ))}
          </View>
          <Text className="self-end text-xs text-neutral-400">
            {photoCount} / {MAX_PHOTOS}
          </Text>
        </Section>

        <Section title="기본 정보">
          <Field label="게시글 제목">
            <TextField
              value={draft.title}
              onChangeValue={(v) => patch({ title: v })}
              placeholder="예) 신촌역 도보 5분, 풀옵션 원룸"
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="보증금" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput
                  value={draft.deposit}
                  onChange={(v) => patch({ deposit: v })}
                  placeholder="1,000만"
                  rightLabel={mode === 'edit' ? '수정' : undefined}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="월세" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput
                  value={draft.rent}
                  onChange={(v) => patch({ rent: v })}
                  placeholder="55만"
                  rightLabel={mode === 'edit' ? '수정' : undefined}
                />
              </Field>
            </View>
          </View>

          <Field label="관리비">
            <NumberInput
              value={draft.maintenance}
              onChange={(v) => patch({ maintenance: v })}
              placeholder="없으면 0 입력"
            />
          </Field>
        </Section>

        <Section title="룸 형태" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <View className="flex-row flex-wrap gap-2">
            {ROOM_TYPES.map((rt) => {
              const selected = draft.roomType === rt.value;
              return (
                <Pressable
                  key={rt.value}
                  onPress={() => patch({ roomType: rt.value })}
                  className={`rounded-full border px-4 py-2 active:opacity-80 ${
                    selected ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-violet-700' : 'text-sm text-neutral-700'
                    }
                  >
                    {rt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="방 위치" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <RegionTable
            selected={draft.regions[0] ?? null}
            onSelect={(r) => patch({ regions: [r] })}
          />
        </Section>

        <Section title="입주 가능 시기" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3">
            <TextInput
              value={draft.moveInDate}
              onChangeText={(v) => patch({ moveInDate: v })}
              placeholder="2025-06-01"
              placeholderTextColor="#a3a3a3"
              className="flex-1 text-sm text-neutral-900"
            />
            <Text className="text-base text-neutral-400">📅</Text>
          </View>
        </Section>

        <Section title="옵션 (복수 선택)">
          <View className="flex-row flex-wrap gap-2">
            {OPTION_LIST.map((o) => {
              const selected = draft.options.includes(o.value);
              return (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    patch({
                      options: selected
                        ? draft.options.filter((x) => x !== o.value)
                        : [...draft.options, o.value],
                    });
                  }}
                  className={`rounded-full border px-3 py-1.5 active:opacity-80 ${
                    selected ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-xs font-medium text-violet-700' : 'text-xs text-neutral-700'
                    }
                  >
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="게시글 내용">
          <TextField
            value={draft.description}
            onChangeValue={(v) => patch({ description: v })}
            placeholder="조용하고 깔끔한 환경 원하시는 분 환영합니다. 풀옵션 구비되어 있고 햇살이 잘 들어오는 남향 방이에요..."
            multiline
            numberOfLines={6}
            className="min-h-[140px] rounded-xl border border-neutral-200 px-4 py-3 text-sm"
          />
          <Text className="self-end text-xs text-neutral-400">
            {draft.description.length} / 500자
          </Text>
        </Section>

        <Section title="생활패턴 · 선호 룸메이트 조건">
          <View className="flex-row items-center justify-between rounded-xl bg-violet-50/60 px-4 py-2.5">
            <Text className="text-xs text-violet-700">프로필에서 자동으로 불러왔어요</Text>
            <Pressable hitSlop={4}>
              <Text className="text-xs text-violet-700">마이페이지에서 수정 →</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <ProfileTile
              label="취침 시간"
              value={
                profile?.lifestyle?.sleepTime && profile?.lifestyle?.wakeTime
                  ? `${profile.lifestyle.sleepTime}~${profile.lifestyle.wakeTime}`
                  : '자정~새벽 1시'
              }
            />
            <ProfileTile
              label="청결 민감도"
              value={
                profile?.lifestyle?.cleanliness !== undefined
                  ? profile.lifestyle.cleanliness >= 4
                    ? '높음'
                    : profile.lifestyle.cleanliness >= 3
                      ? '보통'
                      : '낮음'
                  : '높음'
              }
            />
            <ProfileTile
              label="소음 민감도"
              value={
                profile?.lifestyle?.noise !== undefined
                  ? profile.lifestyle.noise >= 4
                    ? '높음'
                    : profile.lifestyle.noise >= 3
                      ? '보통'
                      : '낮음'
                  : '보통'
              }
            />
            <ProfileTile
              label="흡연"
              value={
                profile?.lifestyle?.smoking === 'no'
                  ? '비흡연'
                  : profile?.lifestyle?.smoking === 'outdoor'
                    ? '실외만'
                    : '비흡연'
              }
            />
          </View>

          <View className="gap-2 rounded-2xl bg-neutral-50 px-4 py-3">
            <KeyValueRow
              label="선호 성별"
              value={
                profile?.preferredGender === 'same'
                  ? profile.gender === 'female'
                    ? '여성만'
                    : '남성만'
                  : '성별 무관'
              }
            />
            <KeyValueRow label="흡연 여부" value="비흡연자" />
            <KeyValueRow
              label="중요 조건"
              value={profile?.importantConditions.slice(0, 2).join(' · ') || '청결 · 취침시간'}
            />
          </View>

          <Pressable
            onPress={() => patch({ showProfileInfo: !draft.showProfileInfo })}
            className="mt-1 flex-row items-center gap-2"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded ${
                draft.showProfileInfo ? 'bg-violet-600' : 'border border-neutral-300 bg-white'
              }`}
            >
              {draft.showProfileInfo ? <Text className="text-xs text-white">✓</Text> : null}
            </View>
            <Text className="text-xs text-neutral-700">게시글에 함께 표시해요</Text>
          </Pressable>
        </Section>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 py-3">
        <Pressable
          onPress={() => {
            const values = draftToValues(draft);
            if (values) onSubmit(values);
          }}
          disabled={!canSubmit}
          className={`h-12 items-center justify-center rounded-xl ${
            canSubmit ? 'bg-violet-600' : 'bg-neutral-300'
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

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-bold text-neutral-900">{title}</Text>
        {badge ? (
          <View className="rounded bg-neutral-100 px-2 py-0.5">
            <Text className="text-[10px] text-neutral-500">{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xs text-neutral-600">{label}</Text>
        {badge ? (
          <View className="rounded bg-neutral-100 px-1.5 py-0.5">
            <Text className="text-[10px] text-neutral-500">{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  rightLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rightLabel?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3">
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        className="flex-1 text-sm text-neutral-900"
      />
      {rightLabel ? (
        <Pressable hitSlop={4}>
          <Text className="text-xs text-violet-700">{rightLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PhotoSlot({ index, isAdd }: { index: number; isAdd: boolean }) {
  if (isAdd) {
    return (
      <Pressable className="h-20 flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
        <Text className="text-lg text-neutral-400">+</Text>
        <Text className="text-[10px] text-neutral-400">사진 추가</Text>
      </Pressable>
    );
  }
  return (
    <View className="h-20 flex-1 items-center justify-center rounded-xl bg-neutral-100">
      <Text className="text-xs text-neutral-400">📷</Text>
      {index === 0 ? (
        <View className="absolute left-1 top-1 rounded bg-violet-600 px-1.5 py-0.5">
          <Text className="text-[9px] font-medium text-white">대표</Text>
        </View>
      ) : null}
    </View>
  );
}

function RegionTable({
  selected,
  onSelect,
}: {
  selected: Region | null;
  onSelect: (r: Region) => void;
}) {
  const cities = ['서울', '경기', '인천'];
  const byCity = cities.map((c) => ({
    city: c,
    districts: REGIONS.filter((r) => r.city === c).slice(0, 4),
  }));

  return (
    <View className="rounded-xl border border-neutral-200">
      <View className="flex-row border-b border-neutral-100 bg-neutral-50">
        <View className="flex-1 py-2">
          <Text className="text-center text-[11px] text-neutral-500">시·도</Text>
        </View>
        <View className="flex-1 py-2">
          <Text className="text-center text-[11px] text-neutral-500">구·군</Text>
        </View>
        <View className="flex-1 py-2">
          <Text className="text-center text-[11px] text-neutral-500">동</Text>
        </View>
      </View>
      {byCity.map((row) => (
        <View key={row.city} className="flex-row border-b border-neutral-50">
          <View className="flex-1 items-center justify-center py-3">
            <Text
              className={
                selected?.city === row.city
                  ? 'text-sm font-semibold text-violet-700'
                  : 'text-sm text-neutral-700'
              }
            >
              {row.city}
            </Text>
          </View>
          <View className="flex-1 gap-1 py-2">
            {row.districts.map((r) => (
              <Pressable key={r.id} onPress={() => onSelect(r)} className="items-center py-0.5">
                <Text
                  className={
                    selected?.id === r.id
                      ? 'text-xs font-medium text-violet-700'
                      : 'text-xs text-neutral-600'
                  }
                >
                  {r.district}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-1 items-center justify-center py-3">
            <Text className="text-xs text-neutral-400">—</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-0.5 rounded-2xl bg-neutral-50 p-3">
      <Text className="text-[11px] text-neutral-500">{label}</Text>
      <Text className="text-sm font-semibold text-neutral-800">{value}</Text>
    </View>
  );
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-800">{value}</Text>
    </View>
  );
}
