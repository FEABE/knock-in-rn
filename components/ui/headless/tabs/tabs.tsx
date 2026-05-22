import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  TabsContentView,
  TabsListView,
  TabsRootView,
  TabsTriggerView,
  type TabsContentViewProps,
  type TabsListViewProps,
  type TabsRootViewProps,
  type TabsTriggerViewProps,
} from './tabs.view';
import {
  useTabsContent,
  useTabsRoot,
  useTabsTrigger,
  type UseTabsRootProps,
  type UseTabsTriggerProps,
} from './use-tabs';

type RootProps = UseTabsRootProps &
  Omit<TabsRootViewProps, 'value'> & { children?: ReactNode };

function Root({
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  ...rest
}: RootProps) {
  const ctxValue = useTabsRoot({ value, defaultValue, onValueChange, disabled });
  return (
    <TabsRootView value={ctxValue} {...rest}>
      {children}
    </TabsRootView>
  );
}

const List = forwardRef<RNView, TabsListViewProps>(function List(props, ref) {
  return <TabsListView ref={ref} {...props} />;
});

type TriggerProps = UseTabsTriggerProps &
  Omit<TabsTriggerViewProps, keyof ReturnType<typeof useTabsTrigger>>;

const Trigger = forwardRef<RNView, TriggerProps>(function Trigger(
  { value, disabled, ...rest },
  ref,
) {
  const asks = useTabsTrigger({ value, disabled });
  return <TabsTriggerView ref={ref} {...asks} {...rest} />;
});

type ContentProps = Omit<TabsContentViewProps, 'isActive'> & { value: string };

const Content = forwardRef<RNView, ContentProps>(function Content(
  { value, ...rest },
  ref,
) {
  const { isActive } = useTabsContent(value);
  return <TabsContentView ref={ref} isActive={isActive} {...rest} />;
});

export const Tabs = { Root, List, Trigger, Content };
