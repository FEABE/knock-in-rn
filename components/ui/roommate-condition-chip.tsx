import { Text, View } from 'react-native';

import { ICON_GLYPH_STYLE } from '@/components/ui/icon-glyph-style';
import { PriorityArtwork } from '@/components/ui/ready-to-dev-assets';

const CHIP_TEXT_STYLE = ICON_GLYPH_STYLE;

export function RoommateConditionChip({ label, image }: { label: string; image?: string | null }) {
  return (
    <View className="h-[34px] flex-row items-center justify-center gap-1.5 rounded-lg border border-[#DADAE8] bg-white px-3">
      <PriorityArtwork label={label} image={image} size={18} />
      <Text
        style={CHIP_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#696976]"
      >
        {label}
      </Text>
    </View>
  );
}

export function RoommatePriorityChip({ label, image }: { label: string; image?: string | null }) {
  return (
    <View className="h-[36px] flex-row items-center justify-center gap-1.5 rounded-lg bg-[#ECF2FE] px-3">
      <PriorityArtwork label={label} image={image} size={18} />
      <Text
        style={CHIP_TEXT_STYLE}
        className="text-[14px] font-semibold leading-[21px] text-[#17171B]"
      >
        {label}
      </Text>
    </View>
  );
}
