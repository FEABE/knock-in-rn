import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useOnboardingRoom, type Region, type RoomType } from '@/lib/onboarding';

import { CalendarField } from '../calendar-field';
import { OnboardingFooter } from '../onboarding-footer';
import { RangeField } from '../range-field';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'one-room', label: '원룸' },
  { value: 'two-room', label: '투룸' },
  { value: 'three-room+', label: '쓰리룸 이상' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'share-house', label: '쉐어하우스' },
  { value: 'apt', label: '아파트' },
  { value: 'villa', label: '빌라' },
];

const MAX_PREF_ROOM_TYPES = 3;
const MAX_REGIONS = 3;

const SIDO = ['서울', '경기', '인천', '충청'];
const GUGUN = ['전체', '마포구', '서대문구', '강남구', '송파구', '노원구', '광진구'];
const DONG = ['전체', '합정동', '망원동', '연남동', '상수동'];

type RegionDraft = { sido: string | null; gugun: string | null; dong: string | null };
const EMPTY_DRAFT: RegionDraft = { sido: null, gugun: null, dong: null };

/** 자정 기준 오늘. 입주 시기는 오늘 이후만 유효. */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** draft → Region. "전체" 선택 위치에 따라 시·도 / 구 / 동 단위로 만든다. 미완료면 null. */
function regionFromDraft(d: RegionDraft): Region | null {
  if (!d.sido) return null;
  if (d.gugun === '전체') {
    return { id: d.sido, city: d.sido, district: '전체' };
  }
  if (!d.gugun) return null;
  if (d.dong == null) return null;
  if (d.dong === '전체') {
    return { id: `${d.sido}-${d.gugun}`, city: d.sido, district: d.gugun };
  }
  return { id: `${d.sido}-${d.gugun}-${d.dong}`, city: d.sido, district: `${d.gugun} ${d.dong}` };
}

export type RoomInfoStepProps = {
  /** "완료" 시 호출. 미지정 시 footer 기본 동작(goNext). */
  onComplete?: () => void;
};

export function RoomInfoStep({ onComplete }: RoomInfoStepProps) {
  const { room, patch } = useOnboardingRoom();

  const hasRoom = room.hasRoom === true;
  const noRoom = room.hasRoom === false;

  // 방 위치 3컬럼 선택 draft. 방있음은 room.region 에서 복원.
  const [draft, setDraft] = useState<RegionDraft>(() => {
    if (room.hasRoom === true && room.region) {
      const [s, g, d] = room.region.id.split('-');
      return { sido: s ?? null, gugun: g ?? null, dong: d || null };
    }
    return EMPTY_DRAFT;
  });

  const today = startOfToday();
  const moveInValid = room.moveInDate != null && room.moveInDate >= today;
  const moveByValid = room.moveInBy != null && room.moveInBy >= today;

  const canProceed = hasRoom
    ? room.region != null &&
      room.deposit != null &&
      room.monthlyRent != null &&
      room.roomType != null &&
      moveInValid
    : noRoom
      ? room.regions.length > 0 && room.roomTypes.length > 0 && moveByValid
      : false;

  // 간단 토스트 (2초 후 자동 사라짐).
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // 3가지 모두 선택되면 자동 확정. 방있음=단일 지정(유지), 방없음=목록 추가 후 초기화.
  const commitDraft = (next: RegionDraft) => {
    const region = regionFromDraft(next);
    if (!region) {
      setDraft(next);
      return;
    }
    if (hasRoom) {
      patch({ region });
      setDraft(next);
    } else {
      const dup = room.regions.some((r) => r.id === region.id);
      if (dup) {
        // 이미 추가된 지역 — 무시
      } else if (room.regions.length >= MAX_REGIONS) {
        showToast(`최대 ${MAX_REGIONS}개까지만 선택 가능합니다.`);
      } else {
        patch({ regions: [...room.regions, region] });
      }
      setDraft(EMPTY_DRAFT);
    }
  };

  const removeRegion = (id: string) => patch({ regions: room.regions.filter((r) => r.id !== id) });

  const toggleRoomType = (value: RoomType) => {
    if (room.roomTypes.includes(value)) {
      patch({ roomTypes: room.roomTypes.filter((v) => v !== value) });
    } else if (room.roomTypes.length < MAX_PREF_ROOM_TYPES) {
      patch({ roomTypes: [...room.roomTypes, value] });
    }
  };

  const regionTable = (
    <RegionTable
      draft={draft}
      onSelectSido={(v) => commitDraft({ ...draft, sido: v })}
      onSelectGugun={(v) => commitDraft({ ...draft, gugun: v })}
      onSelectDong={(v) => commitDraft({ ...draft, dong: v })}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-6 pb-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">현재 방이 있으신가요?</Text>
          <Text className="mt-1 text-sm text-neutral-500">나중에 마이페이지에서 수정 가능해요</Text>
        </View>

        {/* 방 상태 (필수) */}
        <View className="flex-row gap-3">
          <RoomChoice
            icon="⌂"
            title="방 있어요"
            desc="룸메이트를 구하고 있어요"
            selected={hasRoom}
            onPress={() => patch({ hasRoom: true })}
          />
          <RoomChoice
            icon="⌕"
            title="방 없어요"
            desc="방이랑 룸메이트 함께 찾아요"
            selected={noRoom}
            onPress={() => patch({ hasRoom: false })}
          />
        </View>

        {/* ── 방 있어요 ── */}
        {hasRoom ? (
          <>
            <Section label="방 위치">{regionTable}</Section>

            <NumberField
              label="보증금"
              placeholder="예) 1000 (0 입력 가능)"
              value={room.deposit}
              onChange={(n) => patch({ deposit: n })}
            />
            <NumberField
              label="월세"
              placeholder="예) 50"
              value={room.monthlyRent}
              onChange={(n) => patch({ monthlyRent: n })}
            />

            <Section label="방 형태">
              <View className="flex-row flex-wrap gap-2">
                {ROOM_TYPES.map((t) => (
                  <Chip
                    key={t.value}
                    label={t.label}
                    selected={room.roomType === t.value}
                    onPress={() => patch({ roomType: room.roomType === t.value ? null : t.value })}
                  />
                ))}
              </View>
            </Section>

            <Section label="입주 가능 시기">
              <CalendarField
                value={room.moveInDate}
                onChange={(d) => patch({ moveInDate: d })}
                minDate={today}
              />
            </Section>
          </>
        ) : null}

        {/* ── 방 없어요 ── */}
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
                onChange={([min, max]) => patch({ budgetDeposit: { min, max } })}
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
                onChange={([min, max]) => patch({ budgetRent: { min, max } })}
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
                onChange={([min, max]) => patch({ budgetManagement: { min, max } })}
                minTick="0만"
                maxTick="150만"
                formatBubble={(lo, hi) => `${lo}~${hi}만원`}
              />
            </View>

            <Section label={`선호 방 형태 (복수 선택 · 최대 ${MAX_PREF_ROOM_TYPES}개)`}>
              <View className="flex-row flex-wrap gap-2">
                {ROOM_TYPES.map((t) => {
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
              <CalendarField
                value={room.moveInBy}
                onChange={(d) => patch({ moveInBy: d })}
                minDate={today}
              />
            </Section>
          </>
        ) : null}
      </ScrollView>

      <OnboardingFooter canProceed={canProceed} primaryLabel="완료" showBack onPress={onComplete} />

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

/** 3줄 높이까지 보이고 넘치면 세로 스크롤되는 선택 컬럼. */
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
