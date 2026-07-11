import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ReportListItem, UseBlockedListScreenReturn } from './use-blocked-list-screen';

export type BlockedListScreenViewProps = UseBlockedListScreenReturn;

export function BlockedListScreenView({
  users,
  reports,
  loading,
  error,
  onBack,
  onUnblock,
}: BlockedListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">차단 / 신고 관리</Text>
      </View>

      <ScrollView contentContainerClassName="gap-6 p-5">
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            차단한 사용자 ({users.length})
          </Text>
          {loading ? (
            <View className="items-center gap-3 p-8">
              <ActivityIndicator color="#256EF4" />
              <Text className="text-sm text-neutral-400">차단 목록을 불러오는 중...</Text>
            </View>
          ) : error ? (
            <EmptyBox message={`차단 목록을 불러오지 못했어요: ${error}`} />
          ) : users.length === 0 ? (
            <EmptyBox message="차단한 사용자가 없어요" />
          ) : (
            users.map((user) => (
              <View
                key={user.id}
                className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <Text className="font-semibold text-neutral-600">{user.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-neutral-900">{user.name}</Text>
                    <Text className="text-xs text-neutral-500">차단일 {user.dateLabel}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => onUnblock(user)}
                  className="rounded-full bg-neutral-100 px-3 py-1.5"
                >
                  <Text className="text-xs font-medium text-neutral-700">해제</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            신고 기록 ({reports.length})
          </Text>
          {reports.length === 0 ? (
            <EmptyBox message="신고 기록이 없어요" />
          ) : (
            reports.map((report) => <ReportCard key={report.id} report={report} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-neutral-200 p-8">
      <Text className="text-center text-sm text-neutral-400">{message}</Text>
    </View>
  );
}

function ReportCard({ report }: { report: ReportListItem }) {
  const toneClass =
    report.statusTone === 'done'
      ? 'bg-emerald-50 text-emerald-700'
      : report.statusTone === 'reviewing'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-neutral-100 text-neutral-500';

  return (
    <View className="gap-1 rounded-2xl border border-neutral-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-neutral-900">{report.title}</Text>
        <Text className={`rounded-full px-2 py-0.5 text-[10px] ${toneClass}`}>
          {report.statusLabel}
        </Text>
      </View>
      <Text className="text-xs text-neutral-600">사유: {report.reason}</Text>
      <Text className="text-[10px] text-neutral-400">{report.dateLabel}</Text>
    </View>
  );
}
