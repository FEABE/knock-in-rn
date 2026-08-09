import { useEffect, useRef, useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ReadyActionRow,
  ReadyActionSheet,
  ReadyDivider,
  ReadyMoreButton,
  ReadyProfileAvatar,
  ReadyScreenHeader,
  ReadySection,
} from '@/components/ui/ready-to-dev-components';
import { ReadyConfirmDialog, ReadyToast } from '@/components/ui/ready-to-dev-feedback';
import { GenderAgeChip } from '@/components/ui/gender-age-chip';
import {
  RoommateConditionChip,
  RoommatePriorityChip,
} from '@/components/ui/roommate-condition-chip';
import type { RoommateMatchDetailModel } from '@/lib/api';
import { formatSelectionLabel } from '@/lib/domain/selection-label';
import type { Gender } from '@/lib/onboarding';

import type { UseRoommateDetailScreenReturn } from './use-roommate-detail-screen';

export type RoommateDetailScreenViewProps = UseRoommateDetailScreenReturn;

type DetailTab = 'compatibility' | 'condition' | 'room' | 'lifestyle';

/** 인증 뱃지 색상 (Figma: SealCheck 초록 / BagSimple 파랑). */
const AUTH_BADGE_GREEN = '#3FA654';
const AUTH_BADGE_BLUE = '#4C87F6';
const RING_SIZE = 120;
const RING_STROKE = 8;
const RING_SEGMENTS = 120;
const RING_SEGMENT_WIDTH = 7;
const DETAIL_SECTION_ACTIVATION_OFFSET = 12;
const SCROLL_END_THRESHOLD = 8;

export function RoommateDetailScreenView({
  data,
  loading,
  error,
  liked,
  reportOpen,
  lifestyleExpanded,
  creatingChat,
  blockConfirmOpen,
  blocking,
  toast,
  bottomPadding,
  setReportOpen,
  onBack,
  onScroll,
  onCompatibilityLayout,
  toggleLifestyle,
  onLike,
  onChat,
  onBlock,
  onBlockCancel,
  onBlockConfirm,
  onReport,
}: RoommateDetailScreenViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<DetailTab, number>>>({});
  const programmaticTab = useRef<DetailTab | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('compatibility');

  const moveToSection = (tab: DetailTab) => {
    const y = sectionOffsets.current[tab];
    if (y === undefined) return;
    programmaticTab.current = tab;
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - DETAIL_SECTION_ACTIVATION_OFFSET),
      animated: true,
    });
  };

  const syncActiveTabFromScroll = (
    scrollY: number,
    viewportHeight: number,
    contentHeight: number,
  ) => {
    if (programmaticTab.current) return;

    if (scrollY + viewportHeight >= contentHeight - SCROLL_END_THRESHOLD) {
      if (activeTab !== 'lifestyle') setActiveTab('lifestyle');
      return;
    }

    const sectionY = scrollY + DETAIL_SECTION_ACTIVATION_OFFSET + 1;
    let nextTab: DetailTab = 'compatibility';

    DETAIL_TABS.forEach((tab) => {
      const offset = sectionOffsets.current[tab.key];
      if (offset !== undefined && offset <= sectionY) {
        nextTab = tab.key;
      }
    });

    if (nextTab !== activeTab) setActiveTab(nextTab);
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
          <DetailTabs active={activeTab} hasRoom={data.hasRoom} onPress={moveToSection} />

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="pb-28"
            onScroll={(event) => {
              onScroll(event);
              const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
              syncActiveTabFromScroll(
                contentOffset.y,
                layoutMeasurement.height,
                contentSize.height,
              );
            }}
            onScrollBeginDrag={() => {
              programmaticTab.current = null;
            }}
            onMomentumScrollEnd={(event) => {
              programmaticTab.current = null;
              const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
              syncActiveTabFromScroll(
                contentOffset.y,
                layoutMeasurement.height,
                contentSize.height,
              );
            }}
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

            <View
              onLayout={(event) => {
                sectionOffsets.current.lifestyle = event.nativeEvent.layout.y;
              }}
            >
              <LifestyleBlock data={data} expanded={lifestyleExpanded} onToggle={toggleLifestyle} />
            </View>
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
            onReport={onReport}
          />
        </>
      )}

      <ReadyConfirmDialog
        open={blockConfirmOpen}
        title="사용자를 차단할까요?"
        description={'차단 시 사용자의 게시글이 보이지 않고,\n채팅도 보낼 수 없어요'}
        cancelLabel="취소"
        confirmLabel="차단"
        destructive
        processing={blocking}
        onCancel={onBlockCancel}
        onConfirm={onBlockConfirm}
      />
      <ReadyToast visible={toast !== null} message={toast ?? ''} tone="success" />
    </SafeAreaView>
  );
}

function ProfileHead({ data }: { data: RoommateMatchDetailModel }) {
  const roomBadge = data.roomStatusLabel.split('·')[0]?.trim();
  return (
    <View className="flex-row items-center gap-3 px-4 pb-7 pt-4">
      <ReadyProfileAvatar
        name={data.name || data.initial}
        imageUrl={data.profileImageUrl}
        size={62}
      />

      <View className="flex-1 gap-2">
        <View className="flex-row items-center gap-0.5">
          <Text className="text-[16px] font-semibold leading-6 text-[#17171B]">{data.name}</Text>
          <AuthBadgeIcons
            isAuthStudent={data.isAuthStudent}
            isAuthEmployee={data.isAuthEmployee}
            size={18}
          />
        </View>
        <View className="flex-row flex-wrap gap-2">
          <GenderAgeChip age={data.age} gender={genderFromLabel(data.genderLabel)} />
          {roomBadge ? <RoomStatusChip label={roomBadge} /> : null}
        </View>
      </View>
    </View>
  );
}

/** Figma 인증 아이콘: 학생 인증 = SealCheck(초록), 직장 인증 = BagSimple(파랑). */
function AuthBadgeIcons({
  isAuthStudent,
  isAuthEmployee,
  size,
}: {
  isAuthStudent: boolean;
  isAuthEmployee: boolean;
  size: number;
}) {
  if (!isAuthStudent && !isAuthEmployee) return null;
  return (
    <>
      {isAuthStudent ? (
        <MaterialIcons name="verified" size={size} color={AUTH_BADGE_GREEN} />
      ) : null}
      {isAuthEmployee ? (
        <MaterialIcons name="work" size={size - 2} color={AUTH_BADGE_BLUE} />
      ) : null}
    </>
  );
}

/** 상세 모델의 성별 라벨("남성"/"여성")을 도메인 Gender 값으로 되돌린다. */
function genderFromLabel(genderLabel?: string): Gender {
  if (genderLabel === '남성') return 'male';
  if (genderLabel === '여성') return 'female';
  return 'other';
}

function RoomStatusChip({ label }: { label: string }) {
  const hasRoom = label.includes('있');
  return (
    <View
      className={`h-[22px] flex-row items-center justify-center gap-1 rounded px-2 ${
        hasRoom ? 'bg-[#ECF2FE]' : 'bg-[#F6F6FA]'
      }`}
    >
      <Ionicons name="home" size={16} color={hasRoom ? '#4C87F6' : '#696976'} />
      <Text
        className={`text-[12px] font-semibold leading-[17px] ${
          hasRoom ? 'text-[#4C87F6]' : 'text-[#696976]'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailTabs({
  active,
  hasRoom,
  onPress,
}: {
  active: DetailTab;
  hasRoom: boolean;
  onPress: (tab: DetailTab) => void;
}) {
  const { width } = useWindowDimensions();
  const tabWidth = width / 3;
  const tabScrollRef = useRef<ScrollView>(null);
  const tabs = DETAIL_TABS.map((tab) =>
    tab.key === 'room' ? { ...tab, label: hasRoom ? '방 소개' : '희망 방 형태' } : tab,
  );

  useEffect(() => {
    const activeIndex = DETAIL_TABS.findIndex((tab) => tab.key === active);
    if (activeIndex < 0) return;

    tabScrollRef.current?.scrollTo({
      x: Math.max(0, activeIndex - 2) * tabWidth,
      animated: true,
    });
  }, [active, tabWidth]);

  return (
    <View className="border-b border-[#ECECF3] bg-white">
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: tabWidth * tabs.length }}
      >
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`h-11 items-center justify-center border-b-2 px-1 ${
                selected ? 'border-[#256EF4]' : 'border-transparent'
              }`}
              style={{ width: tabWidth }}
            >
              <Text
                numberOfLines={1}
                className={
                  selected
                    ? 'text-[16px] font-semibold leading-6 text-[#17171B]'
                    : 'text-[16px] font-medium leading-6 text-[#AAAABA]'
                }
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'compatibility', label: '궁합 점수' },
  { key: 'condition', label: '룸메이트 조건' },
  { key: 'room', label: '방 소개' },
  { key: 'lifestyle', label: '생활 패턴' },
];

function CompatibilityBlock({ data }: { data: RoommateMatchDetailModel }) {
  const score = data.compatibility.score;
  const hasScore = typeof score === 'number';
  return (
    <ReadySection title="궁합 점수">
      <View className="items-center py-4">
        <View
          className="items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <CompatibilityRing progress={hasScore ? score : 0} active={hasScore} />
          <Text
            className={`text-[36px] font-bold leading-[44px] ${
              hasScore ? 'text-[#256EF4]' : 'text-[#AAAABA]'
            }`}
          >
            {hasScore ? Math.round(score) : '--'}
            <Text className="text-[13px] font-semibold">점</Text>
          </Text>
        </View>
      </View>
    </ReadySection>
  );
}

function CompatibilityRing({ progress, active }: { progress: number; active: boolean }) {
  const normalized = Math.max(0, Math.min(100, progress));
  const activeSegments = Math.round((normalized / 100) * RING_SEGMENTS);
  const trackColor = active ? '#ECF2FE' : '#E5E7EB';

  return (
    <View
      className="absolute items-center justify-center"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      <View
        className="absolute rounded-full"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          borderWidth: RING_STROKE,
          borderColor: trackColor,
        }}
      />
      {active
        ? Array.from({ length: activeSegments }).map((_, index) => (
            <View
              key={index}
              className="absolute items-center"
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                transform: [{ rotate: `${index * (360 / RING_SEGMENTS)}deg` }],
              }}
            >
              <View
                style={{
                  width: RING_SEGMENT_WIDTH,
                  height: RING_STROKE,
                  borderRadius: RING_STROKE / 2,
                  backgroundColor: '#256EF4',
                }}
              />
            </View>
          ))
        : null}
    </View>
  );
}

function PreferredRoommateBlock({ data }: { data: RoommateMatchDetailModel }) {
  const priorities = data.conditionChips;

  return (
    <ReadySection title="선호 룸메이트 조건">
      {data.preferenceRows.length ? (
        <View className="flex-row flex-wrap gap-2">
          {data.preferenceRows.map((preference) => (
            <RoommateConditionChip
              key={preference.key}
              label={formatSelectionLabel(preference.label, preference.value)}
              image={preference.image}
            />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-[#AAAABA]">등록된 선호 조건이 없어요</Text>
      )}

      {priorities.length ? (
        <View className="gap-2">
          <Text className="text-[15px] font-semibold leading-[22px] text-[#256EF4]">우선순위</Text>
          <View className="flex-row flex-wrap gap-2">
            {priorities.map((priority) => (
              <RoommatePriorityChip
                key={priority.key}
                label={priority.label}
                image={priority.image}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ReadySection>
  );
}

function RoomIntroductionBlock({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <ReadySection title={data.hasRoom ? '방 소개' : '희망 방 형태'}>
      <View className="gap-5">
        {data.livingRows.map((row) => (
          <KeyVal key={row.label} label={row.label} value={row.value} />
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
            <LifestyleTile key={lifestyle.id} label={lifestyle.name} value={lifestyle.value} />
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

function LifestyleTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="h-[76px] min-w-[47%] flex-1 justify-center gap-0.5 rounded bg-[#F6F6FA] px-5 py-[13px]">
      <Text className="text-[13px] font-medium leading-[19px] text-[#696976]">{label}</Text>
      <Text className="text-[16px] font-semibold leading-6 text-[#17171B]">{value}</Text>
    </View>
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
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-[#ECECF3] bg-white px-4 pt-4"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel={liked ? '관심 해제' : '관심 등록'}
        className="h-12 w-[50px] items-center justify-center rounded-lg border-[1.5px] border-[#DADAE8]"
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
          <Text className="text-[16px] font-bold leading-6 text-white">채팅하기</Text>
        )}
      </Pressable>
    </View>
  );
}

function ReportSheet({
  open,
  onOpenChange,
  onBlock,
  onReport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlock: () => void;
  onReport: () => void;
}) {
  return (
    <ReadyActionSheet open={open} onOpenChange={onOpenChange}>
      <View>
        <ReadyActionRow
          icon="ban-outline"
          label="사용자 차단하기"
          tone="danger"
          divider
          onPress={onBlock}
        />
        <ReadyActionRow icon="notifications-outline" label="사용자 신고하기" onPress={onReport} />
      </View>
    </ReadyActionSheet>
  );
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-start gap-2">
      <Text className="text-[15px] font-medium leading-[22px] text-[#696976]">{label}</Text>
      <Text className="w-full text-left text-[16px] font-semibold leading-6 text-[#17171B]">
        {value}
      </Text>
    </View>
  );
}
