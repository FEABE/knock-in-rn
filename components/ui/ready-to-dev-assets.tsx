import { Image } from 'expo-image';
import { Text, View } from 'react-native';

type RoomTypeArtworkProps = {
  label: string;
  size?: number;
  /** 서버 메타 image 필드(이모지 문자열 또는 절대 URL). 렌더 불가한 값이면 로컬 아트워크로 폴백한다. */
  image?: string | null;
};

type ArtworkProps = {
  size?: number;
  height?: number;
};

type RoomOptionArtworkProps = ArtworkProps & {
  label: string;
  /** 서버 메타 image 필드(이모지 문자열 또는 URL). 렌더 불가한 값이면 로컬 아트워크로 폴백한다. */
  image?: string | null;
};

type PriorityArtworkProps = ArtworkProps & {
  label: string;
  /** 서버 메타 image 필드(이모지 문자열 또는 URL). 렌더 불가한 값이면 로컬 아트워크로 폴백한다. */
  image?: string | null;
};

type ServerArtwork = { kind: 'emoji'; value: string } | { kind: 'uri'; value: string };

/**
 * 서버 메타의 image 필드를 렌더 가능한 형태로 해석한다.
 * 실서버는 현재 파일명("life_saved.png")만 내려주는데 그것만으로는 URL을 만들 수 없어 null(로컬 폴백)을 준다.
 * 이모지 문자열이나 절대 URL로 바뀌면 별도 수정 없이 그대로 표시된다.
 */
function serverArtwork(image: string | null | undefined): ServerArtwork | null {
  const value = image?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return { kind: 'uri', value };
  // 확장자/경로가 있는 값은 파일명일 뿐이라 렌더할 수 없다.
  if (/[./\\]/.test(value)) return null;
  // 순수 ASCII면 이모지가 아니라 슬러그/키 값이므로 렌더하지 않는다.
  if (!/[^\u0000-\u007F]/.test(value)) return null;
  return { kind: 'emoji', value };
}

function ServerArtworkView({ artwork, size }: { artwork: ServerArtwork; size: number }) {
  if (artwork.kind === 'emoji') {
    return (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Text style={{ fontSize: size * 0.82, lineHeight: size }}>{artwork.value}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: artwork.value }}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function RoomTypeArtwork({ label, image, size = 66 }: RoomTypeArtworkProps) {
  const remote = serverArtwork(image);
  if (remote) return <ServerArtworkView artwork={remote} size={size} />;
  return (
    <Image
      accessibilityLabel={`${label} 기본 이미지`}
      source={require('../../assets/images/figma-ready/image_tag_default.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function RoomPresenceArtwork({ hasRoom, size = 28 }: ArtworkProps & { hasRoom: boolean }) {
  return (
    <Image
      source={
        hasRoom
          ? require('../../assets/images/figma-ready/onboarding-has-room.png')
          : require('../../assets/images/figma-ready/onboarding-no-room.png')
      }
      contentFit="cover"
      style={{ width: size, height: size }}
    />
  );
}

export function RoomOptionArtwork({ label, image, size = 22 }: RoomOptionArtworkProps) {
  const artwork = serverArtwork(image);
  if (artwork) return <ServerArtworkView artwork={artwork} size={size} />;
  return (
    <Image
      accessibilityLabel={`${label} 기본 이미지`}
      source={require('../../assets/images/figma-ready/image_tag_default.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyHouseArtwork({ size = 180, height = size * 0.78 }: ArtworkProps) {
  return (
    <View style={{ width: size, height, overflow: 'hidden' }}>
      <Image
        source={require('../../assets/images/figma-ready/empty-search-and-interest.png')}
        contentFit="fill"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: 0,
          top: -size * 0.112,
        }}
      />
    </View>
  );
}

export function RoomLocationArtwork({ size = 180 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/empty-search-and-interest.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function IdentityVerificationArtwork({ size = 226 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/identity-verification.png')}
      contentFit="cover"
      style={{ width: size, height: size }}
    />
  );
}

export function LifestyleIntroArtwork({ size = 238 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/lifestyle-intro.png')}
      contentFit="cover"
      style={{ width: size, height: size }}
    />
  );
}

export function PriorityArtwork({ label, image, size = 22 }: PriorityArtworkProps) {
  const artwork = serverArtwork(image);
  if (artwork) return <ServerArtworkView artwork={artwork} size={size} />;
  return (
    <Image
      accessibilityLabel={`${label} 기본 이미지`}
      source={require('../../assets/images/figma-ready/image_tag_default.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function OnboardingCompleteArtwork({ size = 256 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/onboarding-complete.png')}
      contentFit="cover"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Figma "기본 프로필"(3748:80380) 에셋. 프로필 사진이 없을 때 쓰는 아바타 placeholder다.
 * 실루엣 하단이 원 밖으로 살짝 넘치는 원본 비율(80 x 81.4339)을 그대로 유지한다.
 */
const DEFAULT_PROFILE_ASPECT = 81.4339 / 80;

export function DefaultProfileArtwork({ size = 80 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/default-profile.png')}
      contentFit="contain"
      style={{ width: size, height: size * DEFAULT_PROFILE_ASPECT }}
    />
  );
}

/** 원본이 28x25px로 작아 확대 시 흐릿할 수 있다. */
export function SchoolBadgeArtwork({ size = 28 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/school-badge.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

/** 원본이 26x26px로 작아 확대 시 흐릿할 수 있다. */
export function CompanyBadgeArtwork({ size = 28 }: ArtworkProps) {
  return (
    <Image
      source={require('../../assets/images/figma-ready/company-badge.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}
