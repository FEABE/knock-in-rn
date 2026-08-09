import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import {
  PriorityArtwork,
  RoomOptionArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';
import type { LifestyleSummaryItem, PreferencePrioritySummaryItem } from '@/lib/api';
import { formatSelectionLabel } from '@/lib/domain/selection-label';
import type { Region } from '@/lib/onboarding';

import { MAX_ROOM_DESCRIPTION_LENGTH, MAX_ROOM_PHOTOS } from './room-post-form.model';
import { RoomRegionSheet } from './room-post-form.region-sheet';
import type { UseRoomPostFormReturn } from './use-room-post-form';

export type RoomPostFormViewProps = UseRoomPostFormReturn & {
  submitLabel: string;
  mode: 'create' | 'edit';
  /** 서버 프로필과 생활패턴 메타 API를 결합한 생활패턴 전체. */
  lifestyleTiles?: LifestyleSummaryItem[];
  /** 서버(/users/me/preferences/all)에서 읽은 선호 룸메이트 조건. */
  preferredLifestyles?: LifestyleSummaryItem[];
  /** 서버에서 읽은 우선순위 조건. */
  importantConditions?: PreferencePrioritySummaryItem[];
  submitting: boolean;
  onEditProfile: () => void;
};

export function RoomPostFormView({
  draft,
  canSubmit,
  depositError,
  rentError,
  photoCount,
  selectingPhotos,
  bottomPadding,
  submitLabel,
  mode,
  lifestyleTiles,
  preferredLifestyles,
  importantConditions,
  submitting,
  onEditProfile,
  roomTypes,
  roomOptions,
  roomTypesLoading,
  roomTypesError,
  roomOptionsLoading,
  roomOptionsError,
  selectedRegion,
  regionSheetOpen,
  setRegionSheetOpen,
  setTitle,
  setDeposit,
  setRent,
  setMaintenance,
  selectRoomType,
  selectRegion,
  setMoveInDate,
  setNegotiable,
  addPhotos,
  removePhoto,
  toggleOption,
  setDescription,
  reloadRoomTypes,
  reloadRoomOptions,
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
              maxLength={MAX_ROOM_DESCRIPTION_LENGTH}
              className="min-h-[120px] border-b border-[#AAAABA] px-0 py-3 text-sm leading-6"
            />
            <Text className="self-end text-xs text-neutral-400">
              {draft.description.length} / {MAX_ROOM_DESCRIPTION_LENGTH}자
            </Text>
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="보증금" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput value={draft.deposit} onChange={setDeposit} placeholder="1,000만" />
                <FieldError message={depositError} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="월세" badge={mode === 'edit' ? '프로필 값' : undefined}>
                <NumberInput value={draft.rent} onChange={setRent} placeholder="55만" />
                <FieldError message={rentError} />
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
          {roomTypesLoading ? (
            <MetadataState message="방 형태를 불러오는 중이에요." loading />
          ) : roomTypesError ? (
            <MetadataState message="방 형태를 불러오지 못했어요." onRetry={reloadRoomTypes} />
          ) : (
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
                    <RoomTypeArtwork label={rt.label} image={rt.image} size={28} />
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
          )}
        </Section>

        <Section title="방 위치" badge={mode === 'edit' ? '프로필 값' : undefined}>
          <RegionSelectButton selected={selectedRegion} onPress={() => setRegionSheetOpen(true)} />
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
          <Field label="협의 가능 여부">
            <NegotiableSelector value={draft.negotiable} onChange={setNegotiable} />
          </Field>
        </Section>

        {roomOptionsLoading || roomOptionsError || roomOptions.length > 0 ? (
          <Section title="방 옵션">
            {roomOptionsLoading ? (
              <MetadataState message="방 옵션을 불러오는 중이에요." loading />
            ) : roomOptionsError ? (
              <MetadataState message="방 옵션을 불러오지 못했어요." onRetry={reloadRoomOptions} />
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {roomOptions.map((o) => {
                  const selected = draft.options.includes(o.value);
                  return (
                    <Pressable
                      key={o.value}
                      onPress={() => toggleOption(o.value)}
                      className={`min-h-[92px] w-[31%] items-center justify-center gap-2 rounded-lg border px-2 py-3 active:opacity-80 ${
                        selected
                          ? 'border-[#256EF4] bg-[#256EF4]/10'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <RoomOptionArtwork label={o.label} image={o.image} size={40} />
                      <Text
                        className={
                          selected
                            ? 'text-center text-xs font-semibold text-[#256EF4]'
                            : 'text-center text-xs font-medium text-[#696976]'
                        }
                      >
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
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
            {lifestyleTiles?.length ? (
              lifestyleTiles.map((tile) => (
                <ProfileTile key={tile.id} label={tile.label} value={tile.value} />
              ))
            ) : (
              <ProfileSummaryEmpty message="아직 생활패턴을 입력하지 않았어요" />
            )}
          </View>

          <Text className="text-[15px] font-bold text-[#17171B]">선호 룸메이트 조건</Text>
          {preferredLifestyles?.length ? (
            <View className="flex-row flex-wrap gap-2">
              {preferredLifestyles.map((item) => (
                <View
                  key={item.id}
                  className="h-[42px] flex-row items-center justify-center gap-2 rounded-lg border border-[#DADAE8] bg-white px-3"
                >
                  <PriorityArtwork
                    label={formatSelectionLabel(item.label, item.value)}
                    image={item.image}
                    size={22}
                  />
                  <Text className="text-[14px] font-medium leading-[21px] text-[#696976]">
                    {formatSelectionLabel(item.label, item.value)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <ProfileSummaryEmpty message="아직 선호 룸메이트 조건을 입력하지 않았어요" />
          )}

          <Text className="text-[16px] font-semibold text-[#256EF4]">우선순위</Text>
          {importantConditions?.length ? (
            <View className="flex-row flex-wrap gap-2">
              {importantConditions.map((condition) => (
                <View
                  key={condition.id}
                  className="h-[42px] flex-row items-center justify-center gap-2 rounded-lg bg-[#ECF2FE] px-3"
                >
                  <PriorityArtwork label={condition.name} image={condition.image} size={22} />
                  <Text className="text-[14px] font-medium leading-[21px] text-[#17171B]">
                    {condition.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <ProfileSummaryEmpty message="아직 우선순위를 선택하지 않았어요" />
          )}
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

      <RoomRegionSheet
        open={regionSheetOpen}
        onOpenChange={setRegionSheetOpen}
        value={selectedRegion}
        onSelect={selectRegion}
      />
    </>
  );
}

/** "지역 선택하기 ∨" 버튼. 선택된 지역이 있으면 지역명을 보여준다. */
export function RegionSelectButton({
  selected,
  onPress,
}: {
  selected: Region | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="지역 선택하기"
      className="h-[52px] flex-row items-center justify-center gap-1 rounded-lg border border-[#DADAE8] bg-white px-4 active:bg-[#F6F6FA]"
    >
      <Text
        className={
          selected ? 'text-[15px] font-medium text-[#17171B]' : 'text-[15px] text-[#696976]'
        }
      >
        {selected ? `${selected.city} ${selected.district}` : '지역 선택하기'}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#696976" />
    </Pressable>
  );
}

/** 협의 가능 여부(가능해요/불가능해요) 선택 카드. */
export function NegotiableSelector({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (next: boolean) => void;
}) {
  return (
    <View className="flex-row gap-4">
      <NegotiableOption
        label="가능해요"
        selected={value === true}
        onPress={() => onChange(true)}
        icon={<View className="h-[18px] w-[18px] rounded-full border-[3px] border-[#E5202E]" />}
      />
      <NegotiableOption
        label="불가능해요"
        selected={value === false}
        onPress={() => onChange(false)}
        icon={<Ionicons name="close" size={28} color="#E5202E" />}
      />
    </View>
  );
}

function NegotiableOption({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg border ${
        selected ? 'border-[#256EF4] bg-[#ECF2FE]' : 'border-[#DADAE8] bg-white'
      } active:opacity-80`}
    >
      {icon}
      <Text
        className={selected ? 'text-base font-semibold text-[#256EF4]' : 'text-base text-[#696976]'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MetadataState({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View className="items-center justify-center gap-3 rounded-lg bg-[#F6F6FA] py-8">
      {loading ? <ActivityIndicator color="#256EF4" /> : null}
      <Text className="text-sm text-[#696976]">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} className="rounded-lg bg-[#ECF2FE] px-4 py-2">
          <Text className="text-sm font-medium text-[#256EF4]">다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
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

/** 서버 상한 초과 등 필드 단위 인라인 안내. */
export function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text className="text-xs text-[#E5484D]">{message}</Text>;
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

export function PhotoSlot({
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

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-0.5 rounded-2xl bg-neutral-50 p-3">
      <Text className="text-[11px] text-neutral-500">{label}</Text>
      <Text className="text-sm font-semibold text-neutral-800">{value}</Text>
    </View>
  );
}

function ProfileSummaryEmpty({ message }: { message: string }) {
  return (
    <View className="w-full rounded-lg bg-[#F6F6FA] px-4 py-4">
      <Text className="text-[13px] text-[#696976]">{message}</Text>
    </View>
  );
}
