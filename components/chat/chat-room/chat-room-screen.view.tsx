import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

import { GenderAgeChip } from '@/components/ui/gender-age-chip';
import {
  ReadyChatBubble,
  ReadyChatComposer,
  ReadyChatDateDivider,
  ReadyChatRestrictionBanner,
  ReadyChatSystemNotice,
} from '@/components/ui/ready-to-dev-chat';
import {
  ReadyBadge,
  ReadyChatStatusBadge,
  ReadyProfileAvatar,
} from '@/components/ui/ready-to-dev-components';
import { formatKstTime, isSameKstDay, kstClock, type ChatSocketStatus } from '@/lib/api';
import type { ChatRoom as DomainChatRoom, UserSummary } from '@/lib/domain';

import { ChatImageViewer } from './chat-image-viewer';
import type {
  ChatRoomBubble,
  ChatTimelineItem,
  UseChatRoomScreenReturn,
} from './use-chat-room-screen';

export type ChatRoomScreenViewProps = Omit<UseChatRoomScreenReturn, 'room'> & {
  room: DomainChatRoom;
};

export function ChatRoomScreenView({
  room,
  scrollRef,
  requestSheetVisible,
  timeline,
  draft,
  setDraft,
  canSend,
  selfHasRoommate,
  socketStatus,
  socketError,
  retrySocket,
  uploadingImage,
  processingRequest,
  inputBottomPadding,
  onBack,
  onLeave,
  openRequestSheet,
  closeRequestSheet,
  confirmRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  sendMessage,
  pickAndSendImage,
  imageViewer,
  openImageViewer,
  closeImageViewer,
}: ChatRoomScreenViewProps) {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  return (
    <>
      <Animated.View className="flex-1 bg-white" style={keyboardAvoidingStyle}>
        <ChatHeader peer={room.peer} matched={room.matched} onBack={onBack} onLeave={onLeave} />

        <RequestStatusBanner
          matched={room.matched}
          request={room.roommateRequest}
          processing={processingRequest}
          selfHasRoommate={selfHasRoommate}
          opponentHasRoommate={room.opponentHasRoommate}
          onOpenRequestSheet={openRequestSheet}
        />

        <SocketStatusBanner status={socketStatus} error={socketError} onRetry={retrySocket} />

        <ScrollView
          ref={scrollRef}
          className="flex-1 bg-white"
          contentContainerClassName="gap-5 px-4 py-3"
        >
          <TimelineList
            timeline={timeline}
            peer={room.peer}
            onPressImage={openImageViewer}
            card={{
              request: room.roommateRequest,
              peer: room.peer,
              processing: processingRequest,
              selfHasRoommate,
              opponentHasRoommate: room.opponentHasRoommate,
              onAccept: acceptRequest,
              onReject: rejectRequest,
              onCancel: cancelRequest,
            }}
          />
        </ScrollView>

        <ReadyChatComposer
          value={draft}
          onChangeText={setDraft}
          onAdd={pickAndSendImage}
          onSend={sendMessage}
          sendDisabled={!canSend}
          uploading={uploadingImage}
          bottomPadding={inputBottomPadding}
        />

        <RoommateRequestModal
          visible={requestSheetVisible}
          processing={processingRequest}
          onClose={closeRequestSheet}
          onConfirm={confirmRequest}
        />
      </Animated.View>

      {/* 열 때마다 새로 마운트해 translateY/closingRef/Modal 인스턴스를 초기 상태로 되돌린다.
          (항상 마운트해 두면 스와이프로 닫은 뒤 stale 애니메이션 값이 남아 두 번째 열기가 깨진다.) */}
      {imageViewer ? (
        <ChatImageViewer
          visible
          imageUrl={imageViewer.imageUrl}
          title={imageViewer.title}
          onClose={closeImageViewer}
        />
      ) : null}
    </>
  );
}

export function ChatRoomBlockedView({
  peer,
  messages = [],
  onBack,
}: {
  peer: UserSummary;
  messages?: ChatRoomBubble[];
  onBack: () => void;
}) {
  return (
    <View className="flex-1 bg-white">
      <ChatHeader peer={peer} matched={false} onBack={onBack} onLeave={onBack} />
      <ReadyChatRestrictionBanner kind="blocked" />
      <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-5 px-4 py-3">
        <TimelineList
          timeline={messages.map((message) => ({
            kind: 'message',
            message,
            at: message.sentAt,
          }))}
          peer={peer}
        />
      </ScrollView>
      <ReadyChatComposer value="" disabled placeholder="차단한 사용자에요" />
    </View>
  );
}

function SocketStatusBanner({
  status,
  error,
  onRetry,
}: {
  status: ChatSocketStatus;
  error: string | null;
  onRetry: () => void;
}) {
  if (status === 'connected') return null;

  return (
    <View className="flex-row items-center justify-center gap-2 bg-[#F6F6FA] px-4 py-2">
      {status === 'connecting' ? <ActivityIndicator size="small" color="#696976" /> : null}
      <Text className="text-xs text-[#696976]">{error ?? '채팅 서버에 연결하는 중이에요'}</Text>
      {status === 'error' ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="채팅 서버에 다시 연결하기"
          className="h-7 justify-center rounded-md bg-[#256EF4] px-3 active:opacity-90"
        >
          <Text className="text-xs font-bold text-white">다시 연결</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TimelineList({
  timeline,
  peer,
  card,
  onPressImage,
}: {
  timeline: ChatTimelineItem[];
  peer: UserSummary;
  card?: RoommateRequestCardProps;
  onPressImage?: (message: ChatRoomBubble) => void;
}) {
  return (
    <>
      {timeline.map((item, index) => {
        const previous = index > 0 ? timeline[index - 1] : null;
        const showDateDivider = !previous || !isSameKstDay(previous.at, item.at);
        return (
          <View key={timelineKey(item)} className="gap-5">
            {showDateDivider ? <ReadyChatDateDivider label={fmtDate(item.at)} /> : null}
            {item.kind === 'message' ? (
              <MessageItem message={item.message} peer={peer} onPressImage={onPressImage} />
            ) : null}
            {item.kind === 'request-card' && card ? <RoommateRequestCard {...card} /> : null}
            {item.kind === 'matched-pill' ? <MatchedPill /> : null}
          </View>
        );
      })}
    </>
  );
}

function timelineKey(item: ChatTimelineItem): string {
  return item.kind === 'message' ? `message-${item.message.id}` : item.kind;
}

function MessageItem({
  message,
  peer,
  onPressImage,
}: {
  message: ChatRoomBubble;
  peer: UserSummary;
  onPressImage?: (message: ChatRoomBubble) => void;
}) {
  if (message.kind === 'system') return <ReadyChatSystemNotice label={message.body} />;
  const imageUrl = message.kind === 'image' ? message.imageUrl : undefined;
  return (
    <ReadyChatBubble
      mine={message.mine}
      body={message.body}
      imageUrl={imageUrl}
      onPressImage={imageUrl && onPressImage ? () => onPressImage(message) : undefined}
      timeLabel={fmtTime(message.sentAt)}
      peerName={peer.name}
      peerImageUrl={peer.avatarUrl}
    />
  );
}

/** 요청이 수락되어 매칭이 성사된 시점에 대화 흐름 가운데 남는 칩. */
function MatchedPill() {
  return (
    <View className="items-center">
      <View className="rounded-full bg-[#ECF2FE] px-5 py-1">
        <Text className="text-[13px] font-medium text-[#4C87F6]">룸메이트가 되었어요</Text>
      </View>
    </View>
  );
}

function ChatHeader({
  peer,
  matched,
  onBack,
  onLeave,
}: {
  peer: UserSummary;
  matched: boolean;
  onBack: () => void;
  onLeave: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2 border-b border-[#F1F1F6] px-3 pb-2.5 pt-1">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        className="h-10 w-8 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="#17171B" />
      </Pressable>
      <ReadyProfileAvatar name={peer.name} imageUrl={peer.avatarUrl} size={48} />
      <View className="flex-1 gap-1 pl-1">
        <Text className="text-base font-bold text-[#17171B]" numberOfLines={1}>
          {peer.name}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <GenderAgeChip age={peer.age} gender={peer.gender} />
          {matched ? (
            <ReadyChatStatusBadge status="roommate" />
          ) : peer.compatibilityScore != null ? (
            <ReadyBadge
              label={`궁합 ${peer.compatibilityScore}점`}
              tone="blue"
              className="h-[22px] py-0"
            />
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={onLeave}
        accessibilityRole="button"
        accessibilityLabel="채팅방 메뉴"
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#17171B" />
      </Pressable>
    </View>
  );
}

function RequestStatusBanner({
  matched,
  request,
  processing,
  selfHasRoommate,
  opponentHasRoommate,
  onOpenRequestSheet,
}: {
  matched: boolean;
  request: DomainChatRoom['roommateRequest'];
  processing: boolean;
  selfHasRoommate: boolean;
  opponentHasRoommate: boolean;
  onOpenRequestSheet: () => void;
}) {
  if (matched || request?.status === 'ACCEPTED') return null;

  // 한쪽이 이미 매칭된 방에서는 요청 CTA 자체를 없애 서버가 막을 요청을 미리 차단한다.
  if (selfHasRoommate) {
    return (
      <Banner
        tone="red"
        title="이미 다른 분과 룸메이트가 되었어요"
        subtitle="나와 잘 맞는 다른 룸메이트를 찾아보세요"
      />
    );
  }

  if (opponentHasRoommate) {
    return (
      <Banner
        tone="red"
        title="상대방이 다른 분과 룸메이트가 되었어요"
        subtitle="나와 잘 맞는 다른 룸메이트를 찾아보세요"
      />
    );
  }

  if (request?.status === 'PENDING') {
    if (request.role === 'requestee') return null;
    return (
      <Banner title="룸메이트를 요청했어요" subtitle="상대방이 수락하면 룸메이트가 될 수 있어요" />
    );
  }

  return (
    <Banner
      title="룸메이트를 요청할까요?"
      subtitle="대화가 잘 통했다면 룸메이트를 요청해보세요"
      action={
        <Pressable
          onPress={onOpenRequestSheet}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel="룸메이트 요청하기"
          className={`h-9 justify-center rounded-lg bg-[#256EF4] px-4 ${
            processing ? 'opacity-50' : 'active:opacity-90'
          }`}
        >
          <Text className="text-[13px] font-bold text-white">요청하기</Text>
        </Pressable>
      }
    />
  );
}

function Banner({
  title,
  subtitle,
  action,
  tone = 'blue',
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  tone?: 'blue' | 'red';
}) {
  const red = tone === 'red';
  return (
    <View
      className={`flex-row items-center gap-3 ${
        red ? 'bg-[#FBEFF0] px-[18px] py-3' : 'bg-[#ECF2FE] px-4 py-3.5'
      }`}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-[15px] font-bold leading-[22px] ${red ? 'text-[#D63D4A]' : 'text-[#17171B]'}`}
        >
          {title}
        </Text>
        <Text className={`leading-[18px] text-[#696976] ${red ? 'text-[13px]' : 'text-xs'}`}>
          {subtitle}
        </Text>
      </View>
      {action}
    </View>
  );
}

type RoommateRequestCardProps = {
  request: DomainChatRoom['roommateRequest'];
  peer: UserSummary;
  processing: boolean;
  /** 내가 이미 다른 사람과 매칭된 상태 — 받은 요청을 수락할 수 없다. */
  selfHasRoommate: boolean;
  /** 상대가 이미 다른 사람과 매칭된 상태 — 보낸 요청은 성사될 수 없다. */
  opponentHasRoommate: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
};

function RoommateRequestCard({ request, peer, ...actions }: RoommateRequestCardProps) {
  if (!request) return null;

  const incoming = request.role === 'requestee';
  const title = incoming ? `${peer.name}님이 룸메이트를 요청했어요!` : '룸메이트를 요청했어요!';

  return (
    <View className={incoming ? 'flex-row items-start gap-2' : 'items-end'}>
      {incoming ? (
        <ReadyProfileAvatar name={peer.name} imageUrl={peer.avatarUrl} size={42} />
      ) : null}
      <View
        className={`w-[278px] max-w-full shrink overflow-hidden rounded-bl-lg rounded-br-lg border border-[#DADAE8] bg-white ${
          incoming ? 'rounded-tl-none rounded-tr-lg' : 'rounded-tl-lg rounded-tr-none'
        }`}
      >
        <View className="bg-[#4C87F6] px-4 py-1.5">
          <Text className="text-[13px] font-medium text-white">룸메이트 요청</Text>
        </View>
        <View className="gap-3 px-4 pb-3 pt-3">
          <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">{title}</Text>
          <View className="gap-1.5">
            <Text className="text-xs leading-[18px] text-[#696976]">
              *채팅방 생성 시점의 궁합 점수로,
            </Text>
            <Text className="text-xs leading-[18px] text-[#696976]">
              이후 프로필 변경으로 실제 궁합과 달라질 수 있어요
            </Text>
          </View>
          <RequestCardFooter request={request} incoming={incoming} {...actions} />
        </View>
      </View>
    </View>
  );
}

function RequestCardFooter({
  request,
  incoming,
  processing,
  selfHasRoommate,
  opponentHasRoommate,
  onAccept,
  onReject,
  onCancel,
}: Omit<RoommateRequestCardProps, 'request' | 'peer'> & {
  request: NonNullable<DomainChatRoom['roommateRequest']>;
  incoming: boolean;
}) {
  if (request.status === 'PENDING') {
    if (incoming) {
      if (selfHasRoommate)
        return <CardStatusRow tone="warn" label="매칭 후에는 수락할 수 없어요" />;
      // 상대가 먼저 매칭되면 수락은 서버에서 409로 막힌다. 눌러도 아무 일도 일어나지 않는
      // 버튼을 남기지 말고 이유를 그대로 보여준다.
      if (opponentHasRoommate)
        return <CardStatusRow tone="warn" label="상대방이 매칭된 상태에요" />;
      return (
        <View className="flex-row gap-3">
          <CardButton
            label="거절하기"
            tone="neutral"
            fill
            disabled={processing}
            onPress={onReject}
            accessibilityLabel="룸메이트 요청 거절하기"
          />
          <CardButton
            label="수락하기"
            tone="primary"
            fill
            disabled={processing}
            onPress={onAccept}
            accessibilityLabel="룸메이트 요청 수락하기"
          />
        </View>
      );
    }
    if (opponentHasRoommate) return <CardStatusRow tone="warn" label="상대방이 매칭된 상태에요" />;
    return (
      <CardButton
        label="요청 취소하기"
        tone="neutral"
        disabled={processing || request.role === 'unknown'}
        onPress={onCancel}
        accessibilityLabel="룸메이트 요청 취소하기"
      />
    );
  }

  if (request.status === 'ACCEPTED')
    return <CardStatusRow tone="accent" label="요청을 수락했어요" />;
  if (request.status === 'REJECTED') {
    return (
      <CardStatusRow
        tone="neutral"
        label={incoming ? '요청을 거절했어요' : '상대방이 요청을 거절했어요'}
      />
    );
  }
  if (request.status === 'CANCELED')
    return <CardStatusRow tone="neutral" label="요청을 취소했어요" />;
  return null;
}

const CARD_ROW_CLASS = 'h-10 items-center justify-center rounded-[6.5px]';

function CardStatusRow({ tone, label }: { tone: 'warn' | 'accent' | 'neutral'; label: string }) {
  const box =
    tone === 'warn'
      ? 'bg-[#FDEFEC]'
      : tone === 'accent'
        ? 'bg-[#ECF2FE]'
        : 'border border-[#DADAE8] bg-white';
  const text =
    tone === 'warn' ? 'text-[#DE3412]' : tone === 'accent' ? 'text-[#4C87F6]' : 'text-[#AAAABA]';
  return (
    <View className={`${CARD_ROW_CLASS} ${box}`}>
      <Text className={`text-sm font-bold ${text}`}>{label}</Text>
    </View>
  );
}

function CardButton({
  label,
  tone,
  fill,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  tone: 'primary' | 'neutral';
  fill?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const primary = tone === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`${CARD_ROW_CLASS} ${fill ? 'flex-1' : ''} ${
        primary ? 'bg-[#4C87F6]' : 'border border-[#DADAE8] bg-white'
      } ${disabled ? 'opacity-50' : 'active:opacity-85'}`}
    >
      <Text className={`text-sm font-bold ${primary ? 'text-white' : 'text-[#AAAABA]'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function RoommateRequestModal({
  visible,
  processing,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const close = () => {
    if (!processing) onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <Pressable
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="룸메이트 요청 모달 닫기"
        className="flex-1 items-center justify-center bg-[#17171B]/40"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="h-[153px] w-[286px] items-center justify-center rounded-[10px] bg-white p-5"
        >
          <View className="items-center gap-2">
            <Text className="text-center text-[18px] font-bold leading-[27px] text-[#2D2D2D]">
              룸메이트를 요청할까요?
            </Text>
            <Text className="text-center text-[14px] leading-[21px] text-[#42454A]">
              상대가 수락하면 룸메이트가 돼요
            </Text>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={close}
              disabled={processing}
              accessibilityRole="button"
              accessibilityLabel="룸메이트 요청 취소"
              className="h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#ECECF3]"
            >
              <Text className="text-[15px] font-bold text-[#AAAABA]">취소</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={processing}
              accessibilityRole="button"
              accessibilityLabel="룸메이트 요청 보내기"
              className={`h-11 w-[112px] items-center justify-center rounded-[7px] bg-[#256EF4] ${
                processing ? 'opacity-60' : 'active:opacity-85'
              }`}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-[15px] font-bold text-white">요청하기</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function fmtTime(d: Date): string {
  return formatKstTime(d);
}

function fmtDate(d: Date): string {
  const { year, month, day } = kstClock(d);
  return `${year}년 ${month}월 ${day}일`;
}
