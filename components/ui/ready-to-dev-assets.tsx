import { Image } from 'expo-image';
import { View } from 'react-native';

type RoomTypeArtworkProps = {
  label: string;
  size?: number;
};

type ArtworkProps = {
  size?: number;
};

type RoomOptionArtworkProps = ArtworkProps & {
  label: string;
};

type PriorityArtworkProps = ArtworkProps & {
  label: string;
};

const ROOM_TYPE_ARTWORK = {
  all: {
    source: require('../../assets/images/figma-ready/room-type-all.png'),
    box: [57, 58],
    image: [1.694, 1.6122, -0.3541, -0.1959],
  },
  'one-room': {
    source: require('../../assets/images/figma-ready/room-type-one-room.png'),
    box: [62, 65],
    image: [1.5652, 1.513, -0.2612, -0.223],
  },
  'two-room': {
    source: require('../../assets/images/figma-ready/room-type-two-room.png'),
    box: [66, 65],
    image: [1.4704, 1.513, -0.2534, -0.243],
  },
  'three-room': {
    source: require('../../assets/images/figma-ready/room-type-three-room.png'),
    box: [79, 57],
    image: [1.1284, 1.5862, -0.0585, -0.2907],
  },
  officetel: {
    source: require('../../assets/images/figma-ready/room-type-officetel.png'),
    box: [62, 64],
    image: [1.2889, 1.2528, -0.134, -0.0864],
  },
  'share-house': {
    source: require('../../assets/images/figma-ready/room-type-share-house.png'),
    box: [54, 60],
    image: [1.736, 1.5862, -0.3593, -0.0752],
  },
  apartment: {
    source: require('../../assets/images/figma-ready/room-type-apartment.png'),
    box: [58, 64],
    image: [1.5564, 1.4375, -0.2851, -0.1931],
  },
  villa: {
    source: require('../../assets/images/figma-ready/room-type-villa.png'),
    box: [68, 65],
    image: [1.5564, 1.6429, -0.2679, -0.3011],
  },
} as const;

const ROOM_OPTION_ARTWORK = {
  'full-option': require('../../assets/images/figma-ready/room-option-full-option.png'),
  internet: require('../../assets/images/figma-ready/room-option-internet.png'),
  parking: require('../../assets/images/figma-ready/room-option-parking.png'),
  elevator: require('../../assets/images/figma-ready/room-option-elevator.png'),
  pet: require('../../assets/images/figma-ready/room-option-pet.png'),
  'air-conditioner': require('../../assets/images/figma-ready/room-option-air-conditioner.png'),
  washer: require('../../assets/images/figma-ready/room-option-washer.png'),
  dryer: require('../../assets/images/figma-ready/room-option-dryer.png'),
} as const;

const PRIORITY_ARTWORK = {
  sleep: require('../../assets/images/figma-ready/priority-sleep.png'),
  cleanliness: require('../../assets/images/figma-ready/priority-cleanliness.png'),
  noise: require('../../assets/images/figma-ready/priority-noise.png'),
  smoking: require('../../assets/images/figma-ready/priority-smoking.png'),
  pet: require('../../assets/images/figma-ready/priority-pet.png'),
  visitors: require('../../assets/images/figma-ready/priority-visitors.png'),
  personality: require('../../assets/images/figma-ready/priority-personality.png'),
  'personal-space': require('../../assets/images/figma-ready/priority-personal-space.png'),
} as const;

type RoomTypeArtworkKey = keyof typeof ROOM_TYPE_ARTWORK;
type RoomOptionArtworkKey = keyof typeof ROOM_OPTION_ARTWORK;
type PriorityArtworkKey = keyof typeof PRIORITY_ARTWORK;

function roomTypeArtworkKey(label: string): RoomTypeArtworkKey {
  const normalized = label.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('전체')) return 'all';
  if (normalized.includes('쓰리') || normalized.includes('3room')) return 'three-room';
  if (normalized.includes('투룸') || normalized.includes('2room')) return 'two-room';
  if (normalized.includes('오피스텔')) return 'officetel';
  if (normalized.includes('쉐어')) return 'share-house';
  if (normalized.includes('아파트')) return 'apartment';
  if (normalized.includes('빌라')) return 'villa';
  return 'one-room';
}

function roomOptionArtworkKey(label: string): RoomOptionArtworkKey {
  const normalized = label.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('인터넷')) return 'internet';
  if (normalized.includes('주차')) return 'parking';
  if (normalized.includes('엘리베이터')) return 'elevator';
  if (normalized.includes('반려') || normalized.includes('펫')) return 'pet';
  if (normalized.includes('에어컨')) return 'air-conditioner';
  if (normalized.includes('세탁')) return 'washer';
  if (normalized.includes('건조')) return 'dryer';
  return 'full-option';
}

function priorityArtworkKey(label: string): PriorityArtworkKey {
  const normalized = label.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('청결') || normalized.includes('청소') || normalized.includes('깔끔')) {
    return 'cleanliness';
  }
  if (normalized.includes('소음') || normalized.includes('방음')) return 'noise';
  if (normalized.includes('흡연')) return 'smoking';
  if (normalized.includes('반려') || normalized.includes('애완')) return 'pet';
  if (normalized.includes('방문객') || normalized.includes('손님')) return 'visitors';
  if (normalized.includes('성격') || normalized.includes('성향') || normalized.includes('mbti')) {
    return 'personality';
  }
  if (normalized.includes('개인공간') || normalized.includes('프라이버시')) {
    return 'personal-space';
  }
  return 'sleep';
}

/**
 * Ready-to-Dev 와이어프레임의 방 형태 이미지는 원본 안쪽 여백까지 디자인에 포함되어 있어서,
 * Figma에 지정된 이미지 크롭 비율을 그대로 적용한다.
 */
export function RoomTypeArtwork({ label, size = 66 }: RoomTypeArtworkProps) {
  const artwork = ROOM_TYPE_ARTWORK[roomTypeArtworkKey(label)];
  const [boxWidth, boxHeight] = artwork.box;
  const [widthRatio, heightRatio, leftRatio, topRatio] = artwork.image;
  const scale = size / 79;
  const width = boxWidth * scale;
  const height = boxHeight * scale;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View style={{ width, height, overflow: 'hidden' }}>
        <Image
          source={artwork.source}
          contentFit="fill"
          style={{
            position: 'absolute',
            width: width * widthRatio,
            height: height * heightRatio,
            left: width * leftRatio,
            top: height * topRatio,
          }}
        />
      </View>
    </View>
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

export function RoomOptionArtwork({ label, size = 22 }: RoomOptionArtworkProps) {
  return (
    <Image
      source={ROOM_OPTION_ARTWORK[roomOptionArtworkKey(label)]}
      contentFit="cover"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyHouseArtwork({ size = 180 }: ArtworkProps) {
  return (
    <View style={{ width: size, height: size * 0.78, overflow: 'hidden' }}>
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

export function PriorityArtwork({ label, size = 22 }: PriorityArtworkProps) {
  return (
    <Image
      source={PRIORITY_ARTWORK[priorityArtworkKey(label)]}
      contentFit="cover"
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
