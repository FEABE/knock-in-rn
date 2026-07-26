import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, TextField } from '@/components/ui/headless';
import { RangeField } from '@/components/ui/range-field';
import {
  RoomLocationArtwork,
  RoomPresenceArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';

import { OnboardingFooter } from '../onboarding-footer';
import {
  MAX_PREF_ROOM_TYPES,
  MAX_REGIONS,
  type RegionDraft,
  type UseRoomInfoStepReturn,
} from './use-roominfo-step';

export function RoomInfoStepView({
  room,
  draft,
  cityOptions,
  gugunOptions,
  roomTypeOptions,
  regionPickerOpen,
  regionLoading,
  regionError,
  stage,
  stageTitle,
  stageProgress,
  hasRoom,
  noRoom,
  canProceed,
  toast,
  submitting,
  submitError,
  onBack,
  onNext,
  setHasRoom,
  setRegionPickerOpen,
  reloadRegions,
  selectSido,
  selectGugun,
  removeRegion,
  setDeposit,
  setMonthlyRent,
  toggleSingleRoomType,
  setBudgetDeposit,
  setBudgetRent,
  toggleRoomType,
}: UseRoomInfoStepReturn) {
  return (
    <View className="flex-1 bg-white">
      <View className="h-12 flex-row items-center justify-between px-4">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#6B6B76" />
        </Pressable>
        <Text className="text-[18px] font-medium text-[#1E1E24]">{stageTitle}</Text>
        <Text className="w-14 text-right text-base text-[#8B8B9B]">{stageProgress}/15</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 py-6 pb-4"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <StageIntro stage={stage} hasRoom={hasRoom} />

        {stage === 0 ? (
          <View className="gap-4">
            <RoomChoice
              hasRoom
              title="방이 있어요"
              desc="룸메이트를 찾고 싶어요"
              selected={hasRoom}
              onPress={() => setHasRoom(true)}
            />
            <RoomChoice
              hasRoom={false}
              title="방이 없어요"
              desc="방과 룸메이트를 함께 찾고 싶어요"
              selected={noRoom}
              onPress={() => setHasRoom(false)}
            />
          </View>
        ) : null}

        {stage === 1 ? (
          <View className="flex-1 justify-between gap-6">
            <RegionSelectButton
              label={
                hasRoom && room.region
                  ? `${room.region.city} ${room.region.district}`.trim()
                  : '지역 선택하기'
              }
              onPress={() => setRegionPickerOpen(true)}
            />

            <View className="flex-1 items-center justify-center">
              <RoomLocationArtwork size={180} />
            </View>

            {noRoom && room.regions.length > 0 ? (
              <SelectedRegions regions={room.regions} max={MAX_REGIONS} onRemove={removeRegion} />
            ) : null}
          </View>
        ) : null}

        {stage === 2 && hasRoom ? (
          <View className="gap-5">
            <NumberField
              label="보증금"
              placeholder="보증금"
              value={room.deposit}
              onChange={setDeposit}
            />
            <NumberField
              label="월세"
              placeholder="월세"
              value={room.monthlyRent}
              onChange={setMonthlyRent}
            />
          </View>
        ) : null}

        {stage === 2 && noRoom ? (
          <View className="gap-8">
            <RangeField
              label="보증금"
              min={0}
              max={6000}
              step={100}
              value={[room.budgetDeposit.min, room.budgetDeposit.max]}
              onChange={([min, max]) => setBudgetDeposit({ min, max })}
              tickLabels={['최소', '400만', '1,200만', '최대']}
              scaleStops={[0, 400, 1200, 6000]}
            />
            <RangeField
              label="월세"
              min={0}
              max={500}
              step={10}
              value={[room.budgetRent.min, room.budgetRent.max]}
              onChange={([min, max]) => setBudgetRent({ min, max })}
              tickLabels={['최소', '125만', '250만', '최대']}
              scaleStops={[0, 125, 250, 500]}
            />
          </View>
        ) : null}

        {stage === 3 ? (
          <View className="flex-row flex-wrap gap-3">
            {roomTypeOptions.map((type) => {
              const selected = hasRoom
                ? room.roomType === type.value
                : room.roomTypes.includes(type.value);
              const disabled = noRoom && !selected && room.roomTypes.length >= MAX_PREF_ROOM_TYPES;
              return (
                <RoomTypeChoice
                  key={type.value}
                  label={type.label}
                  selected={selected}
                  disabled={disabled}
                  onPress={() =>
                    hasRoom ? toggleSingleRoomType(type.value) : toggleRoomType(type.value)
                  }
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-2">
          <Text className="text-xs text-red-500">{submitError}</Text>
        </View>
      ) : null}

      {stage > 0 ? (
        <OnboardingFooter
          canProceed={canProceed}
          primaryLabel="다음으로"
          loading={submitting}
          onPress={onNext}
        />
      ) : null}

      <RegionPickerSheet
        open={regionPickerOpen}
        onOpenChange={setRegionPickerOpen}
        draft={draft}
        cityOptions={cityOptions}
        districtOptions={gugunOptions}
        loading={regionLoading}
        error={regionError}
        onRetry={reloadRegions}
        onSelectCity={selectSido}
        onSelectDistrict={selectGugun}
      />

      {toast ? (
        <View pointerEvents="none" className="absolute inset-x-0 bottom-28 items-center px-5">
          <View className="rounded-full bg-neutral-800/90 px-4 py-2">
            <Text className="text-sm text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function StageIntro({ stage, hasRoom }: { stage: 0 | 1 | 2 | 3; hasRoom: boolean }) {
  const copy =
    stage === 0
      ? ['현재 머물고 있는', '방이 있으신가요?', '언제든 마이페이지에서 변경할 수 있어요']
      : stage === 1
        ? [
            hasRoom ? '거주하고 있는' : '거주하고 싶은',
            '집의 주소를 선택해주세요',
            '언제든 마이페이지에서 변경할 수 있어요',
          ]
        : stage === 2
          ? [
              hasRoom ? '거주하고 있는 집의' : '희망하는 예산을',
              hasRoom ? '예산을 선택해주세요' : '선택해주세요',
              '언제든 마이페이지에서 변경할 수 있어요',
            ]
          : [
              hasRoom ? '거주하고 있는' : '거주하고 싶은',
              '방 형태를 선택해주세요',
              hasRoom
                ? '거주하고 있는 방의 형태를 선택해주세요'
                : '원하시는 방 형태를 최대 3개까지 선택해주세요',
            ];

  return (
    <View className="gap-1">
      <Text className="text-xl font-bold leading-[30px] text-neutral-900">
        {copy[0]}
        {`\n`}
        {copy[1]}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500">{copy[2]}</Text>
    </View>
  );
}

function RoomTypeChoice({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-[108px] w-[31%] items-center justify-center gap-1 rounded border px-2 py-2 ${
        selected
          ? 'border-[#256EF4] bg-[#EEF4FF]'
          : disabled
            ? 'border-neutral-200 bg-neutral-50'
            : 'border-[#DADAE8] bg-white active:opacity-80'
      }`}
    >
      <RoomTypeArtwork label={label} size={66} />
      <Text
        className={
          selected
            ? 'text-sm font-medium text-[#256EF4]'
            : disabled
              ? 'text-sm text-neutral-300'
              : 'text-sm text-neutral-600'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RoomChoice({
  hasRoom,
  title,
  desc,
  selected,
  onPress,
}: {
  hasRoom: boolean;
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-24 rounded-lg border px-5 py-4 active:opacity-90 ${
        selected ? 'border-[#256EF4] bg-[#EEF4FF]' : 'border-transparent bg-[#F6F6FA]'
      }`}
    >
      <View className="gap-1.5">
        <View className="flex-row items-end gap-2">
          <RoomPresenceArtwork hasRoom={hasRoom} size={28} />
          <Text
            className={`text-[17px] font-bold leading-[26px] ${
              selected ? 'text-[#256EF4]' : 'text-[#17171B]'
            }`}
          >
            {title}
          </Text>
        </View>
        <Text className="text-sm text-neutral-500">{desc}</Text>
      </View>
    </Pressable>
  );
}

function RegionSelectButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, 지역 선택`}
      className="h-[46px] flex-row items-center justify-center gap-1.5 rounded-lg border border-[#DADAE8] bg-white px-3 active:bg-[#F6F6FA]"
    >
      <Text className="text-[15px] font-medium text-[#696976]" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#696976" />
    </Pressable>
  );
}

function SelectedRegions({
  regions,
  max,
  onRemove,
}: {
  regions: { id: string; city: string; district: string }[];
  max: number;
  onRemove: (id: string) => void;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-[15px] font-medium text-[#696976]">선택 지역</Text>
        <Text className="text-[15px] font-medium text-[#17171B]">
          {regions.length}
          <Text className="text-[#AAAABA]">/{max}</Text>
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 pr-4"
      >
        {regions.map((region) => (
          <Pressable
            key={region.id}
            onPress={() => onRemove(region.id)}
            accessibilityRole="button"
            accessibilityLabel={`${region.city} ${region.district} 삭제`}
            className="h-[42px] flex-row items-center gap-0.5 rounded-full bg-[#ECF2FE] px-3 active:opacity-80"
          >
            <Text className="text-[15px] font-medium text-[#256EF4]">
              {region.city} {region.district}
            </Text>
            <Ionicons name="close" size={17} color="#8AAFF8" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function RegionPickerSheet({
  open,
  onOpenChange,
  draft,
  cityOptions,
  districtOptions,
  loading,
  error,
  onRetry,
  onSelectCity,
  onSelectDistrict,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: RegionDraft;
  cityOptions: { id: string; label: string }[];
  districtOptions: { id: string; label: string }[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectCity: (v: string) => void;
  onSelectDistrict: (v: string) => void;
}) {
  const selectingDistrict = Boolean(draft.sido);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle={false}
      contentClassName="rounded-t-[20px] bg-white px-6 pb-6 pt-5"
    >
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {selectingDistrict ? (
            <Pressable
              onPress={() => onSelectCity('')}
              hitSlop={8}
              accessibilityLabel="시·도 다시 선택"
            >
              <Ionicons name="chevron-back" size={22} color="#696976" />
            </Pressable>
          ) : null}
          <Text className="text-lg font-bold text-[#17171B]">
            {selectingDistrict ? '구·군 선택' : '지역 선택'}
          </Text>
        </View>
        <Pressable
          onPress={() => onOpenChange(false)}
          hitSlop={10}
          accessibilityLabel="지역 선택 닫기"
        >
          <Ionicons name="close" size={24} color="#696976" />
        </Pressable>
      </View>

      {loading ? (
        <View className="h-28 items-center justify-center gap-2">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#696976]">지역 정보를 불러오는 중이에요.</Text>
        </View>
      ) : error ? (
        <View className="h-28 items-center justify-center gap-3">
          <Text className="text-sm text-[#696976]">지역 정보를 불러오지 못했어요.</Text>
          <Pressable onPress={onRetry} className="rounded-lg bg-[#ECF2FE] px-4 py-2">
            <Text className="text-sm font-medium text-[#256EF4]">다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <RegionOptionGrid
          items={selectingDistrict ? districtOptions : cityOptions}
          selected={selectingDistrict ? draft.gugun : draft.sido}
          emptyLabel={selectingDistrict ? '선택할 구·군이 없어요.' : '선택할 지역이 없어요.'}
          onPick={selectingDistrict ? onSelectDistrict : onSelectCity}
        />
      )}
    </BottomSheet>
  );
}

function RegionOptionGrid({
  items,
  selected,
  emptyLabel,
  onPick,
}: {
  items: { id: string; label: string }[];
  selected: string | null;
  emptyLabel: string;
  onPick: (v: string) => void;
}) {
  if (items.length === 0) {
    return (
      <View className="h-28 items-center justify-center">
        <Text className="text-sm text-[#AAAABA]">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap">
        {items.map((item) => {
          const active = item.id === selected;
          return (
            <Pressable
              key={item.id}
              onPress={() => onPick(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="h-10 items-center justify-center"
              style={{ width: '20%' }}
            >
              <Text
                className={`text-base ${
                  active ? 'font-semibold text-[#256EF4]' : 'font-medium text-[#17171B]'
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function NumberField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: number | null;
  onChange: (n: number | null) => void;
}) {
  return (
    <View className="gap-3">
      <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">{label}</Text>
      <View className="h-9 flex-row items-center border-b border-[#AAAABA]">
        <TextField
          value={value == null ? '' : String(value)}
          onChangeValue={(t) => {
            const digits = t.replace(/[^0-9]/g, '');
            onChange(digits === '' ? null : Number(digits));
          }}
          placeholder={placeholder}
          keyboardType="number-pad"
          className="h-9 flex-1 py-0 text-[15px] text-[#17171B]"
        />
        <Text className="text-[15px] text-[#AAAABA]">만원</Text>
      </View>
    </View>
  );
}
