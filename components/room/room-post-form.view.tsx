import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import { RoomOptionArtwork, RoomTypeArtwork } from '@/components/ui/ready-to-dev-assets';
import type { RegionSelectOption } from '@/lib/api';
import type { UserSummary } from '@/lib/domain';
import type { Region } from '@/lib/onboarding';

import { MAX_ROOM_PHOTOS } from './room-post-form.model';
import type { UseRoomPostFormReturn } from './use-room-post-form';

export type RoomPostFormViewProps = UseRoomPostFormReturn & {
  submitLabel: string;
  mode: 'create' | 'edit';
  profile?: UserSummary;
  submitting: boolean;
  onEditProfile: () => void;
};

export function RoomPostFormView({
  draft,
  canSubmit,
  photoCount,
  selectingPhotos,
  bottomPadding,
  submitLabel,
  mode,
  profile,
  submitting,
  onEditProfile,
  roomTypes,
  roomOptions,
  regionCities,
  regionDistricts,
  regionNeighborhoods,
  activeRegionCityId,
  activeRegionDistrictId,
  setTitle,
  setDeposit,
  setRent,
  setMaintenance,
  selectRoomType,
  selectRegionCity,
  selectRegionDistrict,
  selectRegion,
  setMoveInDate,
  addPhotos,
  removePhoto,
  toggleOption,
  setDescription,
  submit,
}: RoomPostFormViewProps) {
  return (
    <>
      <ScrollView
        contentContainerClassName="gap-6 p-5 pb-28"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {mode === 'edit' ? (
          <View className="flex-row items-center gap-2 rounded-xl border border-[#256EF4]/30 bg-[#256EF4]/10 px-3 py-2.5">
            <Ionicons name="create-outline" size={18} color="#256EF4" />
            <Text className="flex-1 text-xs text-[#256EF4]">
              기존 게시글을 수정하고 있어요. 수정 완료 후 저장해주세요
            </Text>
          </View>
        ) : null}

        <Section title="사진">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {photoCount < MAX_ROOM_PHOTOS ? (
              <AddPhotoSlot onPress={addPhotos} disabled={selectingPhotos} />
            ) : null}
            {draft.imageUris.map((uri, index) => (
              <PhotoSlot key={`${uri}-${index}`} uri={uri} index={index} onRemove={removePhoto} />
            ))}
            {Array.from({ length: Math.max(0, 3 - photoCount) }).map((_, index) => (
              <EmptyPhotoSlot key={`empty-photo-${index}`} />
            ))}
          </ScrollView>
          <Text className="self-end text-sm">
            <Text className="font-semibold text-[#256EF4]">{photoCount}</Text>
            <Text className="text-neutral-500">/{MAX_ROOM_PHOTOS}</Text>
          </Text>
        </Section>

        <Section title="기본 정보">
          <Field label="게시글 제목">
            <TextField
              value={draft.title}
              onChangeValue={setTitle}
              placeholder="예) 신촌역 도보 5분, 풀옵션 원룸"
              className="border-b border-[#AAAABA] px-0 py-3 text-sm"
            />
          </Field>

          <Field label="게시글 내용">
            <TextField
              value={draft.description}
              onChangeValue={setDescription}
              placeholder="조용하고 깔끔한 환경 원하시는 분 환영합니다. 풀옵션 구비되어 있고 햇살이 잘 들어오는 남향 방이에요..."
              multiline
              numberOfLines={6}
              maxLength={500}
              className="min-h-[120px] border-b border-[#AAAABA] px-0 py-3 text-sm leading-6"
            />
            <Text className="self-end text-xs text-neutral-400">
              {draft.description.length} / 500자
            </Text>
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="보증금" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput value={draft.deposit} onChange={setDeposit} placeholder="1,000만" />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="월세" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput value={draft.rent} onChange={setRent} placeholder="55만" />
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
            {roomTypes.map((rt) => {
              const selected = draft.roomType === rt.value;
              return (
                <Pressable
                  key={rt.value}
                  onPress={() => selectRoomType(rt.value)}
                  className={`flex-row items-center gap-1.5 rounded-lg border py-1.5 pl-2 pr-4 active:opacity-80 ${
                    selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <RoomTypeArtwork label={rt.label} size={28} />
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
          <RegionTable
            selected={draft.regions[0] ?? null}
            cities={regionCities}
            districts={regionDistricts}
            neighborhoods={regionNeighborhoods}
            activeCityId={activeRegionCityId}
            activeDistrictId={activeRegionDistrictId}
            onSelectCity={selectRegionCity}
            onSelectDistrict={selectRegionDistrict}
            onSelect={selectRegion}
          />
        </Section>

        <Section title="입주 가능 시기" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <View className="flex-row items-center gap-2 border-b border-[#AAAABA] py-3">
            <TextField
              value={draft.moveInDate}
              onChangeValue={setMoveInDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              className="flex-1 text-sm text-neutral-900"
            />
            <Ionicons name="calendar-outline" size={20} color="#AAAABA" />
          </View>
        </Section>

        {roomOptions.length > 0 ? (
          <Section title="방 옵션" badge="최대 4개">
            <View className="flex-row flex-wrap gap-2">
              {roomOptions.map((o) => {
                const selected = draft.options.includes(o.value);
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => toggleOption(o.value)}
                    className={`h-[42px] flex-row items-center gap-1.5 rounded-lg border px-3 active:opacity-80 ${
                      selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <RoomOptionArtwork label={o.label} size={22} />
                    <Text
                      className={
                        selected
                          ? 'text-base font-medium text-[#256EF4]'
                          : 'text-base font-medium text-[#696976]'
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

        <Section title="생활패턴 · 선호 룸메이트 조건">
          <View className="flex-row items-center justify-between rounded-xl bg-[#256EF4]/10 px-4 py-2.5">
            <Text className="text-xs text-[#256EF4]">프로필에서 자동으로 불러왔어요</Text>
            <Pressable
              hitSlop={4}
              onPress={onEditProfile}
              className="flex-row items-center gap-0.5"
            >
              <Text className="text-xs text-[#256EF4]">마이페이지에서 수정</Text>
              <Ionicons name="chevron-forward" size={13} color="#256EF4" />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <ProfileTile
              label="취침 시간"
              value={
                profile?.lifestyle?.sleepTime && profile?.lifestyle?.wakeTime
                  ? `${profile.lifestyle.sleepTime}~${profile.lifestyle.wakeTime}`
                  : '미입력'
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
                  : '미입력'
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
                  : '미입력'
              }
            />
            <ProfileTile
              label="흡연"
              value={
                profile?.lifestyle?.smoking === 'no'
                  ? '비흡연'
                  : profile?.lifestyle?.smoking === 'outdoor'
                    ? '실외만'
                    : '미입력'
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
            <KeyValueRow
              label="중요 조건"
              value={profile?.importantConditions.slice(0, 2).join(' · ') || '미입력'}
            />
          </View>
        </Section>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
        style={{ paddingBottom: bottomPadding }}
      >
        <Pressable
          onPress={submit}
          disabled={!canSubmit || submitting}
          className={`h-12 items-center justify-center rounded-xl ${
            canSubmit && !submitting ? 'bg-[#256EF4]' : 'bg-neutral-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={
                canSubmit
                  ? 'text-base font-semibold text-white'
                  : 'text-base font-semibold text-neutral-500'
              }
            >
              {submitLabel}
            </Text>
          )}
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
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 border-b border-[#AAAABA] py-3">
      <TextField
        value={value}
        onChangeValue={(t) => onChange(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder={placeholder}
        className="flex-1 text-sm text-neutral-900"
      />
    </View>
  );
}

function AddPhotoSlot({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-20 w-20 items-center justify-center rounded bg-[#E4E4EE] active:opacity-70"
    >
      <Ionicons name="add" size={30} color="#696976" />
      <Text className="mt-0.5 text-[10px] text-neutral-500">
        {disabled ? '불러오는 중' : '사진 추가'}
      </Text>
    </Pressable>
  );
}

function EmptyPhotoSlot() {
  return <View className="h-20 w-20 rounded bg-[#F1F1F6]" />;
}

function PhotoSlot({
  uri,
  index,
  onRemove,
}: {
  uri: string;
  index: number;
  onRemove: (index: number) => void;
}) {
  return (
    <View className="relative h-20 w-20 overflow-hidden rounded bg-neutral-100">
      <Image source={{ uri }} style={{ width: 80, height: 80 }} contentFit="cover" />
      {index === 0 ? (
        <View className="absolute bottom-1 left-1 rounded bg-[#256EF4] px-1.5 py-0.5">
          <Text className="text-[9px] font-medium text-white">대표</Text>
        </View>
      ) : null}
      <Pressable
        onPress={() => onRemove(index)}
        hitSlop={6}
        className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
        accessibilityLabel={`${index + 1}번째 사진 삭제`}
      >
        <Ionicons name="close" size={13} color="white" />
      </Pressable>
    </View>
  );
}

function RegionTable({
  selected,
  cities,
  districts,
  neighborhoods,
  activeCityId,
  activeDistrictId,
  onSelectCity,
  onSelectDistrict,
  onSelect,
}: {
  selected: Region | null;
  cities: RegionSelectOption[];
  districts: RegionSelectOption[];
  neighborhoods: RegionSelectOption[];
  activeCityId: string | null;
  activeDistrictId: string | null;
  onSelectCity: (id: string) => void;
  onSelectDistrict: (id: string) => void;
  onSelect: (r: Region) => void;
}) {
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
          {cities.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => onSelectCity(city.id)}
              className="items-center py-1.5"
            >
              <Text
                className={
                  activeCityId === city.id
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
            return (
              <Pressable
                key={option.id}
                onPress={() => onSelectDistrict(option.id)}
                className="items-center py-0.5"
              >
                <Text
                  className={
                    activeDistrictId === option.id
                      ? 'text-xs font-medium text-[#256EF4]'
                      : 'text-xs text-neutral-600'
                  }
                >
                  {option.region.district}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-1 gap-1 py-2">
          {neighborhoods.length === 0 ? (
            <Text className="py-1.5 text-center text-xs text-neutral-400">선택 없음</Text>
          ) : (
            neighborhoods.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.region)}
                className="items-center py-0.5"
              >
                <Text
                  className={
                    selected?.id === option.id
                      ? 'text-xs font-medium text-[#256EF4]'
                      : 'text-xs text-neutral-600'
                  }
                >
                  {option.region.district.split(' ').at(-1)}
                </Text>
              </Pressable>
            ))
          )}
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
