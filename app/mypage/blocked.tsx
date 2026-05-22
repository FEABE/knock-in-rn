import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_USERS, useModeration } from '@/lib/domain';

export default function BlockedListScreen() {
  const router = useRouter();
  const { blockedUserIds, unblockUser, reports } = useModeration();
  const blocked = Array.from(blockedUserIds);
  const users = blocked
    .map((id) => MOCK_USERS.find((u) => u.id === id))
    .filter(Boolean) as (typeof MOCK_USERS)[number][];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">
          차단 / 신고 관리
        </Text>
      </View>

      <ScrollView contentContainerClassName="gap-6 p-5">
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            차단한 사용자 ({users.length})
          </Text>
          {users.length === 0 ? (
            <View className="rounded-2xl border border-dashed border-neutral-200 p-8">
              <Text className="text-center text-sm text-neutral-400">
                차단한 사용자가 없어요
              </Text>
            </View>
          ) : (
            users.map((u) => (
              <View
                key={u.id}
                className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <Text className="font-semibold text-neutral-600">
                      {u.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-neutral-900">
                      {u.name}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {u.region.city} {u.region.district}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    Alert.alert('차단 해제', `${u.name}님을 차단 해제할까요?`, [
                      { text: '취소', style: 'cancel' },
                      { text: '해제', onPress: () => unblockUser(u.id) },
                    ])
                  }
                  className="rounded-full bg-neutral-100 px-3 py-1.5"
                >
                  <Text className="text-xs font-medium text-neutral-700">
                    해제
                  </Text>
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
            <View className="rounded-2xl border border-dashed border-neutral-200 p-8">
              <Text className="text-center text-sm text-neutral-400">
                신고 기록이 없어요
              </Text>
            </View>
          ) : (
            reports.map((r, idx) => (
              <View
                key={`${r.kind}-${r.id}-${idx}`}
                className="gap-1 rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-neutral-900">
                    {r.kind === 'post' ? '게시글 신고' : '사용자 신고'}
                  </Text>
                  <Text
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      r.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : r.status === 'reviewing'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {r.status === 'resolved'
                      ? '처리 완료'
                      : r.status === 'reviewing'
                        ? '검토 중'
                        : '접수'}
                  </Text>
                </View>
                <Text className="text-xs text-neutral-600">
                  사유: {r.reason}
                </Text>
                <Text className="text-[10px] text-neutral-400">
                  {fmtDate(r.createdAt)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
