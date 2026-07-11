export type NoticeListItem = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
};

export type UseNoticeScreenReturn = {
  notices: NoticeListItem[];
  loading: boolean;
  error: string | null;
  unavailable: boolean;
};

export function useNoticeScreen(): UseNoticeScreenReturn {
  return {
    notices: [],
    loading: false,
    error: null,
    // Swagger currently exposes notices only through the admin (/bo) API.
    unavailable: true,
  };
}
