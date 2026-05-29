import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { TextField } from '@/components/ui/headless';
import { useOnboardingRoom, type RoomType } from '@/lib/onboarding';

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

const SIDO = ['서울', '경기', '인천', '충청'];
const GUGUN = ['마포구', '서대문구', '강남구', '송파구'];
const DONG = ['합정동', '망원동', '연남동', '상수동'];

function parseDate(text: string): Date | null {
  const m = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function RoomInfoStep() {
  const { room, patch } = useOnboardingRoom();
  const [moveText, setMoveText] = useState('');
  const [sido, setSido] = useState('서울');
  const [gugun, setGugun] = useState('마포구');
  const [dong, setDong] = useState('합정동');

  const hasRoom = room.hasRoom === true;
  const noRoom = room.hasRoom === false;
  const canProceed = room.hasRoom !== null;

  const setRegion = (s: string, g: string, d: string) => {
    setSido(s);
    setGugun(g);
    setDong(d);
    patch({ region: { id: `${s}-${g}-${d}`, city: s, district: `${g} ${d}` } });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-6 pb-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">현재 방이 있으신가요?</Text>
          <Text className="mt-1 text-sm text-neutral-500">나중에 마이페이지에서 수정 가능해요</Text>
        </View>

        {/* 방 있어요 / 없어요 */}
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

        {/* 위치 */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            {noRoom ? '선호 방 위치 (복수 선택 가능)' : '방 위치'}
          </Text>
          <RegionTable sido={sido} gugun={gugun} dong={dong} onSelect={setRegion} />
          {noRoom && room.region ? (
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-violet-50 px-3 py-1">
                <Text className="text-xs text-violet-700">
                  {room.region.city} {room.region.district}
                </Text>
                <Text className="text-xs text-violet-400">✕</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 예산 — 방있음: 단일 입력 / 방없음: 범위 */}
        {noRoom ? (
          <View className="gap-4">
            <Text className="text-sm font-semibold text-neutral-800">예산 범위</Text>
            <RangeField
              label="보증금 (만원)"
              min={0}
              max={2000}
              step={50}
              value={[room.deposit.min, room.deposit.max]}
              onChange={([min, max]) => patch({ deposit: { min, max } })}
              minTick="0만"
              maxTick="2,000만"
              formatBubble={(lo, hi) => `${lo}~${hi}만원`}
            />
            <RangeField
              label="월세 (만원)"
              min={0}
              max={500}
              step={10}
              value={[room.monthlyRent.min, room.monthlyRent.max]}
              onChange={([min, max]) => patch({ monthlyRent: { min, max } })}
              minTick="0만"
              maxTick="500만"
              formatBubble={(lo, hi) => `${lo}~${hi}만원`}
            />
          </View>
        ) : (
          <View className="gap-4">
            <NumberField
              label="보증금 (만원)"
              placeholder="예) 1000"
              value={room.deposit.max ? String(room.deposit.max) : ''}
              onChange={(n) => patch({ deposit: { min: 0, max: n } })}
            />
            <NumberField
              label="월세 (만원)"
              placeholder="예) 50"
              value={room.monthlyRent.max ? String(room.monthlyRent.max) : ''}
              onChange={(n) => patch({ monthlyRent: { min: 0, max: n } })}
            />
          </View>
        )}

        {/* 룸 형태 */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            {noRoom ? '선호 방 형태 (복수 선택)' : '방 형태'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROOM_TYPES.map((t) => {
              const selected = room.roomType === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => patch({ roomType: selected ? null : t.value })}
                  className={`rounded-full border px-4 py-2 active:opacity-80 ${
                    selected ? 'border-violet-600 bg-violet-100' : 'border-neutral-300 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-violet-700' : 'text-sm text-neutral-600'
                    }
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 입주 시기 */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            입주 {noRoom ? '희망' : '가능'} 시기
          </Text>
          <View className="flex-row items-center rounded-xl bg-neutral-100 px-4">
            <TextField
              value={moveText}
              onChangeValue={(text) => {
                setMoveText(text);
                patch({ moveInDate: parseDate(text) });
              }}
              placeholder="날짜를 선택해주세요"
              keyboardType="numbers-and-punctuation"
              className="flex-1 py-3.5 text-base text-neutral-900"
            />
            <Text className="text-base text-neutral-400">📅</Text>
          </View>
        </View>
      </ScrollView>

      <OnboardingFooter canProceed={canProceed} primaryLabel="완료" showBack />
    </View>
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
        selected ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          selected ? 'bg-violet-200' : 'bg-neutral-100'
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
  sido,
  gugun,
  dong,
  onSelect,
}: {
  sido: string;
  gugun: string;
  dong: string;
  onSelect: (s: string, g: string, d: string) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-xl border border-neutral-200">
      <Column
        title="시·도"
        items={SIDO}
        selected={sido}
        onPick={(v) => onSelect(v, gugun, dong)}
        border
      />
      <Column
        title="구·군"
        items={GUGUN}
        selected={gugun}
        onPick={(v) => onSelect(sido, v, dong)}
        border
      />
      <Column title="동" items={DONG} selected={dong} onPick={(v) => onSelect(sido, gugun, v)} />
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
  selected: string;
  onPick: (v: string) => void;
  border?: boolean;
}) {
  return (
    <View className={`flex-1 ${border ? 'border-r border-neutral-200' : ''}`}>
      <View className="border-b border-neutral-200 bg-neutral-50 py-2">
        <Text className="text-center text-xs text-neutral-500">{title}</Text>
      </View>
      {items.map((it) => {
        const on = it === selected;
        return (
          <Pressable
            key={it}
            onPress={() => onPick(it)}
            className={`py-2.5 ${on ? 'bg-violet-50' : ''}`}
          >
            <Text
              className={`text-center text-sm ${
                on ? 'font-medium text-violet-700' : 'text-neutral-700'
              }`}
            >
              {it}
            </Text>
          </Pressable>
        );
      })}
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
  value: string;
  onChange: (n: number) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
        placeholder={placeholder}
        keyboardType="number-pad"
        className="rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900"
      />
    </View>
  );
}
