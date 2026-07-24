import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert } from 'react-native';

import {
  type ChatRequestActionData,
  type ChatRequestParty,
  useChatRequestActions,
  useChatRequestDetail,
} from '@/lib/api';

export type UseChatRequestScreenReturn = {
  requestId: string;
  opponent: ChatRequestParty | null;
  score: number | null;
  status: string;
  isRequester: boolean;
  loading: boolean;
  error: string | null;
  processing: boolean;
  onBack: () => void;
  onRetry: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
};

export function useChatRequestScreen(): UseChatRequestScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = typeof id === 'string' ? id : '';
  const { data, loading, error, reload } = useChatRequestDetail(requestId);
  const { acceptChat, rejectChat, cancelChat, processingChatRequest } = useChatRequestActions();
  const isRequester = data?.isRequester === true;
  const opponent = useMemo(
    () => (isRequester ? data?.requestee : data?.requester) ?? null,
    [data?.requestee, data?.requester, isRequester],
  );

  const runAction = async (
    action: () => Promise<ChatRequestActionData>,
    navigateToAcceptedRoom = false,
  ) => {
    try {
      const result = await action();
      if (navigateToAcceptedRoom && result?.chatRoomId != null) {
        router.replace(`/chat/${result.chatRoomId}` as never);
      } else {
        router.back();
      }
    } catch (actionError) {
      Alert.alert(
        '요청 처리 실패',
        actionError instanceof Error ? actionError.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  const confirmDestructive = (kind: 'reject' | 'cancel') => {
    const rejecting = kind === 'reject';
    Alert.alert(
      rejecting ? '채팅 요청 거절' : '채팅 요청 취소',
      rejecting ? '이 채팅 요청을 거절할까요?' : '보낸 채팅 요청을 취소할까요?',
      [
        { text: '아니요', style: 'cancel' },
        {
          text: rejecting ? '거절' : '취소하기',
          style: 'destructive',
          onPress: () =>
            void runAction(() => (rejecting ? rejectChat(requestId) : cancelChat(requestId))),
        },
      ],
    );
  };

  return {
    requestId,
    opponent,
    score: data?.score ?? null,
    status: data?.status ?? 'PENDING',
    isRequester,
    loading,
    error,
    processing: processingChatRequest,
    onBack: () => router.back(),
    onRetry: reload,
    onAccept: () => void runAction(() => acceptChat(requestId), true),
    onReject: () => confirmDestructive('reject'),
    onCancel: () => confirmDestructive('cancel'),
  };
}
