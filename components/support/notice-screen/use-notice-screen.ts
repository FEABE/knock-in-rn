import { useMemo } from 'react';

import { NOTICES } from '@/lib/domain';

export type NoticeListItem = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
};

export type UseNoticeScreenReturn = {
  notices: NoticeListItem[];
};

export function useNoticeScreen(): UseNoticeScreenReturn {
  const notices = useMemo<NoticeListItem[]>(
    () =>
      NOTICES.map((notice) => ({
        id: notice.id,
        title: notice.title,
        body: notice.body,
        dateLabel: fmtDate(notice.createdAt),
      })),
    [],
  );

  return { notices };
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
