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
/** 앨범 목록 첫 줄(전체 사진)을 가리키는 가상 키. 실제 기기 앨범 id 와 겹치지 않게 둔다. */
const RECENT_ALBUM_KEY = '__recent__';
const RECENT_ALBUM_TITLE = '최근 항목';
/** 앨범 목록 행의 썸네일 한 변 길이(px). */
const ALBUM_THUMB_SIZE = 56;

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
 * 앨범 목록 한 줄. `album` 이 `null` 이면 앨범 필터 없이 전체 사진을 보는 "최근 항목" 이다.
 * 제목/개수는 OS 가 지역화해 준 값을 그대로 쓴다.
 */
type AlbumEntry = {
  key: string;
  title: string;
  count: number;
  album: MediaLibrary.Album | null;
};

/** iOS 스마트 앨범 중 우리가 첫 줄로 직접 만들어 넣는 "최근 항목"과 같은 것. 중복 노출을 막는다. */
const RECENT_SMART_ALBUM_TITLES = new Set(['최근 항목', 'Recents', 'Recent']);

/**
 * 기기 앨범을 화면 순서대로 정렬한다. 스마트 앨범(즐겨찾기·스크린샷 등)을 먼저,
 * 사용자가 만든 앨범을 뒤에 두고 각 그룹 안에서는 라이브러리가 준 순서를 유지한다.
 * `type` 은 iOS 에만 있어서 Android 에서는 전부 사용자 앨범 그룹으로 떨어진다.
 */
function toAlbumEntries(albums: MediaLibrary.Album[], recentCount: number): AlbumEntry[] {
  const visible = albums.filter(
    (album) =>
      album.assetCount > 0 &&
      !(album.type === 'smartAlbum' && RECENT_SMART_ALBUM_TITLES.has(album.title)),
  );
  const smart = visible.filter((album) => album.type === 'smartAlbum');
  const others = visible.filter((album) => album.type !== 'smartAlbum');
  return [
    { key: RECENT_ALBUM_KEY, title: RECENT_ALBUM_TITLE, count: recentCount, album: null },
    ...[...smart, ...others].map((album) => ({
      key: album.id,
      title: album.title,
      count: album.assetCount,
      album,
    })),
  ];
}

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
  /** 지금 보고 있는 앨범. `null` 이면 전체 사진("최근 항목"). */
  const [currentAlbum, setCurrentAlbum] = useState<AlbumEntry | null>(null);
  /** 헤더 제목을 눌러서 앨범 목록을 펼친 상태인지. */
  const [albumListOpen, setAlbumListOpen] = useState(false);
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  /** 앨범 id(또는 최근 항목 키) → 대표 사진 URI. 행이 보일 때 하나씩 채운다. */
  const [albumThumbs, setAlbumThumbs] = useState<Record<string, string>>({});

  const cursorRef = useRef<string | undefined>(undefined);
  const hasNextPageRef = useRef(true);
  const loadingRef = useRef(false);
  /** 권한 승인 후 첫 페이지를 이미 불러왔는지. 모달을 다시 열 때 재조회하지 않는다. */
  const loadedRef = useRef(false);
  /** 페이징이 참조하는 앨범. 상태 대신 ref 로 둬서 `loadNextPage` 를 재생성하지 않는다. */
  const albumRef = useRef<MediaLibrary.Album | null>(null);
  /**
   * 앨범을 바꿀 때마다 증가하는 세대 번호. 이전 앨범의 응답이 늦게 도착해도
   * 세대가 어긋나면 버려서 두 앨범의 페이지가 섞이지 않는다.
   */
  const albumGenerationRef = useRef(0);
  const albumsLoadedRef = useRef(false);
  /** 이미 요청한 썸네일 키. 같은 행이 여러 번 보여도 한 번만 조회한다. */
  const albumThumbRequestedRef = useRef<Set<string>>(new Set());

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasNextPageRef.current) return;
    const generation = albumGenerationRef.current;
    const album = albumRef.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: 'creationTime',
        first: PAGE_SIZE,
        after: cursorRef.current,
        album: album ?? undefined,
      });
      // 응답을 기다리는 사이 앨범이 바뀌었으면 이 페이지는 지금 화면과 상관없는 사진들이다.
      if (generation !== albumGenerationRef.current) return;
      cursorRef.current = page.endCursor;
      hasNextPageRef.current = page.hasNextPage;
      setAssets((current) => {
        const seen = new Set(current.map((asset) => asset.id));
        return [...current, ...page.assets.filter((asset) => !seen.has(asset.id))];
      });
    } catch {
      // 더 읽지 못하는 상태(권한 축소 등)에서는 조용히 멈춘다. 이미 받은 사진은 그대로 보여준다.
      if (generation === albumGenerationRef.current) hasNextPageRef.current = false;
    } finally {
      // 뒤늦게 끝난 이전 세대가 새 앨범의 로딩 플래그를 풀어버리지 않도록 세대를 확인한다.
      if (generation === albumGenerationRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  /** 앨범 목록은 처음 펼칠 때 한 번만 읽는다. 실패하면 다음에 다시 시도할 수 있게 표시를 되돌린다. */
  const loadAlbums = useCallback(async () => {
    if (albumsLoadedRef.current) return;
    albumsLoadedRef.current = true;
    setAlbumsLoading(true);
    try {
      const [deviceAlbums, recentPage] = await Promise.all([
        MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true }),
        MediaLibrary.getAssetsAsync({ mediaType: 'photo', first: 1 }),
      ]);
      setAlbums(toAlbumEntries(deviceAlbums, recentPage.totalCount));
    } catch {
      albumsLoadedRef.current = false;
      // 앨범을 못 읽어도 "최근 항목"으로는 돌아갈 수 있어야 한다.
      setAlbums(toAlbumEntries([], 0));
    } finally {
      setAlbumsLoading(false);
    }
  }, []);

  /** 화면에 보이는 앨범 행의 대표 사진을 한 장만 읽어 캐시한다. 실패하면 회색 자리표시자로 둔다. */
  const requestAlbumThumb = useCallback((entry: AlbumEntry) => {
    if (albumThumbRequestedRef.current.has(entry.key)) return;
    albumThumbRequestedRef.current.add(entry.key);
    void (async () => {
      try {
        const page = await MediaLibrary.getAssetsAsync({
          mediaType: 'photo',
          sortBy: 'creationTime',
          first: 1,
          album: entry.album ?? undefined,
        });
        const uri = page.assets[0]?.uri;
        if (uri) setAlbumThumbs((current) => ({ ...current, [entry.key]: uri }));
      } catch {
        // 대표 사진을 못 읽어도 목록 자체는 그대로 쓸 수 있다.
      }
    })();
  }, []);

  const toggleAlbumList = useCallback(() => {
    setAlbumListOpen((open) => {
      if (!open) void loadAlbums();
      return !open;
    });
  }, [loadAlbums]);

  /** 앨범을 바꾸면 커서·목록·선택을 모두 비우고 그 앨범의 첫 페이지부터 다시 읽는다. */
  const selectAlbum = useCallback(
    (entry: AlbumEntry) => {
      setAlbumListOpen(false);
      const currentKey = currentAlbum?.key ?? RECENT_ALBUM_KEY;
      if (entry.key === currentKey) return;

      setCurrentAlbum(entry.album ? entry : null);
      albumRef.current = entry.album;
      albumGenerationRef.current += 1;
      cursorRef.current = undefined;
      hasNextPageRef.current = true;
      // 진행 중이던 이전 앨범 요청은 세대가 달라 무시되므로 여기서 잠금을 바로 풀어 준다.
      loadingRef.current = false;
      // 새 앨범에 없는 사진이 선택된 채로 남으면 혼란스럽다.
      setSelected(null);
      setAssets([]);
      void loadNextPage();
    },
    [currentAlbum?.key, loadNextPage],
  );

  useEffect(() => {
    if (!visible) {
      // 다음에 열었을 때 지난 선택이 남아 있지 않도록 닫힐 때 비운다.
      setSelected(null);
      // 보고 있던 앨범은 유지하되, 펼쳐 둔 앨범 목록은 접고 다시 연다.
      setAlbumListOpen(false);
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
      albumGenerationRef.current += 1;
      cursorRef.current = undefined;
      hasNextPageRef.current = true;
      loadingRef.current = false;
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
        <PickerHeader
          onClose={onClose}
          title={currentAlbum?.title ?? RECENT_ALBUM_TITLE}
          albumListOpen={albumListOpen}
          onToggleAlbumList={toggleAlbumList}
        />

        {permission === 'denied' ? (
          <PermissionDeniedState />
        ) : albumListOpen ? (
          <AlbumListView
            albums={albums}
            loading={albumsLoading}
            thumbs={albumThumbs}
            selectedKey={currentAlbum?.key ?? RECENT_ALBUM_KEY}
            onRequestThumb={requestAlbumThumb}
            onSelect={selectAlbum}
          />
        ) : (
          <FlatList
            key="grid"
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

function PickerHeader({
  onClose,
  title,
  albumListOpen,
  onToggleAlbumList,
}: {
  onClose: () => void;
  title: string;
  albumListOpen: boolean;
  onToggleAlbumList: () => void;
}) {
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
      <Pressable
        onPress={onToggleAlbumList}
        accessibilityRole="button"
        accessibilityLabel={albumListOpen ? '앨범 목록 닫기' : '앨범 목록 열기'}
        accessibilityState={{ expanded: albumListOpen }}
        hitSlop={8}
        className="flex-1 flex-row items-center justify-center gap-1 active:opacity-70"
      >
        <Text numberOfLines={1} className="max-w-[180px] text-base font-bold text-[#17171B]">
          {title}
        </Text>
        <Ionicons name={albumListOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#17171B" />
      </Pressable>
      {/* 제목을 화면 정가운데 두기 위한 오른쪽 여백. X 버튼과 같은 폭. */}
      <View className="w-6" />
    </View>
  );
}

/** 헤더 제목을 눌렀을 때 그리드 자리를 대신 채우는 기기 앨범 목록. */
function AlbumListView({
  albums,
  loading,
  thumbs,
  selectedKey,
  onRequestThumb,
  onSelect,
}: {
  albums: AlbumEntry[];
  loading: boolean;
  thumbs: Record<string, string>;
  selectedKey: string;
  onRequestThumb: (entry: AlbumEntry) => void;
  onSelect: (entry: AlbumEntry) => void;
}) {
  if (loading && albums.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#AAAABA" />
      </View>
    );
  }

  return (
    <FlatList
      key="albums"
      data={albums}
      keyExtractor={(entry) => entry.key}
      contentContainerStyle={{ paddingBottom: 12 }}
      renderItem={({ item }) => (
        <AlbumRow
          entry={item}
          thumbUri={thumbs[item.key]}
          selected={item.key === selectedKey}
          onRequestThumb={onRequestThumb}
          onSelect={onSelect}
        />
      )}
    />
  );
}

function AlbumRow({
  entry,
  thumbUri,
  selected,
  onRequestThumb,
  onSelect,
}: {
  entry: AlbumEntry;
  thumbUri?: string;
  selected: boolean;
  onRequestThumb: (entry: AlbumEntry) => void;
  onSelect: (entry: AlbumEntry) => void;
}) {
  // 화면에 실제로 그려지는 행만 대표 사진을 요청한다(요청 여부는 부모가 키로 기억한다).
  useEffect(() => {
    onRequestThumb(entry);
  }, [entry, onRequestThumb]);

  return (
    <Pressable
      onPress={() => onSelect(entry)}
      accessibilityRole="button"
      accessibilityLabel={`${entry.title} 앨범, 사진 ${entry.count}장`}
      accessibilityState={{ selected }}
      className="flex-row items-center gap-3 px-4 py-2 active:bg-[#F1F1F6]"
    >
      <View
        style={{ width: ALBUM_THUMB_SIZE, height: ALBUM_THUMB_SIZE }}
        className="overflow-hidden rounded-md bg-[#ECECF3]"
      >
        {thumbUri ? (
          <Image
            source={{ uri: thumbUri }}
            contentFit="cover"
            style={{ width: ALBUM_THUMB_SIZE, height: ALBUM_THUMB_SIZE }}
          />
        ) : null}
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={`text-[15px] ${selected ? 'font-bold text-[#4C87F6]' : 'font-medium text-[#17171B]'}`}
        >
          {entry.title}
        </Text>
        <Text className="mt-0.5 text-[13px] text-[#696976]">{entry.count}</Text>
      </View>
    </Pressable>
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
