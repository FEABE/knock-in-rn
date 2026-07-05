import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import { useRegionOptions, useRoomAddOptionOptions, useRoomTypeOptions } from '@/lib/api';
import type { UserSummary } from '@/lib/domain';
import type { Region } from '@/lib/onboarding';

import type { UseRoomPostFormReturn } from './use-room-post-form';

const MAX_PHOTOS = 10;
const PHOTO_SLOTS = 4;

export type RoomPostFormViewProps = UseRoomPostFormReturn & {
  submitLabel: string;
  mode: 'create' | 'edit';
  profile?: UserSummary;
};

export function RoomPostFormView({
  draft,
  canSubmit,
  photoCount,
  bottomPadding,
  submitLabel,
  mode,
  profile,
  setTitle,
  setDeposit,
  setRent,
  setMaintenance,
  selectRoomType,
  selectRegion,
  setMoveInDate,
  setImageUrlsText,
  toggleOption,
  setDescription,
  toggleProfileInfo,
  submit,
}: RoomPostFormViewProps) {
  const roomTypes = useRoomTypeOptions();
  const roomOptions = useRoomAddOptionOptions(mode === 'edit');

  return (
    <>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-28">
        {mode === 'edit' ? (
          <View className="flex-row items-center gap-2 rounded-xl border border-[#256EF4]/30 bg-[#256EF4]/10 px-3 py-2.5">
            <Text className="text-base">✎</Text>
            <Text className="flex-1 text-xs text-[#256EF4]">
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
          <TextField
            value={draft.imageUrlsText}
            onChangeValue={setImageUrlsText}
            placeholder="이미지 URL을 줄바꿈으로 입력 (최대 10개)"
            multiline
            numberOfLines={3}
            className="min-h-[84px] rounded-xl border border-neutral-200 px-4 py-3 text-sm"
          />
        </Section>

        <Section title="기본 정보">
          <Field label="게시글 제목">
            <TextField
              value={draft.title}
              onChangeValue={setTitle}
              placeholder="예) 신촌역 도보 5분, 풀옵션 원룸"
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="보증금" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput
                  value={draft.deposit}
                  onChange={setDeposit}
                  placeholder="1,000만"
                  rightLabel={mode === 'edit' ? '수정' : undefined}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="월세" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput
                  value={draft.rent}
                  onChange={setRent}
                  placeholder="55만"
                  rightLabel={mode === 'edit' ? '수정' : undefined}
                />
              </Field>
            </View>
          </View>

          <Field label="관리비">
            <NumberInput
              value={draft.maintenance}
              onChange={setMaintenance}
              placeholder="없으면 0 입력"
            />
          </Field>
        </Section>

        <Section title="룸 형태" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <View className="flex-row flex-wrap gap-2">
            {roomTypes.options.map((rt) => {
              const selected = draft.roomType === rt.value;
              return (
                <Pressable
                  key={rt.value}
                  onPress={() => selectRoomType(rt.value)}
                  className={`rounded-full border px-4 py-2 active:opacity-80 ${
                    selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-neutral-700'
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
          <RegionTable selected={draft.regions[0] ?? null} onSelect={selectRegion} />
        </Section>

        <Section title="입주 가능 시기" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3">
            <TextInput
              value={draft.moveInDate}
              onChangeText={setMoveInDate}
              placeholder="2025-06-01"
              placeholderTextColor="#a3a3a3"
              className="flex-1 text-sm text-neutral-900"
            />
            <Text className="text-base text-neutral-400">📅</Text>
          </View>
        </Section>

        {mode === 'edit' && roomOptions.options.length > 0 ? (
          <Section title="옵션 (복수 선택)">
            <View className="flex-row flex-wrap gap-2">
              {roomOptions.options.map((o) => {
                const selected = draft.options.includes(o.value);
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => toggleOption(o.value)}
                    className={`rounded-full border px-3 py-1.5 active:opacity-80 ${
                      selected
                        ? 'border-[#256EF4] bg-[#256EF4]/10'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text
                      className={
                        selected
                          ? 'text-xs font-medium text-[#256EF4]'
                          : 'text-xs text-neutral-700'
                      }
                    >
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>
        ) : null}

        <Section title="게시글 내용">
          <TextField
            value={draft.description}
            onChangeValue={setDescription}
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
          <View className="flex-row items-center justify-between rounded-xl bg-[#256EF4]/10 px-4 py-2.5">
            <Text className="text-xs text-[#256EF4]">프로필에서 자동으로 불러왔어요</Text>
            <Pressable hitSlop={4}>
              <Text className="text-xs text-[#256EF4]">마이페이지에서 수정 →</Text>
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

          <Pressable onPress={toggleProfileInfo} className="mt-1 flex-row items-center gap-2">
            <View
              className={`h-5 w-5 items-center justify-center rounded ${
                draft.showProfileInfo ? 'bg-[#256EF4]' : 'border border-neutral-300 bg-white'
              }`}
            >
              {draft.showProfileInfo ? <Text className="text-xs text-white">✓</Text> : null}
            </View>
            <Text className="text-xs text-neutral-700">게시글에 함께 표시해요</Text>
          </Pressable>
        </Section>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
        style={{ paddingBottom: bottomPadding }}
      >
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          className={`h-12 items-center justify-center rounded-xl ${
            canSubmit ? 'bg-[#256EF4]' : 'bg-neutral-300'
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
  children: ReactNode;
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

function Field({ label, badge, children }: { label: string; badge?: string; children: ReactNode }) {
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
          <Text className="text-xs text-[#256EF4]">{rightLabel}</Text>
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
        <View className="absolute left-1 top-1 rounded bg-[#256EF4] px-1.5 py-0.5">
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
  const regions = useRegionOptions();
  const [activeCity, setActiveCity] = useState<string | null>(regions.cities[0]?.id ?? null);

  useEffect(() => {
    if (!activeCity && regions.cities[0]) setActiveCity(regions.cities[0].id);
  }, [activeCity, regions.cities]);

  const districts = activeCity ? regions.getChildren(activeCity) : [];

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
      <View className="flex-row border-b border-neutral-50">
        <View className="flex-1 py-2">
          {regions.cities.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => setActiveCity(city.id)}
              className="items-center py-1.5"
            >
              <Text
                className={
                  activeCity === city.id
                    ? 'text-sm font-semibold text-[#256EF4]'
                    : 'text-sm text-neutral-700'
                }
              >
                {city.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-1 gap-1 py-2">
          {districts.map((option) => {
            const r = option.region;
            return (
              <Pressable key={r.id} onPress={() => onSelect(r)} className="items-center py-0.5">
                <Text
                  className={
                    selected?.id === r.id
                      ? 'text-xs font-medium text-[#256EF4]'
                      : 'text-xs text-neutral-600'
                  }
                >
                  {r.district}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-1 items-center justify-center py-3">
          <Text className="text-xs text-neutral-400">—</Text>
        </View>
      </View>
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
