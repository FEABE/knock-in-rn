import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { UseProfileCardReturn } from './use-profile-card';

export type ProfileCardViewProps = UseProfileCardReturn & {
  className?: string;
};

export function ProfileCardView({
  user,
  visibility,
  visibilityLabel,
  onEdit,
  hasBadges,
  className,
}: ProfileCardViewProps) {
  return (
    <View className={className ?? 'gap-4 rounded-2xl border border-neutral-200 bg-white p-5'}>
      <View className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-xl font-semibold text-neutral-600">{user.name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-neutral-900">{user.name}</Text>
          <View className="flex-row items-center gap-2">
            <Text
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                visibility === 'public'
                  ? 'bg-[#256EF4]/10 text-[#256EF4]'
                  : visibility === 'hidden'
                    ? 'bg-neutral-100 text-neutral-500'
                    : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {visibilityLabel}
            </Text>
            {hasBadges
              ? user.badges.map((b) => (
                  <View
                    key={b.kind}
                    className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5"
                  >
                    <Ionicons
                      name={b.kind === 'school' ? 'school-outline' : 'business-outline'}
                      size={11}
                      color="#047857"
                    />
                    <Text className="text-[10px] text-emerald-700">
                      {b.kind === 'school' ? '학교 인증' : '회사 인증'}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        </View>
      </View>

      <Pressable
        onPress={onEdit}
        className="self-start rounded-full border border-neutral-200 bg-white px-4 py-2 active:bg-neutral-50"
      >
        <Text className="text-sm font-medium text-neutral-800">프로필 변경</Text>
      </Pressable>
    </View>
  );
}
