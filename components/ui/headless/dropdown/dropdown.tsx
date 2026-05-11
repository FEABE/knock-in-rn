import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  DropdownContentView,
  DropdownItemView,
  DropdownRootView,
  DropdownTriggerView,
  type DropdownContentViewProps,
  type DropdownItemViewProps,
  type DropdownTriggerViewProps,
} from './dropdown.view';
import {
  useDropdownContent,
  useDropdownItem,
  useDropdownRoot,
  useDropdownTrigger,
  type UseDropdownItemProps,
  type UseDropdownRootProps,
} from './use-dropdown';

type RootProps = UseDropdownRootProps & { children?: ReactNode };

function Root({ children, ...askProps }: RootProps) {
  const value = useDropdownRoot(askProps);
  return <DropdownRootView value={value}>{children}</DropdownRootView>;
}

type TriggerProps = Omit<DropdownTriggerViewProps, 'onPress' | 'accessibilityState'>;

const Trigger = forwardRef<RNView, TriggerProps>(function Trigger(props, ref) {
  const asks = useDropdownTrigger();
  return <DropdownTriggerView ref={ref} {...asks} {...props} />;
});

type ContentProps = Omit<DropdownContentViewProps, 'isOpen'>;

const Content = forwardRef<RNView, ContentProps>(function Content(props, ref) {
  const asks = useDropdownContent();
  return <DropdownContentView ref={ref} {...asks} {...props} />;
});

type ItemProps = Omit<
  DropdownItemViewProps,
  'onPress' | 'accessibilityState' | 'selected'
> &
  UseDropdownItemProps;

const Item = forwardRef<RNView, ItemProps>(function Item(
  { value, onSelect, ...rest },
  ref,
) {
  const asks = useDropdownItem({ value, onSelect });
  return <DropdownItemView ref={ref} {...asks} {...rest} />;
});

export const Dropdown = {
  Root,
  Trigger,
  Content,
  Item,
};
