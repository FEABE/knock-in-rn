import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';

/** 업로드에 넘길 최소 파일 정보. `lib/api`의 `ChatImageUpload`와 호환된다. */
export type ChatPhotoPickerAsset = { uri: string; name: string; type: string };

export type ChatPhotoPickerProps = {
  visible: boolean;
  /** 업로드/전송 중이면 확인 버튼을 스피너로 잠근다. */
  uploading?: boolean;
  onClose: () => void;
  onConfirm: (asset: ChatPhotoPickerAsset) => void;
  onLaunchCamera: () => void;
};

const GRID_COLUMNS = 3;
const GRID_GAP = 4;
const GRID_PADDING = 16;
/** 한 번에 읽어오는 사진 수. 무한 스크롤로 이어서 채운다. */
const PAGE_SIZE = 60;

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  heic: 'image/heic',
  heif: 'image/heif',
};

/** 확장자로 MIME 을 추정한다. 모르는 확장자는 서버가 항상 받아주는 jpeg 로 둔다. */
function mimeFromFilename(filename?: string): string {
  const extension = filename?.split('.').pop()?.toLowerCase();
  return (extension && MIME_BY_EXTENSION[extension]) || 'image/jpeg';
}

type PermissionState = 'unknown' | 'granted' | 'denied';

type GridItem = { kind: 'camera' } | { kind: 'photo'; asset: MediaLibrary.Asset };

/**
 * 채팅 전용 인앱 사진 선택 모달(Figma "최근 항목").
 *
 * OS 피커 대신 직접 그리드를 그려서, 첫 칸의 카메라 타일과 하단 확인 버튼을 디자인대로 둔다.
 * 선택은 1장만 가능하고, 다른 사진을 누르면 선택이 그쪽으로 옮겨간다.
 */
export function ChatPhotoPicker({
  visible,
  uploading = false,
  onClose,
  onConfirm,
  onLaunchCamera,
}: ChatPhotoPickerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomPadding = useSafeBottomPadding(8, 12);
  const tileSize = Math.floor(
    (width - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
  );

  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selected, setSelected] = useState<MediaLibrary.Asset | null>(null);
  const [loading, setLoading] = useState(false);
  /** iOS `ph://` 를 실제 파일 경로로 바꾸는 동안의 대기 상태. */
  const [resolving, setResolving] = useState(false);

  const cursorRef = useRef<string | undefined>(undefined);
  const hasNextPageRef = useRef(true);
  const loadingRef = useRef(false);
  /** 권한 승인 후 첫 페이지를 이미 불러왔는지. 모달을 다시 열 때 재조회하지 않는다. */
  const loadedRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasNextPageRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: 'creationTime',
        first: PAGE_SIZE,
        after: cursorRef.current,
      });
      cursorRef.current = page.endCursor;
      hasNextPageRef.current = page.hasNextPage;
      setAssets((current) => {
        const seen = new Set(current.map((asset) => asset.id));
        return [...current, ...page.assets.filter((asset) => !seen.has(asset.id))];
      });
    } catch {
      // 더 읽지 못하는 상태(권한 축소 등)에서는 조용히 멈춘다. 이미 받은 사진은 그대로 보여준다.
      hasNextPageRef.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      // 다음에 열었을 때 지난 선택이 남아 있지 않도록 닫힐 때 비운다.
      setSelected(null);
      return;
    }
    if (loadedRef.current) return;

    let cancelled = false;
    void (async () => {
      const result = await MediaLibrary.requestPermissionsAsync();
      if (cancelled) return;
      if (!result.granted) {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      // 제한 접근에서 사용자가 사진 선택을 바꿀 수 있으므로 승인된 순간을 기준으로 다시 채운다.
      loadedRef.current = true;
      cursorRef.current = undefined;
      hasNextPageRef.current = true;
      setAssets([]);
      void loadNextPage();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadNextPage, visible]);

  const toggleSelect = useCallback((asset: MediaLibrary.Asset) => {
    // 선택 한도는 1장. 이미 고른 사진을 다시 누르면 해제되고, 다른 사진을 누르면 그쪽으로 옮겨간다.
    setSelected((current) => (current?.id === asset.id ? null : asset));
  }, []);

  const busy = uploading || resolving;

  const confirm = useCallback(async () => {
    if (!selected || busy) return;
    setResolving(true);
    try {
      // iOS 의 `ph://` URI 는 업로드에 그대로 쓸 수 없어 실제 파일 경로로 바꿔준다.
      let uri = selected.uri;
      try {
        const info = await MediaLibrary.getAssetInfoAsync(selected);
        if (info?.localUri) uri = info.localUri;
      } catch {
        // 정보 조회에 실패해도 원본 URI 로 시도해 본다.
      }
      onConfirm({
        uri,
        name: selected.filename || `chat-${Date.now()}.jpg`,
        type: mimeFromFilename(selected.filename),
      });
    } finally {
      setResolving(false);
    }
  }, [busy, onConfirm, selected]);

  const gridData: GridItem[] = [
    { kind: 'camera' },
    ...assets.map((asset) => ({ kind: 'photo' as const, asset })),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* RN Modal은 별도 네이티브 창이라 SafeAreaView가 인셋을 못 받는다(iOS에서 X가
          상태바를 침범하던 원인). 루트 컨텍스트의 인셋을 직접 패딩으로 넣는다. */}
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <PickerHeader onClose={onClose} />

        {permission === 'denied' ? (
          <PermissionDeniedState />
        ) : (
          <FlatList
            data={gridData}
            keyExtractor={(item) => (item.kind === 'camera' ? 'camera' : item.asset.id)}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={{ gap: GRID_GAP }}
            contentContainerStyle={{
              paddingHorizontal: GRID_PADDING,
              paddingBottom: 12,
              gap: GRID_GAP,
            }}
            onEndReachedThreshold={0.6}
            onEndReached={() => void loadNextPage()}
            ListFooterComponent={
              loading && assets.length > 0 ? (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" color="#AAAABA" />
                </View>
              ) : null
            }
            renderItem={({ item }) =>
              item.kind === 'camera' ? (
                <CameraTile size={tileSize} onPress={onLaunchCamera} />
              ) : (
                <PhotoTile
                  asset={item.asset}
                  size={tileSize}
                  selected={selected?.id === item.asset.id}
                  onPress={() => toggleSelect(item.asset)}
                />
              )
            }
          />
        )}

        <View style={{ paddingBottom: bottomPadding }} className="px-4 pt-2">
          <Pressable
            onPress={() => void confirm()}
            disabled={!selected || busy}
            accessibilityRole="button"
            accessibilityLabel="선택한 사진 보내기"
            accessibilityState={{ disabled: !selected || busy }}
            className={`h-[52px] items-center justify-center rounded-xl bg-[#4C87F6] ${
              !selected || busy ? 'opacity-50' : 'active:opacity-85'
            }`}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">확인</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PickerHeader({ onClose }: { onClose: () => void }) {
  return (
    <View className="h-[46px] flex-row items-center px-4">
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="사진 선택 닫기"
        hitSlop={12}
        className="w-6"
      >
        <Ionicons name="close" size={24} color="#17171B" />
      </Pressable>
    </View>
  );
}

function CameraTile({ size, onPress }: { size: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="카메라로 촬영하기"
      style={{ width: size, height: size }}
      className="items-center justify-center gap-1.5 bg-[#F1F1F6] active:opacity-80"
    >
      <Ionicons name="camera" size={28} color="#696976" />
      <Text className="text-xs font-medium text-[#696976]">카메라</Text>
    </Pressable>
  );
}

function PhotoTile({
  asset,
  size,
  selected,
  onPress,
}: {
  asset: MediaLibrary.Asset;
  size: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={selected ? '선택한 사진, 다시 누르면 해제' : '사진 선택'}
      accessibilityState={{ selected }}
      style={{ width: size, height: size }}
      className="overflow-hidden bg-[#ECECF3]"
    >
      {/* expo-image 는 iOS 의 `ph://` 썸네일을 그대로 그릴 수 있다. */}
      <Image source={{ uri: asset.uri }} contentFit="cover" style={{ width: size, height: size }} />
      {selected ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 border-2 border-[#4C87F6] bg-[#4C87F6]/10"
        />
      ) : null}
      <View
        pointerEvents="none"
        className={`absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full ${
          selected ? 'bg-[#4C87F6]' : 'border-[1.5px] border-white bg-black/15'
        }`}
      >
        {selected ? <Text className="text-xs font-bold text-white">1</Text> : null}
      </View>
    </Pressable>
  );
}

/** 사진 권한이 거부된 상태 — 앱 안에서 다시 물을 수 없으므로 설정으로 보낸다. */
function PermissionDeniedState() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      <Ionicons name="images-outline" size={40} color="#AAAABA" />
      <Text className="text-center text-[15px] font-bold text-[#17171B]">
        사진 접근 권한이 필요해요
      </Text>
      <Text className="text-center text-[13px] leading-5 text-[#696976]">
        설정에서 사진 접근을 허용하면{'\n'}채팅에서 사진을 보낼 수 있어요
      </Text>
      <Pressable
        onPress={() => void Linking.openSettings()}
        accessibilityRole="button"
        accessibilityLabel="설정 열기"
        className="mt-1 h-10 justify-center rounded-lg bg-[#4C87F6] px-5 active:opacity-85"
      >
        <Text className="text-sm font-bold text-white">설정 열기</Text>
      </Pressable>
    </View>
  );
}
