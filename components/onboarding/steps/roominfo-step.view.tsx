import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import { RangeField } from '@/components/ui/range-field';
import {
  OnboardingCompleteArtwork,
  RoomPresenceArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';

import { CalendarField } from '../calendar-field';
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
  dongOptions,
  roomTypeOptions,
  today,
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
  selectSido,
  selectGugun,
  selectDong,
  removeRegion,
  setDeposit,
  setMonthlyRent,
  toggleSingleRoomType,
  setMoveInDate,
  setBudgetDeposit,
  setBudgetRent,
  toggleRoomType,
  setMoveInBy,
}: UseRoomInfoStepReturn) {
  if (stage === 5) {
    return (
      <View className="flex-1 bg-white">
        <View className="h-12 justify-center px-4">
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="이전으로"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
          >
            <Ionicons name="chevron-back" size={24} color="#6B6B76" />
          </Pressable>
        </View>
        <View className="flex-1 items-center px-4 pt-14">
          <View className="items-center gap-2">
            <Text className="text-center text-2xl font-bold leading-9 text-[#17171B]">
              모든 준비가 끝났어요!
            </Text>
            <Text className="text-center text-base text-[#696976]">
              지금부터 나와 맞는 룸메이트를 만나보세요
            </Text>
          </View>
          <View className="mt-8">
            <OnboardingCompleteArtwork size={256} />
          </View>
        </View>
        <OnboardingFooter
          canProceed={canProceed}
          primaryLabel="시작하기"
          loading={submitting}
          onPress={onNext}
        />
      </View>
    );
  }

  const regionTable = (
    <RegionTable
      draft={draft}
      cityOptions={cityOptions}
      gugunOptions={gugunOptions}
      dongOptions={dongOptions}
      onSelectSido={selectSido}
      onSelectGugun={selectGugun}
      onSelectDong={selectDong}
    />
  );

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
          <Section label={hasRoom ? '방 위치' : `선호 방 위치 · 최대 ${MAX_REGIONS}개`}>
            {regionTable}
            {noRoom && room.regions.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {room.regions.map((region) => (
                  <Pressable
                    key={region.id}
                    onPress={() => removeRegion(region.id)}
                    className="flex-row items-center gap-1 rounded-full bg-[#256EF4]/10 px-3 py-1 active:opacity-80"
                  >
                    <Text className="text-xs text-[#256EF4]">
                      {region.city} {region.district}
                    </Text>
                    <Ionicons name="close" size={12} color="#256EF4" />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </Section>
        ) : null}

        {stage === 2 && hasRoom ? (
          <View className="gap-5">
            <NumberField
              label="보증금"
              placeholder="예) 1000 (0 입력 가능)"
              value={room.deposit}
              onChange={setDeposit}
            />
            <NumberField
              label="월세"
              placeholder="예) 50"
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

        {stage === 4 ? (
          <Section label={hasRoom ? '입주 가능 시기' : '입주 희망 시기'}>
            <CalendarField
              value={hasRoom ? room.moveInDate : room.moveInBy}
              onChange={hasRoom ? setMoveInDate : setMoveInBy}
              minDate={today}
            />
          </Section>
        ) : null}
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-2">
          <Text className="text-xs text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음으로"
        loading={submitting}
        onPress={onNext}
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

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}

function StageIntro({ stage, hasRoom }: { stage: number; hasRoom: boolean }) {
  const copy =
    stage === 0
      ? ['현재 머물고 있는', '방이 있으신가요?', '언제든 마이페이지에서 변경할 수 있어요']
      : stage === 1
        ? [
            hasRoom ? '방이 있는 지역을' : '희망하는 지역을',
            '선택해주세요',
            '지역은 나중에도 변경할 수 있어요',
          ]
        : stage === 2
          ? [
              hasRoom ? '현재 방의 가격을' : '희망하는 예산을',
              hasRoom ? '알려주세요' : '선택해주세요',
              '언제든 마이페이지에서 변경할 수 있어요',
            ]
          : stage === 3
            ? [
                hasRoom ? '현재 거주 중인' : '거주하고 싶은',
                '방 형태를 선택해주세요',
                hasRoom
                  ? '현재 거주 중인 방 형태를 선택해주세요'
                  : '원하는 방 형태를 최대 3개까지 선택해주세요',
              ]
            : [
                hasRoom ? '입주 가능한 시기를' : '입주 희망 시기를',
                '선택해주세요',
                '날짜는 나중에도 변경할 수 있어요',
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
      className={`h-[108px] w-[31%] items-center justify-center gap-1 rounded-[4px] border px-2 py-2 ${
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
      className={`min-h-24 flex-row items-center gap-3 rounded-[4px] border px-5 py-4 active:opacity-90 ${
        selected ? 'border-[#256EF4] bg-[#EEF4FF]' : 'border-[#DADAE8] bg-white'
      }`}
    >
      <RoomPresenceArtwork hasRoom={hasRoom} size={28} />
      <View className="flex-1 gap-1">
        <Text className={`text-base font-bold ${selected ? 'text-[#256EF4]' : 'text-neutral-900'}`}>
          {title}
        </Text>
        <Text className="text-sm text-neutral-500">{desc}</Text>
      </View>
    </Pressable>
  );
}

function RegionTable({
  draft,
  cityOptions,
  gugunOptions,
  dongOptions,
  onSelectSido,
  onSelectGugun,
  onSelectDong,
}: {
  draft: RegionDraft;
  cityOptions: { id: string; label: string }[];
  gugunOptions: { id: string; label: string }[];
  dongOptions: { id: string; label: string }[];
  onSelectSido: (v: string) => void;
  onSelectGugun: (v: string) => void;
  onSelectDong: (v: string) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-xl border border-neutral-200">
      <Column
        title="시·도"
        items={cityOptions}
        selected={draft.sido}
        onPick={onSelectSido}
        border
      />
      <Column
        title="구·군"
        items={gugunOptions}
        selected={draft.gugun}
        onPick={onSelectGugun}
        border
      />
      <Column title="동" items={dongOptions} selected={draft.dong} onPick={onSelectDong} />
    </View>
  );
}

function Column({
  title,
  items,
  selected,
  onPick,
  border,
}: {
  title: string;
  items: { id: string; label: string }[];
  selected: string | null;
  onPick: (v: string) => void;
  border?: boolean;
}) {
  return (
    <View className={`flex-1 ${border ? 'border-r border-neutral-200' : ''}`}>
      <View className="border-b border-neutral-200 bg-neutral-50 py-2">
        <Text className="text-center text-xs text-neutral-500">{title}</Text>
      </View>
      <ScrollView
        style={{ maxHeight: 138 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {items.map((it) => {
          const on = it.id === selected;
          return (
            <Pressable
              key={it.id}
              onPress={() => onPick(it.id)}
              className={`py-3 ${on ? 'bg-[#256EF4]/10' : ''}`}
            >
              <Text
                className={`text-center text-sm ${on ? 'font-medium text-[#256EF4]' : 'text-neutral-700'}`}
              >
                {it.label}
              </Text>
            </Pressable>
          );
        })}
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
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <TextField
        value={value == null ? '' : String(value)}
        onChangeValue={(t) => {
          const digits = t.replace(/[^0-9]/g, '');
          onChange(digits === '' ? null : Number(digits));
        }}
        placeholder={placeholder}
        keyboardType="number-pad"
        className="rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900"
      />
    </View>
  );
}
