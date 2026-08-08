import { Text, View } from 'react-native';

/**
 * 문의 내역/상세에서 공통으로 쓰는 뱃지. 디자인(3746:78965, 3952:51728)에서 카테고리와 상태
 * 뱃지는 폭 66px로 고정이라 카드마다 라벨 길이가 달라도 좌우 끝선이 어긋나지 않는다.
 */
function Chip({ label, className, textClassName }: ChipProps) {
  return (
    <View className={`h-[26px] w-[66px] items-center justify-center rounded px-2 ${className}`}>
      <Text numberOfLines={1} className={`text-xs font-semibold ${textClassName}`}>
        {label}
      </Text>
    </View>
  );
}

type ChipProps = {
  label: string;
  className: string;
  textClassName: string;
};

export function InquiryCategoryChip({ label }: { label: string }) {
  return <Chip label={label} className="bg-[#ECF2FE]" textClassName="text-[#4C87F6]" />;
}

export function InquiryStatusChip({ answered, label }: { answered: boolean; label: string }) {
  return (
    <Chip
      label={label}
      className={answered ? 'bg-[#EAF6EC]' : 'bg-[#ECECF3]'}
      textClassName={answered ? 'text-[#228738]' : 'text-[#696976]'}
    />
  );
}
