import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/ui/headless';

import type { UseRoomSearchScreenReturn } from './use-room-search-screen';

export type RoomSearchScreenViewProps = UseRoomSearchScreenReturn;

export function RoomSearchScreenView({
  query,
  recent,
  popular,
  popularError,
  setQuery,
  clearQuery,
  clearRecent,
  removeRecent,
  submit,
  onCancel,
}: RoomSearchScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="h-8 flex-1 flex-row items-center gap-1 rounded border border-[#ECECF3] bg-[#F6F6FA] px-2">
          <Ionicons name="search-outline" size={16} color="#AAAABA" />
          <TextField
            value={query}
            onChangeValue={setQuery}
            onSubmitEditing={() => submit(query)}
            placeholder="검색"
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            className="flex-1 text-sm text-neutral-900"
          />
          {query.length > 0 ? (
            <Pressable onPress={clearQuery} hitSlop={6}>
              <Ionicons name="close" size={16} color="#AAAABA" />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onCancel} hitSlop={6}>
          <Text className="text-[15px] text-[#696976]">취소</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="gap-8 px-4 pb-24 pt-2"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-[#17171B]">최근 검색어</Text>
            {recent.length > 0 ? (
              <Pressable onPress={clearRecent} hitSlop={6}>
                <Text className="text-[15px] text-[#696976]">전체삭제</Text>
              </Pressable>
            ) : null}
          </View>
          {recent.length === 0 ? (
            <Text className="text-sm text-[#AAAABA]">최근 검색어가 없어요</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {recent.map((term) => (
                <View
                  key={term}
                  className="h-8 flex-row items-center rounded-full border border-[#AAAABA] px-3"
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
          )}
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-[#17171B]">인기 검색어</Text>
            <Text className="text-[15px] text-[#696976]">전체 사용자 기준</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {popularError ? (
              <Text className="text-sm text-[#AAAABA]">인기 검색어를 불러오지 못했어요</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
