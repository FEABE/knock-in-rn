import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tabs } from '@/components/ui/headless';

const INITIAL_RECENT = [
  '마포구 원룸',
  '서대문구 즉시입주',
  '신촌 쉐어하우스',
  '홍대 비흡연',
  '강남역 오피스텔',
  '연남동 빌라 여성만',
  '풀옵션 투룸',
];

const POPULAR = [
  '즉시입주',
  '마포구 원룸',
  '서대문구',
  '쉐어하우스',
  '풀옵션',
  '비흡연',
  '여성만',
  '홍대 근처',
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => [t, ...prev.filter((r) => r !== t)].slice(0, 20));
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
          <Text className="text-base text-neutral-400">⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submit(query)}
            placeholder="게시글 제목, 위치, 룸 형태 검색"
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            className="flex-1 text-sm text-neutral-900"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={6}>
              <Text className="text-base text-neutral-400">×</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={6}>
          <Text className="text-sm text-neutral-600">취소</Text>
        </Pressable>
      </View>

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'rooms', label: '방 게시글' },
            { value: 'roommates', label: '룸메이트 매칭' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="py-3">
              {({ selected }) => (
                <View
                  className={`border-b-2 pb-2 pr-6 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-base font-semibold text-[#256EF4]'
                        : 'text-base text-neutral-400'
                    }
                  >
                    {t.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="rooms" className="flex-1">
          <ScrollView contentContainerClassName="gap-7 p-5 pb-24">
            <Section
              title="최근 검색어"
              action={
                recent.length > 0 ? (
                  <Pressable onPress={() => setRecent([])} hitSlop={6}>
                    <Text className="text-xs text-neutral-400">전체 삭제</Text>
                  </Pressable>
                ) : null
              }
            >
              {recent.length === 0 ? (
                <Text className="text-sm text-neutral-400">
                  최근 검색어가 없어요
                </Text>
              ) : (
                <View>
                  {recent.map((term) => (
                    <View
                      key={term}
                      className="flex-row items-center justify-between py-2.5"
                    >
                      <Pressable
                        onPress={() => submit(term)}
                        className="flex-1 flex-row items-center gap-3"
                      >
                        <Text className="text-base text-neutral-400">⏱</Text>
                        <Text className="text-sm text-neutral-800">{term}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setRecent((prev) => prev.filter((r) => r !== term))
                        }
                        hitSlop={8}
                      >
                        <Text className="text-base text-neutral-400">×</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            <Section
              title="인기 검색어"
              action={
                <Text className="text-xs text-neutral-400">전체 유저 기반</Text>
              }
            >
              <View className="flex-row flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => submit(term)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 active:opacity-80"
                  >
                    <Text className="text-xs text-neutral-700">{term}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <View className="items-center justify-center p-10">
            <Text className="text-sm text-neutral-400">
              룸메이트 매칭 검색
            </Text>
          </View>
        </Tabs.Content>
      </Tabs.Root>
    </SafeAreaView>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-800">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}
