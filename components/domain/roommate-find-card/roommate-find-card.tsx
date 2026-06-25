import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { MatchListItem } from '@/lib/api';

export type RoommateFindCardProps = {
  match: MatchListItem;
  onPress?: (match: MatchListItem) => void;
};

/**
 * 와이어프레임 "탐색_룸메이트 찾기" 리스트 카드.
 * 명세 MatchListItem 을 그대로 받아 렌더한다.
 */
export function RoommateFindCard({ match, onPress }: RoommateFindCardProps) {
  const [liked, setLiked] = useState(match.isLike === true);
  const name = match.name ?? '이름 없음';
  const score = Number(match.score) || 0;
  const lifestyleChips = (match.lifeStyles ?? [])
    .slice(0, 4)
    .map((l) => l.name)
    .filter(Boolean);
  const conditionChips = (match.conditions ?? []).map((c) => c.name).filter(Boolean);

  return (
    <Pressable
      onPress={() => onPress?.(match)}
      className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-90"
      accessibilityRole="button"
    >
      {/* 헤더 */}
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-base font-semibold text-neutral-500">{name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-neutral-900">{name}</Text>
            <View className="rounded bg-emerald-50 px-1.5 py-0.5">
              <Text className="text-[10px] text-emerald-700">
                {match.roomProfileType ? '방 있음' : '방 없음'}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => setLiked((p) => !p)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-neutral-50"
        >
          <Text className={liked ? 'text-base text-red-500' : 'text-base text-neutral-400'}>
            {liked ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      {/* 정보 행 */}
      <View className="gap-1.5">
        <InfoRow label="보증금 / 월세" value={`${match.deposit} / ${match.mounthRent}`} />
        <InfoRow label="입주 가능" value={formatDate(match.comeableAt)} />
        <InfoRow label="방 형태" value={(match.roomType ?? []).join(', ')} />
        <InfoRow label="위치" value={String(match.region ?? '')} />
      </View>

      {/* 생활패턴 칩 */}
      {lifestyleChips.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {lifestyleChips.map((c, i) => (
            <View key={i} className="rounded bg-[#256EF4]/10 px-2 py-1">
              <Text className="text-[11px] text-[#256EF4]">{c}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 선호조건 칩 (outline) */}
      {conditionChips.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {conditionChips.map((c, i) => (
            <View key={i} className="rounded-full border border-neutral-200 px-2.5 py-1">
              <Text className="text-[11px] text-neutral-500">{c}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 궁합 점수 바 */}
      <View className="flex-row items-center gap-2 border-t border-neutral-100 pt-3">
        <Text className="text-xs text-neutral-500">궁합</Text>
        <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <View
            style={{ width: `${Math.min(100, score)}%` }}
            className="h-full rounded-full bg-[#256EF4]"
          />
        </View>
        <Text className="text-sm font-bold text-[#256EF4]">{score}점</Text>
      </View>
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-800">{value}</Text>
    </View>
  );
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
