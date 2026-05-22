import {
  LoadMoreListView,
  type LoadMoreListViewProps,
} from './load-more-list.view';
import {
  useLoadMoreList,
  type UseLoadMoreListProps,
} from './use-load-more-list';

export type LoadMoreListProps<T> = UseLoadMoreListProps<T> &
  Omit<
    LoadMoreListViewProps<T>,
    keyof ReturnType<typeof useLoadMoreList<T>>
  >;

export function LoadMoreList<T>({
  items,
  pageSize,
  initialPages,
  ...rest
}: LoadMoreListProps<T>) {
  const asks = useLoadMoreList<T>({ items, pageSize, initialPages });
  return <LoadMoreListView<T> {...asks} {...rest} />;
}
