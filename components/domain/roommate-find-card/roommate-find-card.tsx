import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View, type GestureResponderEvent } from 'react-native';

import { PriorityArtwork } from '@/components/ui/ready-to-dev-assets';
import { useRequireLogin } from '@/lib/auth';
import type { RoommateMatchCardModel } from '@/lib/api';

const PROFILE_IMAGE_STYLE = { width: 62, height: 62, borderRadius: 31 } as const;

const AUTH_BADGE_GREEN = '#3FA654';
const AUTH_BADGE_BLUE = '#4C87F6';

export type RoommateFindCardProps = {
  match: RoommateMatchCardModel;
  onPress?: (match: RoommateMatchCardModel) => void;
  onLikeChange?: (match: RoommateMatchCardModel, liked: boolean) => void;
};

export function RoommateFindCard({ match, onPress, onLikeChange }: RoommateFindCardProps) {
  const { isLoggedIn, requireLogin } = useRequireLogin();
  const score = Math.max(0, Math.min(100, match.compatibilityScore));
  const onCompatibilityLoginPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    requireLogin(() => undefined);
  };

  return (
    <View
      className="gap-3 rounded-lg border border-[#D8E5FD]/70 bg-white px-[14px] py-4 active:opacity-90"
      style={{
        shadowColor: '#ECF2FE',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Pressable
        onPress={() => onPress?.(match)}
        accessibilityRole="button"
        className="gap-3 active:opacity-90"
      >
        <View className="flex-row items-center gap-3">
          {match.profileImageUrl ? (
            <Image
              source={{ uri: match.profileImageUrl }}
              style={PROFILE_IMAGE_STYLE}
              contentFit="cover"
            />
          ) : (
            <View className="h-[62px] w-[62px] items-center justify-center rounded-full border border-[#DADAE8] bg-white">
              <Ionicons name="person" size={43} color="#DADAE8" />
            </View>
          )}

          <View className="min-w-0 flex-1 gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-0.5">
                <Text
                  numberOfLines={1}
                  className="text-[16px] font-semibold leading-6 text-[#17171B]"
                >
                  {match.name}
                </Text>
                {match.isAuthStudent ? (
                  <MaterialIcons name="verified" size={18} color={AUTH_BADGE_GREEN} />
                ) : null}
                {match.isAuthEmployee ? (
                  <MaterialIcons name="work" size={18} color={AUTH_BADGE_BLUE} />
                ) : null}
              </View>

              <Pressable
                onPress={() => onLikeChange?.(match, !match.liked)}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center"
                accessibilityLabel={match.liked ? '관심 해제' : '관심 등록'}
              >
                <Ionicons
                  name={match.liked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={match.liked ? '#256EF4' : '#AAAABA'}
                />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {match.age || match.genderLabel ? <GenderChip match={match} /> : null}
              <RoomStatusChip hasRoom={match.hasRoom} />
            </View>
          </View>
        </View>

        {isLoggedIn ? (
          <View className="flex-row items-center justify-between">
            <View className="h-[7px] flex-1 overflow-hidden rounded bg-[#ECECF3]">
              <View style={{ width: `${score}%` }} className="h-full rounded bg-[#256EF4]" />
            </View>
            <Text className="ml-5 w-[33px] text-right text-[15px] font-semibold leading-[22px] text-[#083891]">
              {match.compatibilityScore}점
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onCompatibilityLoginPress}
            accessibilityRole="button"
            accessibilityLabel="로그인하고 궁합 점수 확인하기"
            className="h-9 flex-row items-center justify-center gap-2 rounded-lg border border-[#256EF4] bg-white active:bg-[#ECF2FE]"
          >
            <Ionicons name="lock-closed" size={16} color="#256EF4" />
            <Text className="text-[14px] font-semibold leading-[21px] text-[#256EF4]">
              로그인하고 궁합 점수 확인하기
            </Text>
          </Pressable>
        )}

        <View className="h-[107px] justify-center gap-2 rounded-lg bg-[#F6F6FA] px-[14px] py-3">
          <InfoRow label="예산" value={match.depositRentLabel.replace(/\s\/\s/g, '/')} />
          <InfoRow label="방 형태" value={match.roomTypeLabel} />
          <InfoRow label="위치" value={match.regionLabel} />
        </View>
      </Pressable>

      {match.lifestyleChips.length > 0 ? (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          directionalLockEnabled
        >
          {match.lifestyleChips.map((chip) => (
            <View
              key={chip.key}
              className="h-9 max-w-[149px] shrink-0 flex-row items-center justify-center gap-2 rounded-lg border border-[#DADAE8]/80 bg-white px-[15px]"
            >
              <PriorityArtwork label={chip.label} image={chip.image} size={22} />
              <Text
                numberOfLines={1}
                className="text-[14px] font-medium leading-[21px] text-[#696976]"
              >
                {chip.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function GenderChip({ match }: { match: RoommateMatchCardModel }) {
  const isMale = match.gender === 'male';
  return (
    <View
      className={`h-[22px] flex-row items-center justify-center gap-1 rounded px-[5px] ${
        isMale ? 'bg-[#E7F4FE]' : 'bg-[#FDEFEC]'
      }`}
    >
      {match.gender ? (
        <Ionicons
          name={isMale ? 'male' : 'female'}
          size={12}
          color={isMale ? '#0B78CB' : '#DE3412'}
        />
      ) : null}
      <Text
        className={`text-[12px] font-semibold leading-[18px] ${
          isMale ? 'text-[#0B78CB]' : 'text-[#DE3412]'
        }`}
      >
        {[match.age ? `${match.age}세` : null, match.genderLabel].filter(Boolean).join(' · ')}
      </Text>
    </View>
  );
}

function RoomStatusChip({ hasRoom }: { hasRoom: boolean }) {
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
        {hasRoom ? '방 있음' : '방 없음'}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[14px] font-medium leading-[21px] text-[#696976]">{label}</Text>
      <Text className="max-w-[70%] text-right text-[14px] font-medium leading-[21px] text-[#17171B]">
        {value}
      </Text>
    </View>
  );
}
