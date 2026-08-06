import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegionFilterSheet } from '@/components/room/filters';
import { RangeField } from '@/components/ui/range-field';
import {
  RoomLocationArtwork,
  RoomPresenceArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';

import { LifestyleQuestionFlow, QuestionFlowHeader } from '../lifestyle-question-flow';
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

/** 방 조건 관리 단계. 시안에 없는 "입주 희망일 선택" 화면은 두지 않는다. */
const ROOM_STAGES = ['presence', 'region', 'budget', 'roomType'] as const;

function RoomConditionFlow({
  hasRoom,
  regions,
  deposit,
  rent,
  roomTypes,
  roomTypeOptions,
  setHasRoom,
  setRegions,
  setDeposit,
  setRent,
  setRoomTypes,
  onBack,
  saveRoom,
}: ProfileEditScreenViewProps) {
  const [stage, setStage] = useState(0);
  const [regionOpen, setRegionOpen] = useState(false);
  const isOffer = hasRoom === true;
  const lastStage = ROOM_STAGES.length - 1;
  const maxRegions = isOffer ? 1 : 3;

  const goBack = () => {
    if (stage === 0) onBack();
    else setStage((current) => current - 1);
  };

  // 미입력 상태로는 다음 화면으로 넘어가지 않는다.
  // 마지막(방 형태) 화면의 "다음으로"는 상단 저장 버튼이 있으므로 항상 비활성이다.
  const canGoNext =
    stage === 0 ? hasRoom !== null : stage === 1 ? regions.length > 0 : stage === 2 ? true : false;

  const goNext = () => {
    if (!canGoNext || stage >= lastStage) return;
    setStage((current) => current + 1);
  };

  return (
    <View className="flex-1 bg-white">
      <QuestionFlowHeader
        title="방 조건 관리"
        onBack={goBack}
        onSave={() => void saveRoom()}
        saveEnabled={stage === lastStage}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pb-5 pt-7"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StageTitle stage={stage} hasRoom={isOffer} />

        {stage === 0 ? (
          <View className="mt-7 gap-3">
            <RoomPresenceChoice
              hasRoom
              title="방이 있어요"
              description="룸메이트를 찾고 싶어요"
              selected={hasRoom === true}
              onPress={() => setHasRoom(true)}
            />
            <RoomPresenceChoice
              hasRoom={false}
              title="방이 없어요"
              description="방과 룸메이트를 함께 찾고 싶어요"
              selected={hasRoom === false}
              onPress={() => setHasRoom(false)}
            />
          </View>
        ) : null}

        {stage === 1 ? (
          <View className="flex-1 pt-6">
            <Pressable
              onPress={() => setRegionOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="지역 선택하기"
              className="h-[46px] flex-row items-center justify-center gap-1.5 rounded-lg border border-[#DADAE8] bg-white px-3 active:bg-[#F6F6FA]"
            >
              <Text className="text-[15px] font-medium text-[#696976]">지역 선택하기</Text>
              <Ionicons name="chevron-down" size={16} color="#696976" />
            </Pressable>

            {regions.length > 0 ? (
              <View className="flex-1 justify-end pb-2 pt-6">
                <SelectedRegions
                  regions={regions}
                  max={maxRegions}
                  onRemove={(id) =>
                    setRegions((current) => current.filter((region) => region.id !== id))
                  }
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <RoomLocationArtwork size={150} />
              </View>
            )}
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
                  className={`h-[96px] w-[31%] items-center justify-center rounded-lg border px-2 ${
                    selected
                      ? 'border-[#256EF4] bg-[#EEF4FF]'
                      : disabled
                        ? 'border-[#ECECF3] bg-[#F7F7FA] opacity-40'
                        : 'border-[#DADAE8] bg-white'
                  }`}
                >
                  <RoomTypeArtwork label={roomType.label} image={roomType.image} size={44} />
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
        <Pressable
          onPress={goBack}
          className="h-12 flex-1 items-center justify-center rounded-lg border border-[#256EF4] bg-white active:opacity-80"
        >
          <Text className="text-[15px] font-semibold text-[#256EF4]">이전으로</Text>
        </Pressable>
        <Pressable
          onPress={goNext}
          disabled={!canGoNext}
          accessibilityState={{ disabled: !canGoNext }}
          className={`h-12 flex-1 items-center justify-center rounded-lg ${
            canGoNext ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
          }`}
        >
          <Text className={`text-[15px] font-bold ${canGoNext ? 'text-white' : 'text-[#AAAABA]'}`}>
            다음으로
          </Text>
        </Pressable>
      </View>

      <RegionFilterSheet
        open={regionOpen}
        onOpenChange={setRegionOpen}
        value={regions}
        maxSelection={maxRegions}
        onChange={(next) => setRegions(isOffer ? next.slice(-1) : next.slice(0, maxRegions))}
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
            '집의 주소를 선택해주세요',
            '언제든 마이페이지에서 변경할 수 있어요',
          ]
        : stage === 2
          ? [
              hasRoom ? '거주하고 있는 집의' : '희망하는 예산을',
              '보증금과 월세를 알려주세요',
              '범위 양끝을 움직여 금액을 설정해주세요',
            ]
          : [
              hasRoom ? '거주하고 있는' : '거주하고 싶은',
              '방 형태를 선택해주세요',
              hasRoom ? '한 개를 선택할 수 있어요' : '원하시는 방 형태를 최대 3개까지 선택해주세요',
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

/** 필터의 지역 시트와 같은 "선택 지역 n/max + 삭제 가능한 칩" 표시. */
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
      className={`rounded-xl border px-4 py-4 ${
        selected ? 'border-[#256EF4] bg-[#F5F9FF]' : 'border-transparent bg-[#F6F6FA]'
      }`}
    >
      <View className="flex-row items-center gap-2">
        <RoomPresenceArtwork hasRoom={hasRoom} size={22} />
        <Text className={`text-[15px] font-bold ${selected ? 'text-[#256EF4]' : 'text-[#17171B]'}`}>
          {title}
        </Text>
      </View>
      <Text className="mt-1.5 text-[13px] leading-5 text-[#8A8A98]">{description}</Text>
    </Pressable>
  );
}
