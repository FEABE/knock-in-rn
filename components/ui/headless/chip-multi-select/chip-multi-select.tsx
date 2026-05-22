import {
  ChipMultiSelectView,
  type ChipMultiSelectViewProps,
} from './chip-multi-select.view';
import {
  useChipMultiSelect,
  type UseChipMultiSelectProps,
} from './use-chip-multi-select';

export type ChipMultiSelectProps<V extends string = string> =
  UseChipMultiSelectProps<V> &
    Omit<
      ChipMultiSelectViewProps<V>,
      keyof ReturnType<typeof useChipMultiSelect<V>>
    >;

export function ChipMultiSelect<V extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  max,
  onMaxReached,
  disabled,
  ...rest
}: ChipMultiSelectProps<V>) {
  const asks = useChipMultiSelect<V>({
    options,
    value,
    defaultValue,
    onValueChange,
    max,
    onMaxReached,
    disabled,
  });
  return <ChipMultiSelectView<V> {...asks} {...rest} />;
}
