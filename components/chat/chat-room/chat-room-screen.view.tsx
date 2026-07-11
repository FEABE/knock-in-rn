import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { TextField } from '@/components/ui/headless';
import type { ChatRoom as DomainChatRoom, UserSummary } from '@/lib/domain';

import type { UseChatRoomScreenReturn } from './use-chat-room-screen';

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
      className="flex-1"
    >
      <ChatHeader peer={room.peer} matched={room.matched} onBack={onBack} onLeave={onLeave} />

      <RequestBanner
        matched={room.matched}
        request={room.roommateRequest}
        processing={processingRequest}
        onOpenRequestSheet={openRequestSheet}
        onAccept={acceptRequest}
        onReject={rejectRequest}
        onCancel={cancelRequest}
      />

      {socketStatus !== 'connected' ? (
        <View className="flex-row items-center justify-center gap-2 bg-neutral-100 px-4 py-2">
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
        className="flex-1 bg-neutral-50"
        contentContainerClassName="gap-2 px-4 py-4"
      >
        {messages.map((message) => {
          if (message.kind === 'system') {
            return (
              <View key={message.id} className="my-2 items-center">
                <Text className="rounded-full bg-neutral-200 px-3 py-1 text-[10px] text-neutral-600">
                  {message.body}
                </Text>
              </View>
            );
          }

          return (
            <View key={message.id} className={message.mine ? 'items-end' : 'items-start'}>
              <View className="max-w-[80%] flex-row items-end gap-1">
                {!message.mine ? <AvatarInitial name={room.peer.name} size="sm" /> : null}
                <View className="gap-0.5">
                  {message.kind === 'image' && message.imageUrl ? (
                    <Image
                      source={{ uri: message.imageUrl }}
                      style={{ width: 210, height: 210, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      className={`rounded-2xl px-3 py-2 ${
                        message.mine ? 'bg-[#256EF4]' : 'border border-neutral-200 bg-white'
                      }`}
                    >
                      <Text
                        className={message.mine ? 'text-sm text-white' : 'text-sm text-neutral-800'}
                      >
                        {message.body}
                      </Text>
                    </View>
                  )}
                  <Text
                    className={`text-[10px] text-neutral-400 ${
                      message.mine ? 'text-right' : 'text-left'
                    }`}
                  >
                    {fmtTime(message.sentAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <MessageInput
        draft={draft}
        setDraft={setDraft}
        canSend={canSend}
        uploadingImage={uploadingImage}
        onAdd={pickAndSendImage}
        onSend={sendMessage}
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

export function ChatRoomBlockedView({ peer, onBack }: { peer: UserSummary; onBack: () => void }) {
  return (
    <View className="flex-1 bg-white">
      <ChatHeader peer={peer} matched={false} onBack={onBack} onLeave={onBack} />
      <View className="flex-1 items-center justify-center gap-3 p-10">
        <Text className="text-base text-neutral-500">차단한 사용자에요</Text>
        <Text className="text-center text-xs leading-5 text-neutral-400">
          메시지 전송이 제한돼요. 마이페이지에서 차단 해제할 수 있어요.
        </Text>
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
    <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404040" />
      </Pressable>
      <AvatarInitial name={peer.name} />
      <View className="flex-1 flex-row items-center gap-2">
        <Text className="text-base font-semibold text-neutral-900">{peer.name}</Text>
        {peer.age > 0 ? (
          <Text className="text-xs text-neutral-400">
            {peer.age}세 ·{' '}
            {peer.gender === 'female' ? '여성' : peer.gender === 'male' ? '남성' : '기타'}
          </Text>
        ) : null}
        {matched ? (
          <View className="rounded bg-emerald-50 px-1.5 py-0.5">
            <Text className="text-[10px] text-emerald-700">룸메이트 확정</Text>
          </View>
        ) : (
          <View className="rounded bg-[#256EF4]/10 px-1.5 py-0.5">
            <Text className="text-[10px] text-[#256EF4]">
              {peer.compatibilityScore != null ? `궁합 ${peer.compatibilityScore}점` : '매칭 대화'}
            </Text>
          </View>
        )}
      </View>
      <Pressable onPress={onLeave} className="h-9 w-9 items-center justify-center">
        <Ionicons name="ellipsis-horizontal" size={20} color="#A3A3A3" />
      </Pressable>
    </View>
  );
}

function RequestBanner({
  matched,
  request,
  processing,
  onOpenRequestSheet,
  onAccept,
  onReject,
  onCancel,
}: {
  matched: boolean;
  request: DomainChatRoom['roommateRequest'];
  processing: boolean;
  onOpenRequestSheet: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}) {
  if (matched) {
    return (
      <View className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <Text className="text-sm font-medium text-emerald-700">룸메이트가 확정되었어요</Text>
        <Text className="mt-0.5 text-xs text-emerald-600">함께하는 새로운 시작을 응원해요.</Text>
      </View>
    );
  }

  if (request?.status === 'PENDING' && request.role === 'requestee') {
    return (
      <View className="flex-row items-center gap-3 border-b border-[#256EF4]/15 bg-[#256EF4]/10 px-4 py-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-[#256EF4]">룸메이트 요청이 도착했어요</Text>
          <Text className="text-xs text-[#256EF4]">수락하면 룸메이트 매칭이 완료돼요</Text>
        </View>
        <Pressable
          onPress={onReject}
          disabled={processing}
          className="rounded-full border border-[#256EF4] px-3 py-2"
        >
          <Text className="text-xs font-semibold text-[#256EF4]">거절</Text>
        </Pressable>
        <Pressable
          onPress={onAccept}
          disabled={processing}
          className="rounded-full bg-[#256EF4] px-3 py-2"
        >
          <Text className="text-xs font-semibold text-white">수락</Text>
        </Pressable>
      </View>
    );
  }

  if (request?.status === 'PENDING') {
    return (
      <View className="flex-row items-center gap-3 border-b border-[#256EF4]/15 bg-[#256EF4]/10 px-4 py-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-[#256EF4]">룸메이트 요청을 보냈어요</Text>
          <Text className="text-xs text-[#256EF4]">상대가 수락하면 매칭이 완료돼요</Text>
        </View>
        <Pressable
          onPress={onCancel}
          disabled={processing || request.role === 'unknown'}
          className="rounded-full border border-[#256EF4] px-3 py-2"
        >
          <Text className="text-xs font-semibold text-[#256EF4]">요청 취소</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3 border-b border-[#256EF4]/15 bg-[#256EF4]/10 px-4 py-3">
      <View className="flex-1">
        <Text className="text-sm font-medium text-[#256EF4]">룸메이트로 확정할까요?</Text>
        <Text className="text-xs text-[#256EF4]">대화가 잘 됐다면 매칭을 완료해보세요</Text>
      </View>
      <Pressable
        onPress={onOpenRequestSheet}
        className="rounded-full bg-[#256EF4] px-4 py-2 active:opacity-90"
      >
        <Text className="text-xs font-semibold text-white">룸메이트 제안</Text>
      </Pressable>
    </View>
  );
}

function MessageInput({
  draft,
  setDraft,
  canSend,
  onSend,
  onAdd,
  uploadingImage,
  bottomPadding,
}: {
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  onSend: () => void;
  onAdd: () => void;
  uploadingImage: boolean;
  bottomPadding: number;
}) {
  return (
    <View
      className="flex-row items-center gap-2 border-t border-neutral-100 bg-white px-3 py-2"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onAdd}
        disabled={uploadingImage}
        className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100"
      >
        {uploadingImage ? (
          <ActivityIndicator size="small" color="#737373" />
        ) : (
          <Ionicons name="add" size={20} color="#737373" />
        )}
      </Pressable>
      <TextField
        value={draft}
        onChangeValue={setDraft}
        placeholder="메시지 보내기"
        multiline
        className="max-h-24 min-h-10 flex-1 rounded-2xl bg-neutral-100 px-4 py-2 text-sm"
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        className={`h-10 w-10 items-center justify-center rounded-full ${
          canSend ? 'bg-[#256EF4]' : 'bg-neutral-200'
        }`}
      >
        <Ionicons name="send" size={16} color={canSend ? '#ffffff' : '#A3A3A3'} />
      </Pressable>
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
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="gap-5 rounded-t-2xl bg-white p-5" style={{ paddingBottom: bottomPadding }}>
          <View className="gap-2">
            <Text className="text-lg font-bold text-neutral-900">룸메이트 제안 보내기</Text>
            <Text className="text-sm leading-5 text-neutral-500">
              {peerName}님에게 룸메이트 제안을 보낼까요? 상대가 수락하면 매칭 상태로 변경돼요.
            </Text>
          </View>

          <View className="gap-2 rounded-lg bg-[#256EF4]/10 p-4">
            <Text className="text-sm font-semibold text-[#256EF4]">제안 후 상태</Text>
            <Text className="text-xs leading-5 text-[#256EF4]/80">
              채팅 상단에 요청 대기 배너가 표시되고, 상대가 수락하면 매칭 상태로 변경돼요.
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={onClose}
              className="h-12 flex-1 items-center justify-center rounded-lg bg-neutral-100"
            >
              <Text className="text-sm font-semibold text-neutral-700">취소</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4]"
            >
              <Text className="text-sm font-semibold text-white">제안 보내기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AvatarInitial({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const className =
    size === 'sm'
      ? 'h-7 w-7 items-center justify-center self-start rounded-full bg-[#256EF4]/15'
      : 'h-8 w-8 items-center justify-center rounded-full bg-[#256EF4]/15';

  return (
    <View className={className}>
      <Text className="text-xs font-semibold text-[#256EF4]">{name.charAt(0)}</Text>
    </View>
  );
}

function fmtTime(d: Date): string {
  const h = d.getHours();
  const ampm = h < 12 ? '오전' : '오후';
  const hh = h % 12 || 12;
  return `${ampm} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`;
}
