import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangeField } from '@/components/onboarding/range-field';
import { ScaleSlider } from '@/components/onboarding/scale-slider';
import { SegmentedControl, Tabs } from '@/components/ui/headless';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';

import {
  PROFILE_ROOM_TYPES,
  PROFILE_SCALES,
  type UseProfileEditScreenReturn,
} from './use-profile-edit-screen';

export type ProfileEditScreenViewProps = UseProfileEditScreenReturn;

export function ProfileEditScreenView({
  scales,
  smoking,
  pet,
  hasRoom,
  deposit,
  rent,
  roomTypes,
  setSmoking,
  setPet,
  setHasRoom,
  setDeposit,
  setRent,
  setRoomTypes,
  setScale,
  onBack,
  saveLifestyle,
  saveRoom,
}: ProfileEditScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">내 프로필</Text>
      </View>

      <Tabs.Root defaultValue="lifestyle" className="flex-1">
        <Tabs.List className="flex-row border-b border-neutral-100">
          {[
            { value: 'lifestyle', label: '생활패턴' },
            { value: 'room', label: '방 조건' },
          ].map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1 py-3">
              {({ selected }) => (
                <View
                  className={`items-center border-b-2 pb-2 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-semibold text-[#256EF4]' : 'text-sm text-neutral-400'
                    }
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="lifestyle" className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="gap-7 p-5 pb-28">
            {PROFILE_SCALES.map((scale) => {
              const value = scales[scale.key] ?? 3;
              return (
                <ScaleSlider
                  key={scale.key}
                  label={scale.label}
                  valueLabel={scale.levels[value - 1]}
                  minLabel={scale.min}
                  maxLabel={scale.max}
                  value={scales[scale.key] ?? null}
                  onChange={(next) => setScale(scale.key, next)}
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
              onChange={(value) => setHasRoom(value === 'yes')}
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
                {PROFILE_ROOM_TYPES.map((roomType) => {
                  const selected = roomTypes.includes(roomType);
                  return (
                    <Pressable
                      key={roomType}
                      onPress={() =>
                        setRoomTypes((prev) =>
                          selected ? prev.filter((item) => item !== roomType) : [...prev, roomType],
                        )
                      }
                      className={`rounded-full border px-4 py-2 ${
                        selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
                      }`}
                    >
                      <Text
                        className={
                          selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'
                        }
                      >
                        {roomType}
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
  onChange: (value: string) => void;
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
  const bottomPadding = useSafeBottomPadding(12, 24);

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onSave}
        className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">저장하기</Text>
      </Pressable>
    </View>
  );
}
