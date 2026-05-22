import {
  SegmentedControlView,
  type SegmentedControlViewProps,
} from './segmented-control.view';
import {
  useSegmentedControl,
  type UseSegmentedControlProps,
} from './use-segmented-control';

export type SegmentedControlProps<V extends string = string> =
  UseSegmentedControlProps<V> &
    Omit<
      SegmentedControlViewProps<V>,
      keyof ReturnType<typeof useSegmentedControl<V>>
    >;

export function SegmentedControl<V extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...rest
}: SegmentedControlProps<V>) {
  const asks = useSegmentedControl<V>({
    options,
    value,
    defaultValue,
    onValueChange,
    disabled,
  });
  return <SegmentedControlView<V> {...asks} {...rest} />;
}
