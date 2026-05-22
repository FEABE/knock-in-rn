import {
  RangeSliderView,
  type RangeSliderViewProps,
} from './range-slider.view';
import {
  useRangeSlider,
  type UseRangeSliderProps,
} from './use-range-slider';

export type RangeSliderProps = UseRangeSliderProps &
  Omit<RangeSliderViewProps, keyof ReturnType<typeof useRangeSlider>>;

export function RangeSlider({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  minDistance,
  disabled,
  ...rest
}: RangeSliderProps) {
  const asks = useRangeSlider({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step,
    minDistance,
    disabled,
  });
  return <RangeSliderView {...asks} {...rest} />;
}
