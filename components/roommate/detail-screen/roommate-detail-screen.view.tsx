import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/ui/headless';
import {
  ReadyActionRow,
  ReadyActionSheet,
  ReadyBadge,
  ReadyDivider,
  ReadyMetadataTile,
  ReadyMoreButton,
  ReadyProfileAvatar,
  ReadyScreenHeader,
  ReadySection,
} from '@/components/ui/ready-to-dev-components';
import { PriorityArtwork } from '@/components/ui/ready-to-dev-assets';
import type { RoommateMatchDetailModel } from '@/lib/api';

import {
  ROOMMATE_REPORT_REASONS,
  type UseRoommateDetailScreenReturn,
} from './use-roommate-detail-screen';

const OTHER_REPORT_REASON = '기타';

export type RoommateDetailScreenViewProps = UseRoommateDetailScreenReturn;

type DetailTab = 'compatibility' | 'condition' | 'room';

export function RoommateDetailScreenView({
  data,
  loading,
  error,
  liked,
  reportOpen,
  lifestyleExpanded,
  creatingChat,
  bottomPadding,
  setReportOpen,
  onBack,
  onScroll,
  onCompatibilityLayout,
  toggleLifestyle,
  onLike,
  onChat,
  onBlock,
  onReportReason,
}: RoommateDetailScreenViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<DetailTab, number>>({
    compatibility: 0,
    condition: 0,
    room: 0,
  });
  const [activeTab, setActiveTab] = useState<DetailTab>('compatibility');

  const moveToSection = (tab: DetailTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionOffsets.current[tab] - 12),
      animated: true,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ReadyScreenHeader
        title="룸메 찾아요"
        onBack={onBack}
        actions={[
          {
            icon: 'ellipsis-horizontal',
            label: '신고 및 차단',
            onPress: () => setReportOpen(true),
          },
        ]}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">불러오는 중...</Text>
        </View>
      ) : error || !data ? (
        <View className="flex-1 items-center justify-center gap-2 p-10">
          <Text className="text-sm text-[#696976]">정보를 불러오지 못했어요</Text>
          {error ? <Text className="text-xs text-[#AAAABA]">{error}</Text> : null}
        </View>
      ) : (
        <>
          <ProfileHead data={data} />
          <DetailTabs active={activeTab} onPress={moveToSection} />

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="pb-28"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <View
              onLayout={(event) => {
                const y = event.nativeEvent.layout.y;
                sectionOffsets.current.compatibility = y;
                onCompatibilityLayout(y);
              }}
            >
              <CompatibilityBlock data={data} />
            </View>

            <ReadyDivider />

            <View
              onLayout={(event) => {
                sectionOffsets.current.condition = event.nativeEvent.layout.y;
              }}
            >
              <PreferredRoommateBlock data={data} />
            </View>

            <ReadyDivider />

            <View
              onLayout={(event) => {
                sectionOffsets.current.room = event.nativeEvent.layout.y;
              }}
            >
              <RoomIntroductionBlock data={data} />
            </View>

            <ReadyDivider />
            <LifestyleBlock data={data} expanded={lifestyleExpanded} onToggle={toggleLifestyle} />
          </ScrollView>

          <BottomBar
            liked={liked}
            onLike={onLike}
            onChat={onChat}
            creatingChat={creatingChat}
            bottomPadding={bottomPadding}
          />

          <ReportSheet
            open={reportOpen}
            onOpenChange={setReportOpen}
            onBlock={onBlock}
            onReportReason={onReportReason}
          />
        </>
      )}
    </SafeAreaView>
  );
}

function ProfileHead({ data }: { data: RoommateMatchDetailModel }) {
  const roomBadge = data.roomStatusLabel.split('·')[0]?.trim();
  return (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <ReadyProfileAvatar name={data.name || data.initial} imageUrl={data.profileImageUrl} />

      <View className="flex-1 gap-2">
        <View className="flex-row items-center gap-1">
          <Text className="text-base font-semibold text-[#17171B]">{data.name}</Text>
          {data.isAuthStudent || data.isAuthEmployee ? (
            <Ionicons name="checkmark-circle" size={14} color="#34B27B" />
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {data.age ? <ReadyBadge label={`${data.age}세`} tone="red" /> : null}
          {data.genderLabel ? <ReadyBadge label={data.genderLabel} tone="red" /> : null}
          {roomBadge ? <ReadyBadge label={roomBadge} tone="blue" icon="home" /> : null}
        </View>
      </View>
    </View>
  );
}

function DetailTabs({ active, onPress }: { active: DetailTab; onPress: (tab: DetailTab) => void }) {
  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'compatibility', label: '궁합 점수' },
    { key: 'condition', label: '룸메이트 조건' },
    { key: 'room', label: '방 소개' },
  ];
  return (
    <View className="flex-row border-b border-[#ECECF3] bg-white">
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={`h-11 flex-1 items-center justify-center border-b-2 ${
              selected ? 'border-[#256EF4]' : 'border-transparent'
            }`}
          >
            <Text
              className={
                selected
                  ? 'text-sm font-semibold text-[#17171B]'
                  : 'text-sm font-medium text-[#AAAABA]'
              }
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CompatibilityBlock({ data }: { data: RoommateMatchDetailModel }) {
  const score = data.compatibility.score;
  return (
    <ReadySection
      title="궁합 점수"
      accessory={
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-[#AAAABA]">프로필 완성 후 실제 점수 반영</Text>
          <Ionicons name="information-circle" size={14} color="#C8C8D4" />
        </View>
      }
    >
      <View className="items-center py-6">
        <View
          className={`h-28 w-28 items-center justify-center rounded-full border-[5px] ${
            score === undefined ? 'border-[#E9E9F0]' : 'border-[#256EF4]'
          }`}
        >
          <View className="flex-row items-end">
            <Text
              className={`text-[30px] font-bold ${
                score === undefined ? 'text-[#AAAABA]' : 'text-[#175CD3]'
              }`}
            >
              {score === undefined ? '--' : score}
            </Text>
            <Text className="mb-1 text-xs font-semibold text-[#175CD3]">점</Text>
          </View>
        </View>
      </View>
    </ReadySection>
  );
}

function PreferredRoommateBlock({ data }: { data: RoommateMatchDetailModel }) {
  const priorities = data.conditionText
    .split('·')
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <ReadySection title="선호 룸메이트 조건">
      {data.preferenceRows.length ? (
        <View className="flex-row flex-wrap gap-2">
          {data.preferenceRows.map((preference) => (
            <ConditionChip
              key={preference.key}
              label={preference.value === '-' ? preference.label : preference.value}
            />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-[#AAAABA]">등록된 선호 조건이 없어요</Text>
      )}

      {priorities.length ? (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-[#256EF4]">우선순위</Text>
          <View className="flex-row flex-wrap gap-2">
            {priorities.map((priority) => (
              <View
                key={priority}
                className="flex-row items-center gap-1.5 rounded bg-[#EEF4FF] px-3 py-2"
              >
                <PriorityArtwork label={priority} size={20} />
                <Text className="text-sm font-medium text-[#17171B]">{priority}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ReadySection>
  );
}

function RoomIntroductionBlock({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <ReadySection title="방 소개">
      <View className="gap-3">
        {data.livingRows.map((row) => (
          <KeyVal key={row.label} label={figmaLivingLabel(row.label)} value={row.value} />
        ))}
      </View>
    </ReadySection>
  );
}

function LifestyleBlock({
  data,
  expanded,
  onToggle,
}: {
  data: RoommateMatchDetailModel;
  expanded: boolean;
  onToggle: () => void;
}) {
  const items = expanded ? data.lifeStyles : data.lifeStyles.slice(0, 4);
  return (
    <ReadySection title="생활 패턴">
      {items.length ? (
        <View className="flex-row flex-wrap gap-3">
          {items.map((lifestyle) => (
            <ReadyMetadataTile key={lifestyle.id} label={lifestyle.name} value={lifestyle.value} />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-[#AAAABA]">등록된 생활 패턴이 없어요</Text>
      )}
      {data.lifeStyles.length > 4 ? (
        <ReadyMoreButton expanded={expanded} onPress={onToggle} />
      ) : null}
    </ReadySection>
  );
}

function BottomBar({
  liked,
  onLike,
  onChat,
  creatingChat,
  bottomPadding,
}: {
  liked: boolean;
  onLike: () => void;
  onChat: () => void;
  creatingChat: boolean;
  bottomPadding: number;
}) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-2 border-t border-[#ECECF3] bg-white px-4 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        className="h-12 w-12 items-center justify-center rounded-lg border border-[#DADAE8]"
      >
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={23}
          color={liked ? '#256EF4' : '#AAAABA'}
        />
      </Pressable>
      <Pressable
        onPress={onChat}
        disabled={creatingChat}
        accessibilityRole="button"
        accessibilityLabel="채팅하기"
        accessibilityState={{ disabled: creatingChat }}
        className={`h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90 ${
          creatingChat ? 'opacity-60' : ''
        }`}
      >
        {creatingChat ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-semibold text-white">채팅하기</Text>
        )}
      </Pressable>
    </View>
  );
}

function ReportSheet({
  open,
  onOpenChange,
  onBlock,
  onReportReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlock: () => void;
  onReportReason: (reason: string) => void;
}) {
  const [showReasons, setShowReasons] = useState(false);
  const [enteringCustom, setEnteringCustom] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setShowReasons(false);
      setEnteringCustom(false);
      setCustomReason('');
    }
    onOpenChange(next);
  };
  const submitCustom = () => {
    const trimmed = customReason.trim();
    if (!trimmed) return;
    onReportReason(trimmed);
    handleOpenChange(false);
  };

  return (
    <ReadyActionSheet open={open} onOpenChange={handleOpenChange}>
      {enteringCustom ? (
        <View>
          <Pressable
            onPress={() => setEnteringCustom(false)}
            className="mb-2 h-10 flex-row items-center gap-1"
          >
            <Ionicons name="chevron-back" size={20} color="#696976" />
            <Text className="text-base font-semibold text-[#17171B]">신고 사유 입력</Text>
          </Pressable>
          <Text className="mb-3 text-sm text-[#696976]">어떤 문제가 있었는지 알려주세요</Text>
          <TextField
            value={customReason}
            onChangeValue={setCustomReason}
            placeholder="신고 사유를 입력해주세요"
            multiline
            maxLength={300}
            className="h-28 rounded-lg border border-[#DADAE8] px-3 py-2 text-[15px] text-[#17171B]"
          />
          <Pressable
            onPress={submitCustom}
            disabled={!customReason.trim()}
            className={`mt-3 h-12 items-center justify-center rounded-lg ${
              customReason.trim() ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
            }`}
          >
            <Text
              className={`text-base font-bold ${customReason.trim() ? 'text-white' : 'text-[#AAAABA]'}`}
            >
              제출
            </Text>
          </Pressable>
        </View>
      ) : showReasons ? (
        <View>
          <Pressable
            onPress={() => setShowReasons(false)}
            className="mb-2 h-10 flex-row items-center gap-1"
          >
            <Ionicons name="chevron-back" size={20} color="#696976" />
            <Text className="text-base font-semibold text-[#17171B]">신고 사유</Text>
          </Pressable>
          {ROOMMATE_REPORT_REASONS.map((reason, index) => (
            <ReadyActionRow
              key={reason}
              icon="alert-circle-outline"
              label={reason}
              divider={index < ROOMMATE_REPORT_REASONS.length - 1}
              onPress={() =>
                reason === OTHER_REPORT_REASON ? setEnteringCustom(true) : onReportReason(reason)
              }
            />
          ))}
        </View>
      ) : (
        <View>
          <ReadyActionRow
            icon="ban-outline"
            label="사용자 차단하기"
            tone="danger"
            divider
            onPress={onBlock}
          />
          <ReadyActionRow
            icon="notifications-outline"
            label="사용자 신고하기"
            onPress={() => setShowReasons(true)}
          />
        </View>
      )}
    </ReadyActionSheet>
  );
}

function ConditionChip({ label }: { label: string }) {
  return (
    <View className="rounded border border-[#DADAE8] bg-white px-3 py-2">
      <Text className="text-sm text-[#696976]">{label}</Text>
    </View>
  );
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-[#696976]">{label}</Text>
      <Text className="max-w-[65%] text-right text-sm font-semibold text-[#17171B]">{value}</Text>
    </View>
  );
}

function figmaLivingLabel(label: string): string {
  if (label === '입주 가능 시기' || label === '입주 희망 시기') return '입주 가능일';
  if (label === '지역' || label === '희망 지역') return '위치';
  return label;
}
