import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Toggle } from '@/components/ui/headless';

import type { MyPageMenuRow, UseMyPageHomeScreenReturn } from './use-mypage-home-screen';

export type MyPageHomeScreenViewProps = UseMyPageHomeScreenReturn;

export function MyPageHomeScreenView({
  user,
  verified,
  profileVisible,
  notificationEnabled,
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
        <View className="px-5 pb-3 pt-2">
          <Text className="text-2xl font-bold text-neutral-900">마이</Text>
        </View>
        <View className="gap-3 p-5">
          <View className="gap-3 rounded-lg bg-[#256EF4]/10 p-5">
            <Text className="text-base font-bold text-[#256EF4]">
              로그인하고 노크인을 시작해보세요
            </Text>
            <Text className="text-sm text-[#256EF4]/70">
              생활패턴 기반 룸메이트 매칭 · 학교/회사 이메일 인증
            </Text>
            <Pressable
              onPress={onSignIn}
              className="self-start rounded-full bg-yellow-300 px-5 py-3 active:opacity-90"
            >
              <Text className="text-sm font-semibold text-neutral-900">카카오로 시작하기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">마이</Text>
      </View>

      <ScrollView contentContainerClassName="gap-5 p-5">
        <View className="gap-4 rounded-lg border border-neutral-200 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#256EF4]/15">
              <Text className="text-lg font-semibold text-[#256EF4]">{user.name.charAt(0)}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold text-neutral-900">{user.name}</Text>
              <Text className="text-xs text-neutral-500">
                {user.age > 0 ? `${user.age}세 · ` : ''}
                {genderLabel} · {profileRegionLabel}
              </Text>
              <View className="mt-0.5 flex-row gap-1.5">
                <Tag label={roomTypeLabel} />
                {verified ? <Tag label="학교/회사 인증" tone="emerald" /> : null}
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <View>
              <Text className="text-sm font-medium text-neutral-800">프로필 공개</Text>
              <Text className="text-xs text-neutral-400">룸메이트 매칭 탭에 노출 중이에요</Text>
            </View>
            <Switch checked={profileVisible} onChange={setProfileVisible} />
          </View>
        </View>

        <Section title="매칭 설정">
          {matchingRows.map((row, index) => (
            <MenuRow key={row.label} row={row} last={index === matchingRows.length - 1} />
          ))}
        </Section>

        <Section title="계정">
          {accountRows.slice(0, 1).map((row) => (
            <MenuRow key={row.label} row={row} />
          ))}
          <View className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
              <Ionicons name="notifications-outline" size={18} color="#525252" />
            </View>
            <Text className="flex-1 text-sm text-neutral-800">알림</Text>
            <Switch checked={notificationEnabled} onChange={setNotificationEnabled} />
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
    <View className="gap-2">
      <Text className="text-xs font-semibold text-neutral-400">{title}</Text>
      <View className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {children}
      </View>
    </View>
  );
}

function MenuRow({ row, last }: { row: MyPageMenuRow; last?: boolean }) {
  return (
    <Pressable
      onPress={row.onPress}
      className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-50 ${
        last ? '' : 'border-b border-neutral-100'
      }`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
        <Ionicons name={row.icon} size={18} color="#525252" />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-neutral-800">{row.label}</Text>
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

function Switch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <Toggle checked={checked} onCheckedChange={onChange}>
      {({ checked: isChecked }) => (
        <View
          className={`h-7 w-12 justify-center rounded-full px-1 ${
            isChecked ? 'bg-[#256EF4]' : 'bg-neutral-300'
          }`}
        >
          <View className={`h-5 w-5 rounded-full bg-white ${isChecked ? 'ml-5' : 'ml-0'}`} />
        </View>
      )}
    </Toggle>
  );
}

function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'emerald' }) {
  const bgClass = tone === 'emerald' ? 'bg-emerald-50' : 'bg-neutral-100';
  const textClass = tone === 'emerald' ? 'text-emerald-700' : 'text-neutral-500';
  return (
    <View className={`rounded px-2 py-0.5 ${bgClass}`}>
      <Text className={`text-[10px] ${textClass}`}>{label}</Text>
    </View>
  );
}
