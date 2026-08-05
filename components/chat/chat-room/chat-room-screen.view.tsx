import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  ReadyChatBubble,
  ReadyChatComposer,
  ReadyChatDateDivider,
  ReadyChatRestrictionBanner,
  ReadyChatSystemNotice,
} from '@/components/ui/ready-to-dev-chat';
import {
  ReadyActionSheet,
  ReadyBadge,
  ReadyProfileAvatar,
} from '@/components/ui/ready-to-dev-components';
import { formatKstTime, isSameKstDay, kstClock } from '@/lib/api';
import type { ChatRoom as DomainChatRoom, UserSummary } from '@/lib/domain';

import type { ChatRoomBubble, UseChatRoomScreenReturn } from './use-chat-room-screen';

export type ChatRoomScreenViewProps = Omit<UseChatRoomScreenReturn, 'room'> & {
  room: DomainChatRoom;
};

export function ChatRoomScreenView({
  room,
  scrollRef,
  requestSheetVisible,
  messages,
  draft,
  setDraft,
  canSend,
  socketStatus,
  socketError,
  uploadingImage,
  processingRequest,
  inputBottomPadding,
  modalBottomPadding,
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
}: ChatRoomScreenViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ChatHeader peer={room.peer} matched={room.matched} onBack={onBack} onLeave={onLeave} />

      <RequestStatusBanner
        matched={room.matched}
        request={room.roommateRequest}
        processing={processingRequest}
        onOpenRequestSheet={openRequestSheet}
      />

      {socketStatus !== 'connected' ? (
        <View className="flex-row items-center justify-center gap-2 bg-[#F6F6FA] px-4 py-2">
          {socketStatus === 'connecting' ? (
            <ActivityIndicator size="small" color="#696976" />
          ) : null}
          <Text className="text-xs text-[#696976]">
            {socketError ?? '채팅 서버에 연결하는 중이에요'}
          </Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-white"
        contentContainerClassName="gap-5 px-4 py-3"
      >
        <MessageList messages={messages} peer={room.peer} />
        <RoommateRequestCard
          request={room.roommateRequest}
          peerName={room.peer.name}
          processing={processingRequest}
          onAccept={acceptRequest}
          onReject={rejectRequest}
          onCancel={cancelRequest}
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
        peerName={room.peer.name}
        onClose={closeRequestSheet}
        onConfirm={confirmRequest}
        bottomPadding={modalBottomPadding}
      />
    </KeyboardAvoidingView>
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
        <MessageList messages={messages} peer={peer} />
      </ScrollView>
      <ReadyChatComposer value="" disabled placeholder="차단한 사용자에요" />
    </View>
  );
}

function MessageList({ messages, peer }: { messages: ChatRoomBubble[]; peer: UserSummary }) {
  return (
    <>
      {messages.map((message, index) => {
        const previous = index > 0 ? messages[index - 1] : null;
        const showDateDivider = !previous || !isSameKstDay(previous.sentAt, message.sentAt);
        return (
          <View key={message.id} className="gap-5">
            {showDateDivider ? <ReadyChatDateDivider label={fmtDate(message.sentAt)} /> : null}
            {message.kind === 'system' ? (
              <ReadyChatSystemNotice label={message.body} />
            ) : (
              <ReadyChatBubble
                mine={message.mine}
                body={message.body}
                imageUrl={message.kind === 'image' ? message.imageUrl : undefined}
                timeLabel={fmtTime(message.sentAt)}
                peerName={peer.name}
                peerImageUrl={peer.avatarUrl}
              />
            )}
          </View>
        );
      })}
    </>
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
  const genderSymbol = peer.gender === 'female' ? '♀' : peer.gender === 'male' ? '♂' : '';
  const genderLabel = peer.gender === 'female' ? '여성' : peer.gender === 'male' ? '남성' : '';
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
          {peer.age > 0 ? (
            <ReadyBadge
              label={`${genderSymbol} ${peer.age}세${genderLabel ? `·${genderLabel}` : ''}`.trim()}
              tone="red"
            />
          ) : null}
          {matched ? (
            <ReadyBadge label="룸메이트" tone="neutral" />
          ) : peer.compatibilityScore != null ? (
            <ReadyBadge label={`궁합 ${peer.compatibilityScore}점`} tone="blue" />
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
  onOpenRequestSheet,
}: {
  matched: boolean;
  request: DomainChatRoom['roommateRequest'];
  processing: boolean;
  onOpenRequestSheet: () => void;
}) {
  if (matched || request?.status === 'ACCEPTED') return null;
  if (request?.status === 'PENDING' && request.role === 'requestee') return null;

  if (request?.status === 'PENDING') {
    return (
      <Banner title="룸메이트를 요청했어요" subtitle="상대방이 수락하면 룸메이트가 될 수 있어요" />
    );
  }

  if (request?.status === 'EXPIRED') {
    return (
      <Banner
        title="상대방이 다른 분과 룸메이트가 되었어요"
        subtitle="나와 잘 맞는 다른 룸메이트를 찾아보세요"
      />
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
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3 bg-[#ECF2FE] px-4 py-3.5">
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-bold leading-[22px] text-[#17171B]">{title}</Text>
        <Text className="text-xs leading-[18px] text-[#696976]">{subtitle}</Text>
      </View>
      {action}
    </View>
  );
}

function RoommateRequestCard({
  request,
  peerName,
  processing,
  onAccept,
  onReject,
  onCancel,
}: {
  request: DomainChatRoom['roommateRequest'];
  peerName: string;
  processing: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}) {
  if (!request) return null;
  if (request.status === 'EXPIRED') return null;

  const incoming = request.role === 'requestee';
  const title = incoming ? `${peerName}님이 룸메이트를 요청했어요!` : '룸메이트를 요청했어요!';

  return (
    <View className="mb-1 overflow-hidden rounded-xl border border-[#4C87F6] bg-white">
      <View className="bg-[#4C87F6] px-4 py-2">
        <Text className="text-[13px] font-bold text-white">룸메이트 요청</Text>
      </View>
      <View className="gap-3 px-4 pb-4 pt-3">
        <View className="gap-1">
          <Text className="text-[15px] font-bold leading-[23px] text-[#17171B]">{title}</Text>
          <Text className="text-[11px] leading-4 text-[#AAAABA]">
            *채팅방 생성 시점의 궁합 점수로,{'\n'}이후 프로필 변경으로 실제 궁합과 달라질 수 있어요
          </Text>
        </View>

        {request.status === 'PENDING' && incoming ? (
          <View className="flex-row gap-2">
            <Pressable
              onPress={onReject}
              disabled={processing}
              accessibilityRole="button"
              accessibilityLabel="룸메이트 요청 거절하기"
              className={`h-10 flex-1 items-center justify-center rounded-lg bg-[#F6F6FA] ${
                processing ? 'opacity-50' : 'active:opacity-85'
              }`}
            >
              <Text className="text-sm font-semibold text-[#696976]">거절하기</Text>
            </Pressable>
            <Pressable
              onPress={onAccept}
              disabled={processing}
              accessibilityRole="button"
              accessibilityLabel="룸메이트 요청 수락하기"
              className={`h-10 flex-1 items-center justify-center rounded-lg bg-[#256EF4] ${
                processing ? 'opacity-50' : 'active:opacity-90'
              }`}
            >
              <Text className="text-sm font-semibold text-white">수락하기</Text>
            </Pressable>
          </View>
        ) : null}

        {request.status === 'PENDING' && !incoming ? (
          <Pressable
            onPress={onCancel}
            disabled={processing || request.role === 'unknown'}
            accessibilityRole="button"
            accessibilityLabel="룸메이트 요청 취소하기"
            className={`h-10 items-center justify-center rounded-lg bg-[#F6F6FA] ${
              processing ? 'opacity-50' : 'active:opacity-85'
            }`}
          >
            <Text className="text-sm font-semibold text-[#696976]">요청 취소하기</Text>
          </Pressable>
        ) : null}

        {request.status === 'ACCEPTED' ? (
          <View className="items-center rounded-lg bg-[#ECF2FE] py-2.5">
            <Text className="text-sm font-semibold text-[#256EF4]">요청을 수락했어요</Text>
          </View>
        ) : null}

        {request.status === 'REJECTED' ? (
          <View className="items-center rounded-lg bg-[#FDEFEC] py-2.5">
            <Text className="text-sm font-semibold text-[#DE3412]">
              {incoming ? '요청을 거절했어요' : '상대방이 요청을 거절했어요'}
            </Text>
          </View>
        ) : null}

        {request.status === 'CANCELED' ? (
          <View className="items-center rounded-lg bg-[#F6F6FA] py-2.5">
            <Text className="text-sm font-semibold text-[#696976]">룸메이트 요청을 취소했어요</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RoommateRequestModal({
  visible,
  peerName,
  onClose,
  onConfirm,
  bottomPadding,
}: {
  visible: boolean;
  peerName: string;
  onClose: () => void;
  onConfirm: () => void;
  bottomPadding: number;
}) {
  return (
    <ReadyActionSheet open={visible} onOpenChange={(open) => !open && onClose()}>
      <View className="gap-5" style={{ paddingBottom: Math.max(0, bottomPadding - 20) }}>
        <View className="gap-2">
          <Text className="text-lg font-bold text-[#17171B]">룸메이트를 요청할까요?</Text>
          <Text className="text-sm leading-5 text-[#696976]">
            {peerName}님에게 룸메이트 요청을 보내요. 상대방이 수락하면 룸메이트가 될 수 있어요.
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="요청 취소"
            className="h-12 flex-1 items-center justify-center rounded-lg bg-[#F1F1F6] active:opacity-85"
          >
            <Text className="text-sm font-semibold text-[#696976]">취소</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="룸메이트 요청 보내기"
            className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
          >
            <Text className="text-sm font-semibold text-white">요청하기</Text>
          </Pressable>
        </View>
      </View>
    </ReadyActionSheet>
  );
}

function fmtTime(d: Date): string {
  return formatKstTime(d);
}

function fmtDate(d: Date): string {
  const { year, month, day } = kstClock(d);
  return `${year}년 ${month}월 ${day}일`;
}
