import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/headless';
import type { RoommateMatchDetailModel } from '@/lib/api';

import {
  ROOMMATE_REPORT_REASONS,
  type UseRoommateDetailScreenReturn,
} from './use-roommate-detail-screen';

export type RoommateDetailScreenViewProps = UseRoommateDetailScreenReturn;

type DetailTab = 'compatibility' | 'condition' | 'room';

export function RoommateDetailScreenView({
  data,
  loading,
  error,
  liked,
  reportOpen,
  lifestyleExpanded,
  bottomPadding,
  setReportOpen,
  onBack,
  onScroll,
  onCompatibilityLayout,
  toggleLifestyle,
  onLike,
  onRequest,
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
      <Header onBack={onBack} onReport={() => setReportOpen(true)} />

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

            <Divider />

            <View
              onLayout={(event) => {
                sectionOffsets.current.condition = event.nativeEvent.layout.y;
              }}
            >
              <PreferredRoommateBlock data={data} />
            </View>

            <Divider />

            <View
              onLayout={(event) => {
                sectionOffsets.current.room = event.nativeEvent.layout.y;
              }}
            >
              <RoomIntroductionBlock data={data} />
            </View>

            <Divider />
            <LifestyleBlock data={data} expanded={lifestyleExpanded} onToggle={toggleLifestyle} />
          </ScrollView>

          <BottomBar
            liked={liked}
            onLike={onLike}
            onRequest={onRequest}
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

function Header({ onBack, onReport }: { onBack: () => void; onReport: () => void }) {
  return (
    <View className="h-12 flex-row items-center justify-between px-3">
      <Pressable
        onPress={onBack}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
      >
        <Ionicons name="chevron-back" size={22} color="#696976" />
      </Pressable>
      <Text className="text-base font-semibold text-[#17171B]">룸메 찾아요</Text>
      <Pressable
        onPress={onReport}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="신고 및 차단"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#696976" />
      </Pressable>
    </View>
  );
}

function ProfileHead({ data }: { data: RoommateMatchDetailModel }) {
  const roomBadge = data.roomStatusLabel.split('·')[0]?.trim();
  return (
    <View className="flex-row items-center gap-3 px-4 py-4">
      {data.profileImageUrl ? (
        <Image
          source={{ uri: data.profileImageUrl }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F6F6FA]">
          <Text className="text-lg font-semibold text-[#696976]">{data.initial}</Text>
        </View>
      )}

      <View className="flex-1 gap-2">
        <View className="flex-row items-center gap-1">
          <Text className="text-base font-semibold text-[#17171B]">{data.name}</Text>
          {data.isAuthStudent || data.isAuthEmployee ? (
            <Ionicons name="checkmark-circle" size={14} color="#34B27B" />
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {data.age ? <InfoChip label={`${data.age}세`} tone="pink" /> : null}
          {data.genderLabel ? <InfoChip label={data.genderLabel} tone="pink" /> : null}
          {roomBadge ? <InfoChip label={roomBadge} tone="blue" icon="home" /> : null}
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
    <View className="px-4 py-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-[#17171B]">궁합 점수</Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-[#AAAABA]">프로필 완성 후 실제 점수 반영</Text>
          <Ionicons name="information-circle" size={14} color="#C8C8D4" />
        </View>
      </View>
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
    </View>
  );
}

function PreferredRoommateBlock({ data }: { data: RoommateMatchDetailModel }) {
  const priorities = data.conditionText
    .split('·')
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <View className="gap-4 px-4 py-6">
      <Text className="text-sm font-semibold text-[#17171B]">선호 룸메이트 조건</Text>
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
              <View key={priority} className="rounded bg-[#EEF4FF] px-3 py-2">
                <Text className="text-sm font-medium text-[#17171B]">{priority}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function RoomIntroductionBlock({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <View className="gap-4 px-4 py-6">
      <Text className="text-sm font-semibold text-[#17171B]">방 소개</Text>
      <View className="gap-3">
        {data.livingRows.map((row) => (
          <KeyVal key={row.label} label={figmaLivingLabel(row.label)} value={row.value} />
        ))}
      </View>
    </View>
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
    <View className="gap-4 px-4 py-6">
      <Text className="text-sm font-semibold text-[#17171B]">생활 패턴</Text>
      {items.length ? (
        <View className="flex-row flex-wrap gap-3">
          {items.map((lifestyle) => (
            <View
              key={lifestyle.id}
              className="min-h-[76px] min-w-[47%] flex-1 justify-center gap-1 rounded bg-[#F6F6FA] px-4 py-3"
            >
              <Text className="text-xs text-[#AAAABA]">{lifestyle.name}</Text>
              <Text className="text-sm font-semibold text-[#17171B]">{lifestyle.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-[#AAAABA]">등록된 생활 패턴이 없어요</Text>
      )}
      {data.lifeStyles.length > 4 ? (
        <Pressable onPress={onToggle} className="flex-row items-center justify-center gap-1 py-1">
          <Text className="text-xs text-[#AAAABA]">{expanded ? '접기' : '더보기'}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color="#AAAABA" />
        </Pressable>
      ) : null}
    </View>
  );
}

function BottomBar({
  liked,
  onLike,
  onRequest,
  bottomPadding,
}: {
  liked: boolean;
  onLike: () => void;
  onRequest: () => void;
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
        onPress={onRequest}
        className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">채팅 요청하기</Text>
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
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
    >
      <Text className="mb-3 text-base font-semibold text-[#17171B]">신고 및 차단</Text>
      <Pressable
        onPress={onBlock}
        className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 active:bg-red-100"
      >
        <Text className="text-sm font-semibold text-red-600">이 사용자 차단</Text>
      </Pressable>
      <Text className="mb-2 text-xs font-medium text-[#AAAABA]">신고 사유</Text>
      <View className="gap-2">
        {ROOMMATE_REPORT_REASONS.map((reason) => (
          <Pressable
            key={reason}
            onPress={() => onReportReason(reason)}
            className="rounded-xl border border-[#DADAE8] px-4 py-3 active:bg-[#F6F6FA]"
          >
            <Text className="text-sm text-[#17171B]">{reason}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

function InfoChip({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: 'pink' | 'blue';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      className={`flex-row items-center gap-1 rounded px-1.5 py-1 ${
        tone === 'pink' ? 'bg-[#FDEFEC]' : 'bg-[#E7F4FE]'
      }`}
    >
      {icon ? <Ionicons name={icon} size={11} color="#256EF4" /> : null}
      <Text
        className={tone === 'pink' ? 'text-[11px] text-[#D63D4A]' : 'text-[11px] text-[#256EF4]'}
      >
        {label}
      </Text>
    </View>
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

function Divider() {
  return <View className="h-2 bg-[#F6F6FA]" />;
}

function figmaLivingLabel(label: string): string {
  if (label === '입주 가능 시기' || label === '입주 희망 시기') return '입주 가능일';
  if (label === '지역' || label === '희망 지역') return '위치';
  return label;
}
