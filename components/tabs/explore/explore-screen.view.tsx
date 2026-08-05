import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { RoomListControls } from '@/components/domain/room-list-controls';
import {
  BudgetFilterSheet,
  GenderFilterSheet,
  RegionFilterSheet,
  RoomTypeFilterSheet,
  SortFilterSheet,
} from '@/components/room/filters';
import { Tabs } from '@/components/ui/headless';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';
import type { RoommateMatchCardModel } from '@/lib/api';
import type { RoomPost } from '@/lib/domain';

import {
  EXPLORE_SORT_OPTIONS,
  INITIAL_EXPLORE_FILTER,
  type UseExploreScreenReturn,
} from './use-explore-screen';

const EXPLORE_TABS = [
  { value: 'rooms', label: '룸메 구해요' },
  { value: 'roommates', label: '룸메 찾아요' },
];

/** 로딩/에러일 때 리스트를 감추기 위한 공유 빈 배열(매 렌더 새 배열 생성 방지). */
const EMPTY_ROOM_POSTS: RoomPost[] = [];
const EMPTY_MATCHES: RoommateMatchCardModel[] = [];

const roomKeyExtractor = (post: RoomPost) => post.id;
const matchKeyExtractor = (match: RoommateMatchCardModel) => match.id;

/** 기존 contentContainer의 gap-5 / gap-4 를 대체한다(가상화 스페이서에 gap이 먹는 문제 회피). */
function RoomListSeparator() {
  return <View className="h-5" />;
}

function MatchListSeparator() {
  return <View className="h-4" />;
}

export type ExploreScreenViewProps = UseExploreScreenReturn;

export function ExploreScreenView({
  sort,
  filter,
  searchQuery,
  activeTab,
  setActiveTab,
  openSheet,
  visiblePosts,
  visibleMatches,
  roomsLoading,
  roomsError,
  matchesLoading,
  matchesError,
  hasUnreadAlarms,
  preferenceNudgeOpen,
  preferenceNudgeSnooze,
  reloadRooms,
  reloadMatches,
  setSort,
  setOpenSheet,
  handleFilterChange,
  onSearchPress,
  onSearchClear,
  onNotificationPress,
  setPreferenceNudgeSnooze,
  onPreferenceNudgeClose,
  onPreferenceSetupPress,
  onCreatePress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: ExploreScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header hasUnread={hasUnreadAlarms} onNotificationPress={onNotificationPress} />

      <Tabs.Root
        value={activeTab}
        onValueChange={(next) => setActiveTab(next === 'roommates' ? 'roommates' : 'rooms')}
        className="flex-1"
      >
        <Tabs.List className="flex-row border-b border-[#DADAE8]">
          {EXPLORE_TABS.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1">
              {({ selected }) => (
                <View
                  className={`-mb-px items-center border-b-2 pb-3 pt-1 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-base font-semibold text-[#17171B]'
                        : 'text-base font-medium text-[#AAAABA]'
                    }
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="rooms" className="flex-1">
          <RoomListControls
            filter={filter}
            initialFilter={INITIAL_EXPLORE_FILTER}
            sortLabel={
              EXPLORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '정렬'
            }
            searchQuery={searchQuery}
            onSearchPress={onSearchPress}
            onSearchClear={onSearchClear}
            onSortPress={() => setOpenSheet('sort')}
            onFilterPress={setOpenSheet}
          />

          <FlatList
            className="flex-1"
            contentContainerClassName="px-4 pb-24"
            data={roomsLoading || roomsError ? EMPTY_ROOM_POSTS : visiblePosts}
            keyExtractor={roomKeyExtractor}
            renderItem={({ item }) => (
              <RoomCard post={item} onPress={onRoomPress} onLikeChange={onRoomLikeChange} />
            )}
            ItemSeparatorComponent={RoomListSeparator}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={7}
            ListEmptyComponent={
              roomsLoading ? (
                <ReadyLoadingState compact label="방을 불러오는 중..." />
              ) : roomsError ? (
                <ReadyErrorState
                  compact
                  title="방 목록을 불러오지 못했어요"
                  description={roomsError}
                  onRetry={reloadRooms}
                />
              ) : (
                <ReadyEmptyState
                  compact
                  title={searchQuery ? '검색 결과가 없어요' : '조건에 맞는 방이 없어요'}
                  description={
                    searchQuery ? '다른 키워드로 검색해보세요' : '다른 조건으로 다시 찾아보세요'
                  }
                />
              )
            }
          />

          <Pressable
            onPress={onCreatePress}
            accessibilityRole="button"
            accessibilityLabel="룸메이트 게시글 등록"
            className="absolute bottom-5 right-4 h-11 w-11 items-center justify-center rounded-full bg-[#256EF4] shadow-md active:opacity-90"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <FlatList
            className="flex-1 bg-[#F7F8FC]"
            contentContainerClassName="px-4 pb-24 pt-5"
            data={matchesLoading || matchesError ? EMPTY_MATCHES : visibleMatches}
            keyExtractor={matchKeyExtractor}
            renderItem={({ item }) => (
              <RoommateFindCard
                match={item}
                onPress={onRoommatePress}
                onLikeChange={onRoommateLikeChange}
              />
            )}
            ItemSeparatorComponent={MatchListSeparator}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={7}
            ListEmptyComponent={
              matchesLoading ? (
                <ReadyLoadingState compact label="룸메이트를 불러오는 중..." />
              ) : matchesError ? (
                <ReadyErrorState
                  compact
                  title="룸메이트 목록을 불러오지 못했어요"
                  description={matchesError}
                  onRetry={reloadMatches}
                />
              ) : (
                <ReadyEmptyState
                  compact
                  title="매칭된 룸메이트가 없어요"
                  description="다른 조건으로 다시 찾아보세요"
                />
              )
            }
          />
        </Tabs.Content>
      </Tabs.Root>

      <SortFilterSheet
        open={openSheet === 'sort'}
        onOpenChange={(open) => setOpenSheet(open ? 'sort' : null)}
        value={sort}
        onChange={setSort}
      />
      <RegionFilterSheet
        open={openSheet === 'region'}
        onOpenChange={(open) => setOpenSheet(open ? 'region' : null)}
        value={filter.regions}
        onChange={(regions) => handleFilterChange({ ...filter, regions })}
      />
      <GenderFilterSheet
        open={openSheet === 'gender'}
        onOpenChange={(open) => setOpenSheet(open ? 'gender' : null)}
        value={filter.gender}
        onChange={(gender) => handleFilterChange({ ...filter, gender })}
      />
      <BudgetFilterSheet
        open={openSheet === 'budget'}
        onOpenChange={(open) => setOpenSheet(open ? 'budget' : null)}
        value={{
          depositMin: filter.depositMin,
          depositMax: filter.depositMax,
          rentMin: filter.rentMin,
          rentMax: filter.rentMax,
        }}
        onChange={(budget) => handleFilterChange({ ...filter, ...budget })}
      />
      <RoomTypeFilterSheet
        open={openSheet === 'roomType'}
        onOpenChange={(open) => setOpenSheet(open ? 'roomType' : null)}
        value={filter.roomTypes}
        onChange={(roomTypes) => handleFilterChange({ ...filter, roomTypes })}
      />

      <PreferenceNudgeModal
        open={preferenceNudgeOpen}
        snooze={preferenceNudgeSnooze}
        onSnoozeChange={setPreferenceNudgeSnooze}
        onClose={onPreferenceNudgeClose}
        onSetup={onPreferenceSetupPress}
      />
    </SafeAreaView>
  );
}

function PreferenceNudgeModal({
  open,
  snooze,
  onSnoozeChange,
  onClose,
  onSetup,
}: {
  open: boolean;
  snooze: boolean;
  onSnoozeChange: (next: boolean) => void;
  onClose: () => void;
  onSetup: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-[#17171B]/40">
        <View className="rounded-t-[20px] bg-white px-[26px] pb-5 pt-5">
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            className="self-end"
          >
            <Ionicons name="close" size={26} color="#696976" />
          </Pressable>

          <View className="items-center">
            <View className="h-[114px] w-[125px] items-center justify-end overflow-hidden pt-2.5">
              <Image
                source={require('../../../assets/images/figma-ready/preference-nudge.png')}
                contentFit="fill"
                style={{ width: 125, height: 118 }}
              />
            </View>
            <Text className="mt-2 text-center text-lg font-bold leading-[27px] text-[#17171B]">
              <Text className="text-[#256EF4]">더 잘 맞는 룸메이트</Text>를{`\n`}놓치고 있을지도
              몰라요!
            </Text>
            <Text className="mt-3 text-center text-sm leading-[21px] text-[#696976]">
              룸메 조건을 설정하면{' '}
              <Text className="font-semibold text-[#256EF4]">궁합 점수가 더 정확해져요</Text>
            </Text>
          </View>

          <Pressable
            onPress={onSetup}
            className="mt-5 h-12 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-85"
          >
            <Text className="text-[15px] font-bold text-white">룸메이트 조건 설정하기</Text>
          </Pressable>

          <Pressable
            onPress={() => onSnoozeChange(!snooze)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: snooze }}
            className="mt-4 flex-row items-center gap-2 self-start"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded ${
                snooze ? 'bg-[#256EF4]' : 'border border-[#DADAE8] bg-white'
              }`}
            >
              {snooze ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
            </View>
            <Text className="text-xs font-medium leading-[19px] text-[#AAAABA]">
              일주일동안 보지 않기
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Header({
  hasUnread,
  onNotificationPress,
}: {
  hasUnread: boolean;
  onNotificationPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-6 pt-7">
      <Text className="text-xl font-bold leading-6 text-[#256EF4]" style={{ letterSpacing: 3.2 }}>
        KNOCKIN
      </Text>
      <Pressable
        onPress={onNotificationPress}
        hitSlop={6}
        className="h-9 w-9 items-center justify-center"
      >
        <Ionicons name="notifications-outline" size={24} color="#696976" />
        {hasUnread ? (
          <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-white bg-[#256EF4]" />
        ) : null}
      </Pressable>
    </View>
  );
}
