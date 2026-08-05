import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarField } from '@/components/onboarding/calendar-field';
import { RegionFilterSheet } from '@/components/room/filters';
import { RangeField } from '@/components/ui/range-field';
import {
  RoomLocationArtwork,
  RoomPresenceArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';

import { LifestyleQuestionFlow } from '../lifestyle-question-flow';
import type { UseProfileEditScreenReturn } from './use-profile-edit-screen';

export type ProfileEditScreenViewProps = UseProfileEditScreenReturn;

export function ProfileEditScreenView(props: ProfileEditScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {props.initialTab === 'lifestyle' ? (
        <LifestyleQuestionFlow
          title="생활 패턴 관리"
          questionVariant="lifestyle"
          scales={props.scales}
          choiceValues={props.choiceValues}
          scaleOptions={props.scaleOptions}
          choiceGroups={props.choiceGroups}
          onScaleChange={props.setScale}
          onChoiceChange={props.setChoice}
          onBack={props.onBack}
          onSave={() => void props.saveLifestyle()}
        />
      ) : (
        <RoomConditionFlow {...props} />
      )}
    </SafeAreaView>
  );
}

function RoomConditionFlow({
  hasRoom,
  regions,
  moveInDate,
  deposit,
  rent,
  roomTypes,
  roomTypeOptions,
  setHasRoom,
  setRegions,
  setMoveInDate,
  setDeposit,
  setRent,
  setRoomTypes,
  onBack,
  saveRoom,
}: ProfileEditScreenViewProps) {
  const [stage, setStage] = useState(0);
  const [regionOpen, setRegionOpen] = useState(false);
  const isOffer = hasRoom === true;
  const stageCount = 5;
  const selectedRegionLabel = regions.length
    ? regions.map((region) => `${region.city} ${region.district}`.trim()).join(', ')
    : '지역 선택하기';

  const goBack = () => {
    if (stage === 0) onBack();
    else setStage((current) => current - 1);
  };

  const goNext = () => {
    if (stage >= stageCount - 1) {
      void saveRoom();
      return;
    }
    setStage((current) => current + 1);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="h-14 flex-row items-center px-3">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-[17px] font-semibold text-[#242429]">
          방 조건 관리
        </Text>
        <Pressable onPress={() => void saveRoom()} className="ml-auto px-2 py-2 active:opacity-60">
          <Text className="text-[15px] font-semibold text-[#256EF4]">저장</Text>
        </Pressable>
      </View>

      <View className="h-1 bg-[#ECECF3]">
        <View
          className="h-1 bg-[#256EF4]"
          style={{ width: `${((stage + 1) / stageCount) * 100}%` }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pb-5 pt-7"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-[#256EF4]">
            {String(stage + 1).padStart(2, '0')}
          </Text>
          <Text className="text-xs text-[#AAAABA]">
            {stage + 1}/{stageCount}
          </Text>
        </View>

        <StageTitle stage={stage} hasRoom={isOffer} />

        {stage === 0 ? (
          <View className="mt-7 gap-4">
            <RoomPresenceChoice
              hasRoom
              title="방이 있어요"
              description="현재 방에서 함께 지낼 룸메이트를 찾아요"
              selected={hasRoom === true}
              onPress={() => setHasRoom(true)}
            />
            <RoomPresenceChoice
              hasRoom={false}
              title="방이 없어요"
              description="방과 룸메이트를 함께 찾아요"
              selected={hasRoom === false}
              onPress={() => setHasRoom(false)}
            />
          </View>
        ) : null}

        {stage === 1 ? (
          <View className="flex-1 justify-between pt-7">
            <Pressable
              onPress={() => setRegionOpen(true)}
              className="h-14 flex-row items-center justify-between rounded-lg border border-[#DADAE8] px-4 active:bg-[#F7F7FA]"
            >
              <Text
                numberOfLines={1}
                className={`flex-1 text-[15px] ${regions.length ? 'text-[#242429]' : 'text-[#AAAABA]'}`}
              >
                {selectedRegionLabel}
              </Text>
              <Ionicons name="chevron-down" size={19} color="#8A8A98" />
            </Pressable>
            <View className="flex-1 items-center justify-center py-8">
              <RoomLocationArtwork size={190} />
            </View>
          </View>
        ) : null}

        {stage === 2 ? (
          <View className="mt-8 gap-10">
            <RangeField
              label={isOffer ? '보증금' : '예산 보증금'}
              min={0}
              max={6000}
              step={100}
              value={deposit}
              onChange={setDeposit}
              tickLabels={['최소', '400만', '1,200만', '최대']}
              scaleStops={[0, 400, 1200, 6000]}
            />
            <RangeField
              label={isOffer ? '월세' : '예산 월세'}
              min={0}
              max={500}
              step={10}
              value={rent}
              onChange={setRent}
              tickLabels={['최소', '125만', '250만', '최대']}
              scaleStops={[0, 125, 250, 500]}
            />
          </View>
        ) : null}

        {stage === 3 ? (
          <View className="mt-8">
            <CalendarField
              value={moveInDate}
              onChange={setMoveInDate}
              minDate={new Date()}
              placeholder={isOffer ? '입주 가능일 선택' : '입주 희망일 선택'}
            />
          </View>
        ) : null}

        {stage === 4 ? (
          <View className="mt-7 flex-row flex-wrap gap-3">
            {roomTypeOptions.map((roomType) => {
              const selected = roomTypes.includes(roomType.value);
              const disabled = !isOffer && !selected && roomTypes.length >= 3;
              return (
                <Pressable
                  key={roomType.value}
                  disabled={disabled}
                  onPress={() =>
                    setRoomTypes((current) =>
                      isOffer
                        ? selected
                          ? []
                          : [roomType.value]
                        : selected
                          ? current.filter((item) => item !== roomType.value)
                          : current.length < 3
                            ? [...current, roomType.value]
                            : current,
                    )
                  }
                  className={`h-[108px] w-[31%] items-center justify-center rounded-lg border px-2 ${
                    selected
                      ? 'border-[#256EF4] bg-[#EEF4FF]'
                      : disabled
                        ? 'border-[#ECECF3] bg-[#F7F7FA] opacity-40'
                        : 'border-[#DADAE8] bg-white'
                  }`}
                >
                  <RoomTypeArtwork label={roomType.label} size={62} />
                  <Text
                    className={`mt-1 text-[13px] ${
                      selected ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'
                    }`}
                  >
                    {roomType.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-[#ECECF3] bg-white px-4 pb-3 pt-3">
        {stage > 0 ? (
          <Pressable
            onPress={goBack}
            className="h-12 flex-1 items-center justify-center rounded-lg border border-[#DADAE8] bg-white"
          >
            <Text className="text-[15px] font-semibold text-[#696976]">이전으로</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={goNext}
          className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
        >
          <Text className="text-[15px] font-bold text-white">
            {stage === stageCount - 1 ? '저장하기' : '다음으로'}
          </Text>
        </Pressable>
      </View>

      <RegionFilterSheet
        open={regionOpen}
        onOpenChange={setRegionOpen}
        value={regions}
        maxSelection={isOffer ? 1 : 3}
        onChange={(next) => setRegions(isOffer ? next.slice(-1) : next.slice(0, 3))}
      />
    </View>
  );
}

function StageTitle({ stage, hasRoom }: { stage: number; hasRoom: boolean }) {
  const copy =
    stage === 0
      ? ['현재 머물고 있는', '방이 있으신가요?', '언제든 마이페이지에서 변경할 수 있어요']
      : stage === 1
        ? [
            hasRoom ? '거주하고 있는' : '거주하고 싶은',
            '지역을 선택해주세요',
            hasRoom ? '한 곳을 선택할 수 있어요' : '최대 3곳까지 선택할 수 있어요',
          ]
        : stage === 2
          ? [
              hasRoom ? '거주하고 있는 집의' : '희망하는 예산을',
              '보증금과 월세를 알려주세요',
              '범위 양끝을 움직여 금액을 설정해주세요',
            ]
          : stage === 3
            ? [
                hasRoom ? '룸메이트가 입주할 수 있는' : '입주를 희망하는',
                '날짜를 선택해주세요',
                '달력에서 날짜를 선택해주세요',
              ]
            : [
                hasRoom ? '거주하고 있는' : '거주하고 싶은',
                '방 형태를 선택해주세요',
                hasRoom ? '한 개를 선택할 수 있어요' : '최대 3개까지 선택할 수 있어요',
              ];

  return (
    <View>
      <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
        {copy[0]}
        {'\n'}
        {copy[1]}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-[#696976]">{copy[2]}</Text>
    </View>
  );
}

function RoomPresenceChoice({
  hasRoom,
  title,
  description,
  selected,
  onPress,
}: {
  hasRoom: boolean;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`h-[112px] flex-row items-center rounded-xl border px-5 ${
        selected ? 'border-[#256EF4] bg-[#EEF4FF]' : 'border-[#DADAE8] bg-white'
      }`}
    >
      <RoomPresenceArtwork hasRoom={hasRoom} size={64} />
      <View className="ml-4 flex-1 gap-1">
        <Text
          className={`text-[16px] font-semibold ${selected ? 'text-[#256EF4]' : 'text-[#242429]'}`}
        >
          {title}
        </Text>
        <Text className="text-[13px] leading-5 text-[#8A8A98]">{description}</Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border ${
          selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-[#C8C8D2] bg-white'
        }`}
      >
        {selected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}
