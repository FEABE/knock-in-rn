import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarField } from '@/components/onboarding/calendar-field';
import { RangeField } from '@/components/onboarding/range-field';
import { RegionFilterBody } from '@/components/room/filters';
import { ScaleSlider } from '@/components/onboarding/scale-slider';
import { SegmentedControl, Tabs } from '@/components/ui/headless';

import { type UseProfileEditScreenReturn } from './use-profile-edit-screen';

export type ProfileEditScreenViewProps = UseProfileEditScreenReturn;

export function ProfileEditScreenView({
  scales,
  choiceValues,
  scaleOptions,
  choiceGroups,
  hasRoom,
  regions,
  moveInDate,
  deposit,
  rent,
  roomTypes,
  roomTypeOptions,
  bottomPadding,
  setChoice,
  setHasRoom,
  setRegions,
  setMoveInDate,
  setDeposit,
  setRent,
  setRoomTypes,
  setScale,
  onBack,
  saveLifestyle,
  saveRoom,
}: ProfileEditScreenViewProps) {
  const isOffer = hasRoom === true;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
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
            {scaleOptions.map((scale) => {
              const value = scales[scale.key] ?? 3;
              return (
                <ScaleSlider
                  key={scale.key}
                  label={scale.label}
                  valueLabel={scale.levels[value - 1] ?? scale.levels[0] ?? ''}
                  minLabel={scale.minLabel}
                  maxLabel={scale.maxLabel}
                  value={scales[scale.key] ?? null}
                  onChange={(next) => setScale(scale.key, next)}
                />
              );
            })}
            {choiceGroups.map((group) => (
              <Choices
                key={group.key}
                label={group.label}
                options={group.options}
                value={choiceValues[group.key] ?? null}
                onChange={(value) => setChoice(group.key, value)}
              />
            ))}
          </ScrollView>
          <SaveBar onSave={saveLifestyle} bottomPadding={bottomPadding} />
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
            <View className="gap-2">
              <Text className="text-sm font-semibold text-neutral-800">
                {isOffer ? '방 위치' : '선호 지역'}
              </Text>
              <RegionFilterBody
                value={regions}
                onChange={(next) => setRegions(isOffer ? next.slice(-1) : next.slice(0, 3))}
              />
            </View>
            <RangeField
              label={isOffer ? '보증금' : '예산 보증금'}
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
              label={isOffer ? '월세' : '예산 월세'}
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
                {isOffer ? '입주 가능 시기' : '입주 희망 시기'}
              </Text>
              <CalendarField
                value={moveInDate}
                onChange={setMoveInDate}
                minDate={new Date()}
                placeholder={isOffer ? '입주 가능일 선택' : '입주 희망일 선택'}
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-semibold text-neutral-800">
                {isOffer ? '방 형태' : '선호 방 형태 (복수 선택)'}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {roomTypeOptions.map((roomType) => {
                  const selected = roomTypes.includes(roomType.value);
                  return (
                    <Pressable
                      key={roomType.value}
                      onPress={() =>
                        setRoomTypes((prev) =>
                          isOffer
                            ? selected
                              ? []
                              : [roomType.value]
                            : selected
                              ? prev.filter((item) => item !== roomType.value)
                              : [...prev, roomType.value],
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
                        {roomType.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          <SaveBar onSave={saveRoom} bottomPadding={bottomPadding} />
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

function SaveBar({ onSave, bottomPadding }: { onSave: () => void; bottomPadding: number }) {
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
