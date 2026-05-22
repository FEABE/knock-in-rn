import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseLoadMoreListReturn } from './use-load-more-list';

export type LoadMoreListViewProps<T> = Omit<ViewProps, 'children'> &
  UseLoadMoreListReturn<T> & {
    className?: string;
    children: (value: UseLoadMoreListReturn<T>) => ReactNode;
  };

export function LoadMoreListView<T>({
  visible,
  hasMore,
  page,
  total,
  loadMore,
  reset,
  children,
  ...rest
}: LoadMoreListViewProps<T>) {
  return (
    <View {...rest}>
      {children({ visible, hasMore, page, total, loadMore, reset })}
    </View>
  );
}
