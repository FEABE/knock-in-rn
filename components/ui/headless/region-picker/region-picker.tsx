import {
  RegionPickerView,
  type RegionPickerViewProps,
} from './region-picker.view';
import {
  useRegionPicker,
  type UseRegionPickerProps,
} from './use-region-picker';

export type RegionPickerProps = UseRegionPickerProps &
  Omit<RegionPickerViewProps, keyof ReturnType<typeof useRegionPicker>>;

export function RegionPicker({
  regions,
  value,
  defaultValue,
  onValueChange,
  max,
  onMaxReached,
  disabled,
  initialQuery,
  ...rest
}: RegionPickerProps) {
  const asks = useRegionPicker({
    regions,
    value,
    defaultValue,
    onValueChange,
    max,
    onMaxReached,
    disabled,
    initialQuery,
  });
  return <RegionPickerView {...asks} {...rest} />;
}
