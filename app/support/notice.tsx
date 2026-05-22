import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { NOTICES } from '@/lib/domain';

export default function NoticeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <SupportHeader title="공지사항" />
      <ScrollView contentContainerClassName="gap-3 p-5">
        {NOTICES.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">
              등록된 공지가 없어요
            </Text>
          </View>
        ) : (
          NOTICES.map((n) => (
            <View
              key={n.id}
              className="gap-2 rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <Text className="text-base font-semibold text-neutral-900">
                {n.title}
              </Text>
              <Text className="text-xs text-neutral-400">
                {fmtDate(n.createdAt)}
              </Text>
              <Text className="text-sm leading-6 text-neutral-700">
                {n.body}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
