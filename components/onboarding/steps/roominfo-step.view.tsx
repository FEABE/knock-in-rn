import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { CalendarField } from '../calendar-field';
import { OnboardingFooter } from '../onboarding-footer';
import { RangeField } from '../range-field';
import {
  DONG,
  GUGUN,
  MAX_PREF_ROOM_TYPES,
  MAX_REGIONS,
  ROOM_INFO_ROOM_TYPES,
  SIDO,
  type RegionDraft,
  type UseRoomInfoStepReturn,
} from './use-roominfo-step';

export function RoomInfoStepView({
  room,
  draft,
  today,
  hasRoom,
  noRoom,
  canProceed,
  toast,
  submitting,
  submitError,
  onComplete,
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
  setBudgetManagement,
  toggleRoomType,
  setMoveInBy,
}: UseRoomInfoStepReturn) {
  const regionTable = (
    <RegionTable
      draft={draft}
      onSelectSido={selectSido}
      onSelectGugun={selectGugun}
      onSelectDong={selectDong}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-6 pb-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">현재 방이 있으신가요?</Text>
          <Text className="mt-1 text-sm text-neutral-500">나중에 마이페이지에서 수정 가능해요</Text>
        </View>

        <View className="flex-row gap-3">
          <RoomChoice
            icon="⌂"
            title="방 있어요"
            desc="룸메이트를 구하고 있어요"
            selected={hasRoom}
            onPress={() => setHasRoom(true)}
          />
          <RoomChoice
            icon="⌕"
            title="방 없어요"
            desc="방이랑 룸메이트 함께 찾아요"
            selected={noRoom}
            onPress={() => setHasRoom(false)}
          />
        </View>

        {hasRoom ? (
          <>
            <Section label="방 위치">{regionTable}</Section>

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

            <Section label="방 형태">
              <View className="flex-row flex-wrap gap-2">
                {ROOM_INFO_ROOM_TYPES.map((t) => (
                  <Chip
                    key={t.value}
                    label={t.label}
                    selected={room.roomType === t.value}
                    onPress={() => toggleSingleRoomType(t.value)}
                  />
                ))}
              </View>
            </Section>

            <Section label="입주 가능 시기">
              <CalendarField value={room.moveInDate} onChange={setMoveInDate} minDate={today} />
            </Section>
          </>
        ) : null}

        {noRoom ? (
          <>
            <Section label={`선호 방 위치 (필수 · 최대 ${MAX_REGIONS}개)`}>
              {regionTable}
              {room.regions.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {room.regions.map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => removeRegion(r.id)}
                      className="flex-row items-center gap-1 rounded-full bg-[#256EF4]/10 px-3 py-1 active:opacity-80"
                    >
                      <Text className="text-xs text-[#256EF4]">
                        {r.city} {r.district}
                      </Text>
                      <Text className="text-xs text-[#256EF4]/70">✕</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Section>

            <View className="gap-4">
              <Text className="text-sm font-semibold text-neutral-800">예산 범위</Text>
              <RangeField
                label="보증금"
                min={0}
                max={6000}
                step={100}
                value={[room.budgetDeposit.min, room.budgetDeposit.max]}
                onChange={([min, max]) => setBudgetDeposit({ min, max })}
                minTick="0만"
                maxTick="6,000만"
                formatBubble={(lo, hi) => `${lo}~${hi}만원`}
              />
              <RangeField
                label="월세"
                min={0}
                max={500}
                step={10}
                value={[room.budgetRent.min, room.budgetRent.max]}
                onChange={([min, max]) => setBudgetRent({ min, max })}
                minTick="0만"
                maxTick="500만"
                formatBubble={(lo, hi) => `${lo}~${hi}만원`}
              />
              <RangeField
                label="관리비"
                min={0}
                max={150}
                step={5}
                value={[room.budgetManagement.min, room.budgetManagement.max]}
                onChange={([min, max]) => setBudgetManagement({ min, max })}
                minTick="0만"
                maxTick="150만"
                formatBubble={(lo, hi) => `${lo}~${hi}만원`}
              />
            </View>

            <Section label={`선호 방 형태 (복수 선택 · 최대 ${MAX_PREF_ROOM_TYPES}개)`}>
              <View className="flex-row flex-wrap gap-2">
                {ROOM_INFO_ROOM_TYPES.map((t) => {
                  const selected = room.roomTypes.includes(t.value);
                  const disabled = !selected && room.roomTypes.length >= MAX_PREF_ROOM_TYPES;
                  return (
                    <Chip
                      key={t.value}
                      label={t.label}
                      selected={selected}
                      disabled={disabled}
                      onPress={() => toggleRoomType(t.value)}
                    />
                  );
                })}
              </View>
            </Section>

            <Section label="입주 희망 시기">
              <CalendarField value={room.moveInBy} onChange={setMoveInBy} minDate={today} />
            </Section>
          </>
        ) : null}
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-2">
          <Text className="text-xs text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        showBack
        loading={submitting}
        onPress={onComplete}
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

function Chip({
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
      className={`rounded-full border px-4 py-2 ${
        selected
          ? 'border-[#256EF4] bg-[#256EF4]/15'
          : disabled
            ? 'border-neutral-200 bg-neutral-50'
            : 'border-neutral-300 bg-white active:opacity-80'
      }`}
    >
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
  icon,
  title,
  desc,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center gap-2 rounded-2xl border p-4 active:opacity-90 ${
        selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
      }`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          selected ? 'bg-[#256EF4]/30' : 'bg-neutral-100'
        }`}
      >
        <Text className="text-lg text-neutral-600">{icon}</Text>
      </View>
      <Text className="text-sm font-bold text-neutral-900">{title}</Text>
      <Text className="text-center text-[11px] leading-4 text-neutral-500">{desc}</Text>
    </Pressable>
  );
}

function RegionTable({
  draft,
  onSelectSido,
  onSelectGugun,
  onSelectDong,
}: {
  draft: RegionDraft;
  onSelectSido: (v: string) => void;
  onSelectGugun: (v: string) => void;
  onSelectDong: (v: string) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-xl border border-neutral-200">
      <Column title="시·도" items={SIDO} selected={draft.sido} onPick={onSelectSido} border />
      <Column title="구·군" items={GUGUN} selected={draft.gugun} onPick={onSelectGugun} border />
      <Column title="동" items={DONG} selected={draft.dong} onPick={onSelectDong} />
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
  items: string[];
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
          const on = it === selected;
          return (
            <Pressable
              key={it}
              onPress={() => onPick(it)}
              className={`py-3 ${on ? 'bg-[#256EF4]/10' : ''}`}
            >
              <Text
                className={`text-center text-sm ${on ? 'font-medium text-[#256EF4]' : 'text-neutral-700'}`}
              >
                {it}
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
  onChange: (n: number) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <TextInput
        value={value == null ? '' : String(value)}
        onChangeText={(t) => {
          const digits = t.replace(/[^0-9]/g, '');
          onChange(digits === '' ? 0 : Number(digits));
        }}
        placeholder={placeholder}
        keyboardType="number-pad"
        className="rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900"
      />
    </View>
  );
}
