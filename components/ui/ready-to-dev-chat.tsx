import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';
import { ReadyStatusBanner } from '@/components/ui/ready-to-dev-feedback';

export function ReadyChatDateDivider({ label }: { label: string }) {
  return (
    <View className="items-center py-3">
      <Text className="text-xs leading-[18px] text-[#696976]">{label}</Text>
    </View>
  );
}

export function ReadyChatBubble({
  mine,
  body,
  timeLabel,
  peerName,
  peerImageUrl,
  children,
}: {
  mine: boolean;
  body?: string;
  timeLabel?: string;
  peerName?: string;
  peerImageUrl?: string;
  children?: ReactNode;
}) {
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <View className={`max-w-[92%] flex-row items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
        {!mine ? (
          <ReadyProfileAvatar name={peerName || '상대방'} imageUrl={peerImageUrl} size={42} />
        ) : null}
        <View className={`max-w-[82%] flex-row items-end gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}>
          <View
            className={`rounded-b-lg px-3 py-2 ${
              mine ? 'rounded-tl-lg bg-[#4C87F6]' : 'rounded-tr-lg bg-[#ECECF3]'
            }`}
          >
            {children ?? (
              <Text className={`text-sm leading-[21px] ${mine ? 'text-white' : 'text-[#17171B]'}`}>
                {body}
              </Text>
            )}
          </View>
          {timeLabel ? <Text className="text-[11px] text-[#AAAABA]">{timeLabel}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function ReadyChatRestrictionBanner({
  kind,
  onUnblock,
}: {
  kind: 'blocked' | 'unavailable';
  onUnblock?: () => void;
}) {
  if (kind === 'unavailable') {
    return (
      <ReadyStatusBanner
        title="대화할 수 없는 사용자에요"
        description="상대방의 계정 상태로 인해 메시지를 보낼 수 없어요"
        tone="neutral"
      />
    );
  }

  return (
    <ReadyStatusBanner
      title="차단한 사용자에요"
      description="차단을 해제하면 다시 대화할 수 있어요"
      tone="danger"
      actionLabel={onUnblock ? '차단 해제' : undefined}
      onAction={onUnblock}
    />
  );
}

export function ReadyChatComposer({
  value,
  onChangeText,
  onAdd,
  onSend,
  disabled = false,
  placeholder = '메세지 보내기',
}: {
  value: string;
  onChangeText?: (value: string) => void;
  onAdd?: () => void;
  onSend?: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const canSend = value.trim().length > 0 && !disabled;
  return (
    <View className="flex-row items-end gap-2 border-t border-[#ECECF3] bg-white px-4 py-3">
      <Pressable
        onPress={onAdd}
        disabled={disabled || !onAdd}
        accessibilityRole="button"
        accessibilityLabel="사진 추가"
        className="h-9 w-9 items-center justify-center rounded-full border border-[#DADAE8]"
      >
        <Ionicons name="add" size={22} color={disabled ? '#DADAE8' : '#696976'} />
      </Pressable>
      <View className="min-h-9 flex-1 flex-row items-end rounded-lg bg-[#F6F6FA] px-3 py-2">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAABA"
          editable={!disabled}
          multiline
          maxLength={1000}
          className="max-h-24 flex-1 p-0 text-sm leading-[20px] text-[#17171B]"
        />
      </View>
      <Pressable
        onPress={onSend}
        disabled={!canSend || !onSend}
        accessibilityRole="button"
        accessibilityLabel="메시지 전송"
        className={`h-9 w-9 items-center justify-center rounded-full ${
          canSend ? 'bg-[#256EF4]' : 'bg-[#ECECF3]'
        }`}
      >
        <Ionicons name="arrow-up" size={18} color={canSend ? '#FFFFFF' : '#AAAABA'} />
      </Pressable>
    </View>
  );
}

export function ReadyMatchRequestCard({
  state,
  peerName,
  score,
  processing = false,
  onRequest,
  onAccept,
  onReject,
  onCancel,
}: {
  state: 'idle' | 'incoming' | 'outgoing' | 'accepted' | 'failed' | 'rejected';
  peerName: string;
  score?: number;
  processing?: boolean;
  onRequest?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}) {
  const content = {
    idle: {
      title: '룸메이트를 요청할까요?',
      description: '대화가 잘 통했다면 룸메이트를 요청해보세요',
    },
    incoming: {
      title: `${peerName}님이 룸메이트를 요청했어요!`,
      description: `채팅방 생성 시점의 궁합 점수${score != null ? ` ${score}점` : ''}으로 안내해요`,
    },
    outgoing: {
      title: '룸메이트를 요청했어요',
      description: '상대방이 수락하면 룸메이트가 될 수 있어요',
    },
    accepted: {
      title: '룸메이트가 되었어요 🎉',
      description: '함께하는 새로운 시작을 응원해요',
    },
    failed: {
      title: '상대방이 다른 분과 룸메이트가 되었어요',
      description: '나와 잘 맞는 다른 룸메이트를 찾아보세요',
    },
    rejected: {
      title: '요청을 거절했어요',
      description: '거절 후에도 채팅은 계속할 수 있어요',
    },
  }[state];

  return (
    <View className="gap-3 border-b-[6px] border-[#F6F6FA] bg-white px-4 py-4">
      {state === 'incoming' || state === 'outgoing' ? (
        <Text className="text-xs font-semibold text-[#256EF4]">룸메이트 요청</Text>
      ) : null}
      <View className="gap-1">
        <Text className="text-[15px] font-bold leading-[23px] text-[#17171B]">{content.title}</Text>
        <Text className="text-xs leading-[18px] text-[#AAAABA]">{content.description}</Text>
      </View>

      {state === 'idle' && onRequest ? (
        <ActionButton label="요청하기" onPress={onRequest} disabled={processing} />
      ) : null}
      {state === 'incoming' && onAccept && onReject ? (
        <View className="flex-row gap-2">
          <ActionButton label="거절하기" onPress={onReject} secondary disabled={processing} />
          <ActionButton label="수락하기" onPress={onAccept} disabled={processing} />
        </View>
      ) : null}
      {state === 'outgoing' && onCancel ? (
        <ActionButton label="요청 취소하기" onPress={onCancel} secondary disabled={processing} />
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-10 flex-1 items-center justify-center rounded-lg ${
        secondary ? 'border border-[#DADAE8] bg-white' : 'bg-[#256EF4]'
      } ${disabled ? 'opacity-50' : 'active:opacity-85'}`}
    >
      <Text className={`text-sm font-semibold ${secondary ? 'text-[#696976]' : 'text-white'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
