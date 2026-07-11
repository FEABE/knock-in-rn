import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { Toggle } from '@/components/ui/headless';

import type { MyPageMenuRow, UseMyPageHomeScreenReturn } from './use-mypage-home-screen';

export type MyPageHomeScreenViewProps = UseMyPageHomeScreenReturn;

export function MyPageHomeScreenView({
  user,
  schoolVerified,
  companyVerified,
  profileVisible,
  notificationEnabled,
  notificationEditable,
  genderLabel,
  profileRegionLabel,
  roomTypeLabel,
  matchingRows,
  accountRows,
  onSignIn,
  setProfileVisible,
  setNotificationEnabled,
}: MyPageHomeScreenViewProps) {
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-4 pb-3 pt-4">
          <Text className="text-[28px] font-extrabold text-neutral-900">마이페이지</Text>
        </View>
        <View className="gap-3 p-5">
          <LoginPromptCard
            title="로그인하고 노크인을 시작해보세요"
            description="생활패턴 기반 룸메이트 매칭 · 학교/회사 이메일 인증"
            onPress={onSignIn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pb-3 pt-4">
        <Text className="text-[28px] font-extrabold text-neutral-900">마이페이지</Text>
      </View>

      <ScrollView contentContainerClassName="pb-24">
        <View className="gap-4 px-4 pb-6 pt-2">
          <View className="flex-row items-center gap-5">
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 82, height: 82, borderRadius: 41 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-[82px] w-[82px] items-center justify-center rounded-full bg-[#ECECF3]">
                <Text className="text-xl font-semibold text-[#696976]">{user.name.charAt(0)}</Text>
              </View>
            )}
            <View className="flex-1 gap-1">
              <Text className="text-[22px] font-bold text-[#17171B]">{user.name}</Text>
              <Text className="text-sm text-[#696976]">
                {user.age > 0 ? `${user.age}세 · ` : ''}
                {genderLabel} · {profileRegionLabel}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <Tag label={roomTypeLabel} tone="emerald" />
            {schoolVerified ? <Tag label="학교 인증" tone="emerald" /> : null}
            {companyVerified ? <Tag label="회사 인증" tone="blue" /> : null}
          </View>
        </View>

        <Section title="프로필">
          <View className="flex-row items-center justify-between border-b border-[#ECECF3] px-4 py-4">
            <View>
              <Text className="text-sm font-medium text-neutral-800">프로필 공개</Text>
              <Text className="text-xs text-neutral-400">룸메이트 매칭 탭에 노출 중이에요</Text>
            </View>
            <Switch checked={profileVisible} onChange={setProfileVisible} />
          </View>
        </Section>

        <Section title="매칭 설정">
          {matchingRows.map((row, index) => (
            <MenuRow key={row.label} row={row} last={index === matchingRows.length - 1} />
          ))}
        </Section>

        <Section title="계정 관리">
          {accountRows.slice(0, 1).map((row) => (
            <MenuRow key={row.label} row={row} />
          ))}
          <View className="flex-row items-center border-b border-neutral-100 px-4 py-4">
            <Text className="flex-1 text-[15px] font-medium text-[#17171B]">알림</Text>
            <Switch
              checked={notificationEnabled}
              disabled={!notificationEditable}
              onChange={setNotificationEnabled}
            />
          </View>
          {accountRows.slice(1).map((row, index) => (
            <MenuRow key={row.label} row={row} last={index === accountRows.length - 2} />
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="border-b border-[#ECECF3] px-4 pb-2 text-sm font-semibold text-[#696976]">
        {title}
      </Text>
      <View className="bg-white">{children}</View>
    </View>
  );
}

function MenuRow({ row, last }: { row: MyPageMenuRow; last?: boolean }) {
  return (
    <Pressable
      onPress={row.onPress}
      className={`flex-row items-center px-4 py-4 active:bg-neutral-50 ${
        last ? '' : 'border-b border-neutral-100'
      }`}
    >
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-[#17171B]">{row.label}</Text>
        {row.sub ? <Text className="text-xs text-neutral-400">{row.sub}</Text> : null}
      </View>
      {row.badge ? (
        <Text className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">
          {row.badge}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#D4D4D4" />
    </Pressable>
  );
}

function Switch({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Toggle checked={checked} disabled={disabled} onCheckedChange={onChange}>
      {({ checked: isChecked }) => (
        <View
          className={`h-7 w-12 justify-center rounded-full px-1 ${
            isChecked ? 'bg-[#256EF4]' : disabled ? 'bg-neutral-200' : 'bg-neutral-300'
          }`}
        >
          <View className={`h-5 w-5 rounded-full bg-white ${isChecked ? 'ml-5' : 'ml-0'}`} />
        </View>
      )}
    </Toggle>
  );
}

function Tag({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'emerald' | 'blue';
}) {
  const bgClass =
    tone === 'emerald' ? 'bg-emerald-50' : tone === 'blue' ? 'bg-blue-50' : 'bg-neutral-100';
  const textClass =
    tone === 'emerald'
      ? 'text-emerald-700'
      : tone === 'blue'
        ? 'text-blue-600'
        : 'text-neutral-500';
  return (
    <View className={`rounded px-2 py-0.5 ${bgClass}`}>
      <Text className={`text-[10px] ${textClass}`}>{label}</Text>
    </View>
  );
}
