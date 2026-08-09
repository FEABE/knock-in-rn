import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 합의서·캘린더 제외로 임시 미사용 — 복원 시 주석 해제
// import { TextField } from '@/components/ui/headless';
import { ReadyConfirmDialog } from '@/components/ui/ready-to-dev-feedback';
// import type { CalendarDayItem } from '@/lib/api';

import type { useRoommateManagementScreen } from './use-roommate-management-screen';

type Props = ReturnType<typeof useRoommateManagementScreen>;

export function RoommateManagementScreenView(props: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center px-2">
        <Pressable onPress={props.onBack} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-semibold text-[#17171B]">
          내 룸메이트
        </Text>
        <View className="w-10" />
      </View>

      {props.loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">룸메이트 정보를 불러오는 중이에요</Text>
        </View>
      ) : props.error ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-base font-semibold text-neutral-800">
            룸메이트 정보를 불러오지 못했어요
          </Text>
          <Text className="text-center text-sm text-red-500">{props.error}</Text>
        </View>
      ) : !props.roommate?.myRoommateInfo ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-4xl">🏠</Text>
          <Text className="text-base font-semibold text-neutral-800">연결된 룸메이트가 없어요</Text>
          <Text className="text-center text-sm text-neutral-400">
            채팅방에서 룸메이트 요청이 수락되면 여기에 표시돼요.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-6 px-4 pb-14">
          <View className="flex-row items-center gap-4 rounded-2xl bg-[#F6F6FA] p-4">
            {props.roommate.myRoommateInfo.memberProfileImageUrl ? (
              <Image
                source={{ uri: props.roommate.myRoommateInfo.memberProfileImageUrl }}
                style={{ width: 62, height: 62, borderRadius: 31 }}
              />
            ) : (
              <View className="h-[62px] w-[62px] items-center justify-center rounded-full bg-[#E4E4EC]">
                <Text className="text-xl font-bold text-[#696976]">
                  {(props.roommate.myRoommateInfo.memberName ?? '룸').charAt(0)}
                </Text>
              </View>
            )}
            <View className="flex-1 gap-1">
              <Text className="text-lg font-bold text-[#17171B]">
                {props.roommate.myRoommateInfo.memberName}
              </Text>
              <Text className="text-sm text-[#696976]">
                {props.roommate.myRoommateInfo.memberAge
                  ? `${props.roommate.myRoommateInfo.memberAge}세 · `
                  : ''}
                궁합 {props.roommate.score ?? '-'}점
              </Text>
            </View>
            <Pressable onPress={props.openChat} className="rounded-full bg-white p-3">
              <Ionicons name="chatbubble-outline" size={20} color="#256EF4" />
            </Pressable>
          </View>

          {/* 합의서·캘린더는 1차 릴리스에서 제외. 복원 시 이 주석을 해제.
              <Pressable
                onPress={props.openAgreement}
                className="flex-row items-center rounded-2xl border border-[#E4E4EC] p-4"
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Ionicons name="document-text-outline" size={20} color="#256EF4" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#17171B]">공동생활 합의서</Text>
                  <Text className="text-xs text-[#AAAABA]">
                    청소·소음·공과금 규칙을 함께 정해요
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#AAAABA" />
              </Pressable>

              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Pressable onPress={props.previousMonth} hitSlop={10}>
                    <Ionicons name="chevron-back" size={22} color="#696976" />
                  </Pressable>
                  <Text className="text-lg font-bold text-[#17171B]">
                    {props.month.getFullYear()}년 {props.month.getMonth() + 1}월
                  </Text>
                  <Pressable onPress={props.nextMonth} hitSlop={10}>
                    <Ionicons name="chevron-forward" size={22} color="#696976" />
                  </Pressable>
                </View>
                <CalendarGrid
                  month={props.month}
                  selectedDate={props.selectedDate}
                  days={props.monthDays}
                  onSelect={props.selectDate}
                />
              </View>

              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-[#17171B]">
                    {props.selectedDate} 일정
                  </Text>
                  <Pressable
                    onPress={props.openCreate}
                    className="rounded-full bg-[#256EF4] px-3 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-white">+ 일정 추가</Text>
                  </Pressable>
                </View>
                {props.dayLoading ? (
                  <ActivityIndicator color="#256EF4" />
                ) : props.events.length ? (
                  props.events.map((event) => (
                    <EventCard
                      key={event.calendarBasicInfo?.calendarId}
                      event={event}
                      onEdit={() => props.openEdit(event)}
                      onDelete={() => props.removeEvent(event.calendarBasicInfo?.calendarId)}
                    />
                  ))
                ) : (
                  <View className="rounded-2xl border border-dashed border-[#E4E4EC] p-6">
                    <Text className="text-center text-sm text-[#AAAABA]">등록된 일정이 없어요</Text>
                  </View>
                )}
              </View>

              {props.editor ? (
                <View className="gap-4 rounded-2xl border border-[#D9DAE5] p-4">
                  <Text className="text-base font-bold text-[#17171B]">
                    {props.editor.calendarId ? '일정 수정' : '새 일정'}
                  </Text>
                  <TextField
                    value={props.editor.title}
                    onChangeValue={(title) => props.updateEditor({ title })}
                    placeholder="일정 제목"
                    className="rounded-xl border border-[#D9DAE5] px-4 py-3"
                  />
                  <TextField
                    value={props.editor.contents}
                    onChangeValue={(contents) => props.updateEditor({ contents })}
                    placeholder="일정 내용을 입력해주세요"
                    multiline
                    className="min-h-20 rounded-xl border border-[#D9DAE5] px-4 py-3"
                  />
                  <View className="flex-row flex-wrap gap-2">
                    {props.categories.map((category) => (
                      <Pressable
                        key={category}
                        onPress={() => props.updateEditor({ categoryName: category })}
                        className={`rounded-full px-3 py-2 ${
                          props.editor?.categoryName === category ? 'bg-[#256EF4]' : 'bg-[#F1F1F5]'
                        }`}
                      >
                        <Text
                          className={
                            props.editor?.categoryName === category
                              ? 'text-xs font-semibold text-white'
                              : 'text-xs text-[#696976]'
                          }
                        >
                          {category}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View className="flex-row gap-3">
                    <TextField
                      value={props.editor.startHour}
                      onChangeValue={(startHour) => props.updateEditor({ startHour })}
                      placeholder="09:00"
                      className="flex-1 rounded-xl border border-[#D9DAE5] px-4 py-3"
                    />
                    <TextField
                      value={props.editor.endHour}
                      onChangeValue={(endHour) => props.updateEditor({ endHour })}
                      placeholder="10:00"
                      className="flex-1 rounded-xl border border-[#D9DAE5] px-4 py-3"
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={props.closeEditor}
                      className="flex-1 items-center rounded-xl border border-[#D9DAE5] py-3"
                    >
                      <Text className="font-semibold text-[#696976]">취소</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void props.save()}
                      disabled={props.saving}
                      className="flex-1 items-center rounded-xl bg-[#256EF4] py-3"
                    >
                      <Text className="font-semibold text-white">저장</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
          */}

          <Pressable
            onPress={props.disconnect}
            disabled={props.saving}
            className="items-center rounded-xl border border-rose-200 py-3"
          >
            <Text className="text-sm font-semibold text-rose-500">룸메이트 연결 해제</Text>
          </Pressable>
        </ScrollView>
      )}

      <ReadyConfirmDialog
        open={props.disconnectConfirmOpen}
        title="룸메이트 연결을 해제할까요?"
        description={'합의서와 캘린더를 더 이상\n함께 사용할 수 없어요'}
        cancelLabel="취소"
        confirmLabel="해제"
        destructive
        processing={props.saving}
        onCancel={props.cancelDisconnect}
        onConfirm={props.confirmDisconnect}
      />
    </SafeAreaView>
  );
}

/* 합의서·캘린더는 1차 릴리스에서 제외. 복원 시 이 주석을 해제.
function CalendarGrid({
  month,
  selectedDate,
  days,
  onSelect,
}: {
  month: Date;
  selectedDate: string;
  days: { targetDate?: string; exists?: boolean }[];
  onSelect: (date: string) => void;
}) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells = [...Array.from({ length: firstDay }, () => null), ...days];
  return (
    <View className="flex-row flex-wrap">
      {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
        <Text key={day} className="w-[14.285%] pb-2 text-center text-xs text-[#AAAABA]">
          {day}
        </Text>
      ))}
      {cells.map((day, index) =>
        day?.targetDate ? (
          <Pressable
            key={day.targetDate}
            onPress={() => onSelect(day.targetDate!)}
            className="h-12 w-[14.285%] items-center justify-center"
          >
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                selectedDate === day.targetDate ? 'bg-[#256EF4]' : ''
              }`}
            >
              <Text
                className={
                  selectedDate === day.targetDate
                    ? 'text-sm font-semibold text-white'
                    : 'text-sm text-[#404047]'
                }
              >
                {Number(day.targetDate.slice(-2))}
              </Text>
            </View>
            {day.exists ? <View className="h-1 w-1 rounded-full bg-[#256EF4]" /> : null}
          </Pressable>
        ) : (
          <View key={`empty-${index}`} className="h-12 w-[14.285%]" />
        ),
      )}
    </View>
  );
}

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarDayItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const info = event.calendarBasicInfo;
  return (
    <View className="gap-2 rounded-2xl bg-[#F6F6FA] p-4">
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-sm font-bold text-[#17171B]">{info?.title}</Text>
          <Text className="text-xs text-[#696976]">
            {info?.categoryName} · {info?.startDate?.slice(11, 16)}–{info?.endDate?.slice(11, 16)}
          </Text>
        </View>
        {info?.canEdit ? (
          <>
            <Pressable onPress={onEdit} className="p-2">
              <Ionicons name="pencil-outline" size={17} color="#696976" />
            </Pressable>
            <Pressable onPress={onDelete} className="p-2">
              <Ionicons name="trash-outline" size={17} color="#E11D48" />
            </Pressable>
          </>
        ) : null}
      </View>
      <Text className="text-sm text-[#696976]">{info?.contents}</Text>
      <Text className="text-xs text-[#AAAABA]">
        담당{' '}
        {event.calendarMembers
          ?.map((member) => member.name)
          .filter(Boolean)
          .join(', ')}
      </Text>
    </View>
  );
}
*/
