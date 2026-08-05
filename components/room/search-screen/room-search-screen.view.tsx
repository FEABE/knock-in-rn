import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReadySearchHeader } from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';

import { SearchLoadingDots } from './search-loading-dots';
import { SearchResultCard } from './search-result-card';
import type { UseRoomSearchScreenReturn } from './use-room-search-screen';

export type RoomSearchScreenViewProps = UseRoomSearchScreenReturn;

export function RoomSearchScreenView({
  query,
  submittedQuery,
  phase,
  results,
  resultsError,
  retryResults,
  recent,
  popular,
  popularLoading,
  popularError,
  retryPopular,
  setQuery,
  clearQuery,
  clearRecent,
  removeRecent,
  submit,
  onCancel,
  onResultPress,
  onResultLikeChange,
}: RoomSearchScreenViewProps) {
  const popularSection = (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[17px] font-bold text-[#17171B]">인기 검색어</Text>
        <Text className="text-[15px] text-[#696976]">전체 유저 기반</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {popularLoading ? (
          <ReadyLoadingState label="인기 검색어를 불러오는 중..." compact className="w-full" />
        ) : popularError ? (
          <ReadyErrorState
            title="인기 검색어를 불러오지 못했어요"
            description={popularError}
            onRetry={retryPopular}
            compact
            className="w-full"
          />
        ) : popular.length === 0 ? (
          <Text className="text-sm text-[#AAAABA]">아직 인기 검색어가 없어요</Text>
        ) : (
          popular.map((term) => (
            <Pressable
              key={term}
              onPress={() => submit(term)}
              className="rounded-full bg-[#E9F0FE] px-3 py-1.5 active:opacity-80"
            >
              <Text className="text-[15px] text-[#256EF4]">{term}</Text>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <ReadySearchHeader
        value={query}
        onChangeText={setQuery}
        onSubmit={() => submit(query)}
        onBack={onCancel}
        onCancel={onCancel}
        onClear={clearQuery}
        autoFocus
      />

      {phase === 'loading' ? (
        <View className="flex-1 items-center justify-center pb-24">
          <SearchLoadingDots />
        </View>
      ) : phase === 'error' ? (
        <ReadyErrorState
          title="검색 결과를 불러오지 못했어요"
          description={resultsError ?? undefined}
          onRetry={retryResults}
        />
      ) : phase === 'empty' ? (
        <ReadyEmptyState title="검색 결과가 없어요" description="다른 키워드로 검색해보세요" />
      ) : phase === 'results' ? (
        <ScrollView
          contentContainerClassName="gap-5 px-4 pb-24 pt-2"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {results.map((post) => (
            <SearchResultCard
              key={post.id}
              post={post}
              keyword={submittedQuery ?? ''}
              onPress={onResultPress}
              onLikeChange={onResultLikeChange}
            />
          ))}
        </ScrollView>
      ) : recent.length === 0 ? (
        <View className="flex-1 px-4 pb-24 pt-2">
          <ReadyEmptyState
            title="최근 검색어가 없어요"
            description="원하는 지역이나 동을 검색해 보세요"
            className="flex-1"
          />
          {popular.length > 0 ? popularSection : null}
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-8 px-4 pb-24 pt-2"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[17px] font-bold text-[#17171B]">최근 검색어</Text>
              <Pressable onPress={clearRecent} hitSlop={6}>
                <Text className="text-[15px] text-[#696976]">전체삭제</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {recent.map((term) => (
                <View
                  key={term}
                  className="h-8 flex-row items-center rounded-full border border-[#DADAE8] px-3"
                >
                  <Pressable onPress={() => submit(term)}>
                    <Text className="text-[15px] text-[#696976]">{term}</Text>
                  </Pressable>
                  <Pressable onPress={() => removeRecent(term)} hitSlop={6} className="ml-1">
                    <Ionicons name="close" size={14} color="#AAAABA" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {popularSection}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
