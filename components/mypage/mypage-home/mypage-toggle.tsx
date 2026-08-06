import { View } from 'react-native';

import { Toggle } from '@/components/ui/headless';

/**
 * Figma 마이페이지 토글(3885:44372 계측값).
 * 트랙 52x28 / thumb 24 / 좌우 여백 2px 이라 켜졌을 때 thumb이 트랙 오른쪽 끝에 거의 붙는다.
 * RN 기본 Switch나 padding 4px 구현은 thumb이 안쪽으로 들어가 보여서 직접 그린다.
 */
const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 24;
const TRACK_PADDING = 2;

const TRACK_ON = '#256EF4';
const TRACK_OFF = '#ECECF3';

export type MyPageToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
};

export function MyPageToggle({ checked, disabled = false, onChange }: MyPageToggleProps) {
  return (
    <Toggle checked={checked} disabled={disabled} onCheckedChange={onChange}>
      {({ checked: isChecked }) => (
        <View
          style={{
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            padding: TRACK_PADDING,
            backgroundColor: isChecked ? TRACK_ON : TRACK_OFF,
            opacity: disabled ? 0.5 : 1,
            justifyContent: 'center',
            alignItems: isChecked ? 'flex-end' : 'flex-start',
          }}
        >
          <View
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: '#FFFFFF',
              shadowColor: '#17171B',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
              elevation: 1,
            }}
          />
        </View>
      )}
    </Toggle>
  );
}
