import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { RegionFilterSheet } from '@/components/room/filters';
import { RoomRegionSheet } from '@/components/room/room-post-form.region-sheet';
import { TextField } from '@/components/ui/headless';
import { RangeField } from '@/components/ui/range-field';
import {
  RoomLocationArtwork,
  RoomPresenceArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';
import { ONBOARDING_PROGRESS_TOTAL } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';
import { MAX_PREF_ROOM_TYPES, MAX_REGIONS, type UseRoomInfoStepReturn } from './use-roominfo-step';

export function RoomInfoStepView({
  room,
  roomTypeOptions,
  roomTypeLoading,
  roomTypeError,
  regionPickerOpen,
  stage,
  stageTitle,
  stageProgress,
  hasRoom,
  noRoom,
  canProceed,
  submitting,
  submitError,
  onBack,
  onNext,
  setHasRoom,
  setRegionPickerOpen,
  reloadRoomTypes,
  setRegion,
  setRegions,
  removeRegion,
  setDeposit,
  setMonthlyRent,
  toggleSingleRoomType,
  setBudgetDeposit,
  setBudgetRent,
  toggleRoomType,
}: UseRoomInfoStepReturn) {
  const hasRegionSelection = hasRoom ? room.region != null : room.regions.length > 0;

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
        <Text className="w-14 text-right text-base">
          <Text className="text-[#17171B]">{stageProgress}</Text>
          <Text className="text-[#8B8B9B]">/{ONBOARDING_PROGRESS_TOTAL}</Text>
        </Text>
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
              selected={hasRoom ? room.region != null : room.regions.length > 0}
              onPress={() => setRegionPickerOpen(true)}
            />

            {!hasRegionSelection ? (
              <View className="flex-1 items-center justify-center">
                <RoomLocationArtwork size={180} />
              </View>
            ) : null}

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
          roomTypeLoading ? (
            <MetadataState message="방 형태를 불러오는 중이에요." loading />
          ) : roomTypeError ? (
            <MetadataState message="방 형태를 불러오지 못했어요." onRetry={reloadRoomTypes} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {roomTypeOptions.map((type) => {
                const selected = hasRoom
                  ? room.roomType === type.value
                  : room.roomTypes.includes(type.value);
                const disabled =
                  noRoom && !selected && room.roomTypes.length >= MAX_PREF_ROOM_TYPES;
                return (
                  <RoomTypeChoice
                    key={type.value}
                    label={type.label}
                    image={type.image}
                    selected={selected}
                    disabled={disabled}
                    onPress={() =>
                      hasRoom ? toggleSingleRoomType(type.value) : toggleRoomType(type.value)
                    }
                  />
                );
              })}
            </View>
          )
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

      {hasRoom ? (
        <RoomRegionSheet
          open={regionPickerOpen}
          onOpenChange={setRegionPickerOpen}
          value={room.region}
          onSelect={setRegion}
        />
      ) : noRoom ? (
        <RegionFilterSheet
          open={regionPickerOpen}
          onOpenChange={setRegionPickerOpen}
          value={room.regions}
          onChange={setRegions}
          maxSelection={MAX_REGIONS}
        />
      ) : null}
    </View>
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
    <View className="flex-1 items-center justify-center gap-3 py-16">
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

function StageIntro({ stage, hasRoom }: { stage: 0 | 1 | 2 | 3; hasRoom: boolean }) {
  const copy =
    stage === 0
      ? ['현재 머물고 있는', '방이 있으신가요?', '언제든 마이페이지에서 변경할 수 있어요']
      : stage === 1
        ? hasRoom
          ? ['거주하고 있는', '집의 주소를 선택해주세요', '언제든 마이페이지에서 변경할 수 있어요']
          : ['거주하고 싶은', '집의 주소를 선택해주세요', '언제든 마이페이지에서 변경할 수 있어요']
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
  image,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  image?: string | null;
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
      <RoomTypeArtwork label={label} image={image} size={66} />
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

function RegionSelectButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, 지역 선택`}
      className="h-[52px] flex-row items-center justify-center gap-1 rounded-lg border border-[#DADAE8] bg-white px-4 active:bg-[#F6F6FA]"
    >
      <Text
        className={
          selected ? 'text-[15px] font-medium text-[#17171B]' : 'text-[15px] text-[#696976]'
        }
        numberOfLines={1}
      >
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
            className="h-10 flex-row items-center gap-1 rounded-full bg-[#ECF2FE] px-4 active:opacity-80"
          >
            <Text className="text-[15px] font-medium text-[#256EF4]">
              {region.city} {region.district}
            </Text>
            <Ionicons name="close" size={18} color="#AAAABA" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
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
