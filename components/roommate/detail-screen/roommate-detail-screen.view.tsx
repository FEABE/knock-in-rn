import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { BottomSheet } from '@/components/ui/headless';
import type { RoommateMatchDetailModel } from '@/lib/api';

import {
  ROOMMATE_REPORT_REASONS,
  type UseRoommateDetailScreenReturn,
} from './use-roommate-detail-screen';

export type RoommateDetailScreenViewProps = UseRoommateDetailScreenReturn;

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
  onReportReason,
}: RoommateDetailScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header onBack={onBack} onReport={() => setReportOpen(true)} />

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">불러오는 중...</Text>
        </View>
      ) : error || !data ? (
        <View className="flex-1 items-center justify-center gap-2 p-10">
          <Text className="text-sm text-neutral-500">정보를 불러오지 못했어요</Text>
          {error ? <Text className="text-xs text-neutral-400">{error}</Text> : null}
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 p-5 pb-28"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <ProfileHead data={data} />
            <RoomStatus data={data} />
            <LifestyleBlock data={data} expanded={lifestyleExpanded} onToggle={toggleLifestyle} />
            <PreferredLivingBlock data={data} />
            <PreferredRoommateBlock data={data} />
            <View onLayout={(event) => onCompatibilityLayout(event.nativeEvent.layout.y)}>
              <CompatibilityBlock data={data} />
            </View>
          </ScrollView>

          <BottomBar
            liked={liked}
            onLike={onLike}
            onRequest={onRequest}
            bottomPadding={bottomPadding}
          />
          <BottomSheet
            open={reportOpen}
            onOpenChange={setReportOpen}
            contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
          >
            <Text className="mb-3 text-base font-semibold text-neutral-900">사용자 신고</Text>
            <View className="gap-2">
              {ROOMMATE_REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => onReportReason(reason)}
                  className="rounded-xl border border-neutral-200 px-4 py-3 active:bg-neutral-50"
                >
                  <Text className="text-sm text-neutral-800">{reason}</Text>
                </Pressable>
              ))}
            </View>
          </BottomSheet>
        </>
      )}
    </SafeAreaView>
  );
}

function Header({ onBack, onReport }: { onBack: () => void; onReport: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404047" />
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">룸메이트 찾기</Text>
      <Pressable onPress={onReport} className="h-9 w-9 items-center justify-center">
        <Text className="text-xl text-neutral-700">⋯</Text>
      </Pressable>
    </View>
  );
}

function ProfileHead({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <View className="items-center gap-3">
      {data.profileImageUrl ? (
        <Image
          source={{ uri: data.profileImageUrl }}
          style={{ width: 96, height: 96, borderRadius: 48 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-2xl font-semibold text-neutral-600">{data.initial}</Text>
        </View>
      )}
      <View className="items-center gap-1">
        <Text className="text-xl font-bold text-neutral-900">
          {[data.name, data.genderLabel, data.age ? `${data.age}세` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text className="text-xs text-neutral-500">{data.regionLabel}</Text>
      </View>
      <View className="flex-row gap-2">
        {data.isAuthStudent ? <Badge label="✓ 학교 인증" tone="emerald" /> : null}
        {data.isAuthEmployee ? <Badge label="✓ 회사 인증" tone="emerald" /> : null}
      </View>
    </View>
  );
}

function RoomStatus({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <Section title="방 여부">
      <View className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="text-sm text-neutral-600">{data.roomStatusLabel}</Text>
      </View>
    </Section>
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
    <Section title="생활 패턴">
      <View className="flex-row flex-wrap gap-2">
        {items.map((lifestyle) => (
          <View
            key={lifestyle.id}
            className="min-w-[47%] flex-1 gap-0.5 rounded-2xl bg-neutral-50 p-3"
          >
            <Text className="text-[11px] text-neutral-500">{lifestyle.name}</Text>
            <Text className="text-sm font-semibold text-neutral-800">{lifestyle.value}</Text>
          </View>
        ))}
      </View>
      {data.lifeStyles.length > 4 ? (
        <Pressable onPress={onToggle} className="items-center py-1">
          <Text className="text-xs text-neutral-500">{expanded ? '접기 ⌃' : '더보기 ⌄'}</Text>
        </Pressable>
      ) : null}
    </Section>
  );
}

function PreferredLivingBlock({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <Section title="희망 거주 조건">
      <View className="gap-2">
        {data.livingRows.map((row) => (
          <KeyVal key={row.label} label={row.label} value={row.value} />
        ))}
      </View>
    </Section>
  );
}

function PreferredRoommateBlock({ data }: { data: RoommateMatchDetailModel }) {
  return (
    <Section title="희망 룸메이트 조건">
      <View className="gap-2">
        {data.preferenceRows.map((preference) => (
          <KeyVal key={preference.key} label={preference.label} value={preference.value} />
        ))}
        {data.conditionText ? <KeyVal label="중요 조건" value={data.conditionText} /> : null}
      </View>
    </Section>
  );
}

function CompatibilityBlock({ data }: { data: RoommateMatchDetailModel }) {
  const hasScore = data.compatibility.score !== undefined;
  return (
    <Section title="나와 궁합">
      <View className="flex-row items-center gap-4 rounded-2xl border border-neutral-100 p-4">
        <View
          className={`h-20 w-20 items-center justify-center rounded-full border-4 ${
            hasScore ? 'border-[#256EF4]' : 'border-neutral-200'
          }`}
        >
          <Text
            className={
              hasScore ? 'text-xl font-bold text-[#256EF4]' : 'text-xl font-bold text-neutral-400'
            }
          >
            {hasScore ? `${data.compatibility.score}점` : '--점'}
          </Text>
        </View>
        <View className="flex-1 gap-2">
          {data.compatibility.items.map((info) => (
            <View key={info.key} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-neutral-600">{info.title}</Text>
                <Text className="text-xs font-semibold text-[#256EF4]">{info.label}점</Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <View
                  style={{ width: `${Math.min(100, info.percent)}%` }}
                  className="h-full rounded-full bg-[#256EF4]"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Section>
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
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 border-t border-neutral-100 bg-white px-5 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onLike}
        className="h-12 w-12 items-center justify-center rounded-xl border border-neutral-200"
      >
        <Text className={liked ? 'text-xl text-red-500' : 'text-xl text-neutral-400'}>
          {liked ? '♥' : '♡'}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRequest}
        className="h-12 flex-1 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-sm font-semibold text-white">매칭 요청</Text>
      </Pressable>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-neutral-800">{title}</Text>
      {children}
    </View>
  );
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-sm font-semibold text-neutral-800">{value}</Text>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'emerald' | 'sky' }) {
  const bgClass = tone === 'emerald' ? 'bg-emerald-50' : 'bg-sky-50';
  const textClass = tone === 'emerald' ? 'text-emerald-700' : 'text-sky-700';
  return (
    <View className={`rounded px-2 py-1 ${bgClass}`}>
      <Text className={`text-[11px] ${textClass}`}>{label}</Text>
    </View>
  );
}
