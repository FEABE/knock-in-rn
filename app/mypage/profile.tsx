import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangeField } from '@/components/onboarding/range-field';
import { ScaleSlider } from '@/components/onboarding/scale-slider';
import { SegmentedControl, Tabs } from '@/components/ui/headless';
import { updateProfileLifestyle, updateProfileRoomInfo } from '@/lib/api';
import type { RangeValue } from '@/components/ui/headless';

const SCALES = [
  {
    key: 'sleep',
    label: '취침 시간',
    min: '일찍 자요',
    max: '늦게 자요',
    levels: ['일찍(저녁)', '조금 일찍', '보통(자정)', '조금 늦게', '늦게(새벽)'],
  },
  {
    key: 'cleanliness',
    label: '청결 민감도',
    min: '신경 안 써요',
    max: '매우 청결해요',
    levels: ['신경 안 써요', '조금', '보통', '깔끔해요', '매우 청결해요'],
  },
  {
    key: 'noise',
    label: '소음 민감도',
    min: '둔감해요',
    max: '매우 민감해요',
    levels: ['둔감해요', '조금 둔감', '보통', '조금 민감', '매우 민감해요'],
  },
  {
    key: 'personality',
    label: '성격 스타일',
    min: '내향적',
    max: '외향적',
    levels: ['내향적', '조금 내향', '중간', '조금 외향', '외향적'],
  },
  {
    key: 'privacy',
    label: '개인 공간 중요도',
    min: '상관 없어요',
    max: '매우 중요해요',
    levels: ['상관 없어요', '조금', '보통', '중요해요', '매우 중요해요'],
  },
  {
    key: 'visitor',
    label: '방문객 빈도',
    min: '거의 없어요',
    max: '자주 있어요',
    levels: ['거의 없어요', '드물게', '가끔', '종종', '자주 있어요'],
  },
] as const;

const ROOM_TYPES = ['원룸', '투룸', '쓰리룸 이상', '오피스텔', '쉐어하우스', '아파트', '빌라'];

export default function ProfileEditScreen() {
  const router = useRouter();
  const [scales, setScales] = useState<Record<string, number>>({});
  const [smoking, setSmoking] = useState<string | null>('no');
  const [pet, setPet] = useState<string | null>('no');

  const [hasRoom, setHasRoom] = useState<boolean | null>(false);
  const [deposit, setDeposit] = useState<RangeValue>([0, 500]);
  const [rent, setRent] = useState<RangeValue>([0, 50]);
  const [roomTypes, setRoomTypes] = useState<string[]>(['원룸']);
  const [moveText, setMoveText] = useState('2025.06.01');

  const saveLifestyle = async () => {
    const res = await updateProfileLifestyle({
      lifestyles: Object.entries(scales).map(([k, v]) => `${k}-${v}`),
    });
    Alert.alert(res.error ? '저장 실패' : '저장 완료');
  };

  const saveRoom = async () => {
    const res = await updateProfileRoomInfo({
      type: roomTypes[0] ?? '',
      minDeposit: String(deposit[0]),
      maxDeposit: String(deposit[1]),
      minMounthRent: String(rent[0]),
      maxMounthRent: String(rent[1]),
      comeEnableAt: moveText,
      region: [],
      roomProfile: roomTypes,
      deposit: '',
      mounthRent: '',
    });
    Alert.alert(res.error ? '저장 실패' : '저장 완료');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">내 프로필</Text>
      </View>

      <Tabs.Root defaultValue="lifestyle" className="flex-1">
        <Tabs.List className="flex-row border-b border-neutral-100">
          {[
            { value: 'lifestyle', label: '생활패턴' },
            { value: 'room', label: '방 조건' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="flex-1 py-3">
              {({ selected }) => (
                <View
                  className={`items-center border-b-2 pb-2 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-[#256EF4]'
                        : 'text-sm text-neutral-400'
                    }
                  >
                    {t.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="lifestyle" className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="gap-7 p-5 pb-28">
            {SCALES.map((s) => {
              const v = scales[s.key] ?? 3;
              return (
                <ScaleSlider
                  key={s.key}
                  label={s.label}
                  valueLabel={s.levels[v - 1]}
                  minLabel={s.min}
                  maxLabel={s.max}
                  value={scales[s.key] ?? null}
                  onChange={(next) => setScales((p) => ({ ...p, [s.key]: next }))}
                />
              );
            })}
            <Choices
              label="흡연"
              options={[
                { value: 'no', label: '비흡연' },
                { value: 'yes', label: '흡연' },
              ]}
              value={smoking}
              onChange={setSmoking}
            />
            <Choices
              label="반려동물"
              options={[
                { value: 'no', label: '없음' },
                { value: 'any', label: '있음' },
              ]}
              value={pet}
              onChange={setPet}
            />
          </ScrollView>
          <SaveBar onSave={saveLifestyle} />
        </Tabs.Content>

        <Tabs.Content value="room" className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="gap-6 p-5 pb-28">
            <Choices
              label="방 여부"
              options={[
                { value: 'yes', label: '방 있어요' },
                { value: 'no', label: '방 없어요' },
              ]}
              value={hasRoom ? 'yes' : 'no'}
              onChange={(v) => setHasRoom(v === 'yes')}
            />
            <RangeField
              label="예산 보증금"
              min={0}
              max={6000}
              step={100}
              value={deposit}
              onChange={setDeposit}
              minTick="0만"
              maxTick="6,000만"
              formatBubble={(lo, hi) => `${lo}~${hi}만원`}
            />
            <RangeField
              label="예산 월세"
              min={0}
              max={500}
              step={10}
              value={rent}
              onChange={setRent}
              minTick="0만"
              maxTick="500만"
              formatBubble={(lo, hi) => `${lo}~${hi}만원`}
            />
            <View className="gap-2">
              <Text className="text-sm font-semibold text-neutral-800">
                선호 방 형태 (복수 선택)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ROOM_TYPES.map((rt) => {
                  const on = roomTypes.includes(rt);
                  return (
                    <Pressable
                      key={rt}
                      onPress={() =>
                        setRoomTypes((p) => (on ? p.filter((x) => x !== rt) : [...p, rt]))
                      }
                      className={`rounded-full border px-4 py-2 ${
                        on ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
                      }`}
                    >
                      <Text
                        className={
                          on ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'
                        }
                      >
                        {rt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          <SaveBar onSave={saveRoom} />
        </Tabs.Content>
      </Tabs.Root>
    </SafeAreaView>
  );
}

function Choices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <SegmentedControl<string>
        options={options as { value: string; label: string }[]}
        value={value}
        onValueChange={onChange}
        className="flex-row gap-2"
        renderItem={({ option, selected }) => (
          <View
            className={`rounded-full border px-5 py-2 ${
              selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
            }`}
          >
            <Text
              className={selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'}
            >
              {option.label}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pb-6 pt-3">
      <Pressable
        onPress={onSave}
        className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">저장하기</Text>
      </Pressable>
    </View>
  );
}
