import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { logScreenView } from './index';

/**
 * 화면 체류 시간 자동 수집 (기획서 4-1).
 *
 * expo-router 의 현재 경로가 바뀔 때마다 Firebase screen_view 를 발화한다.
 * RootLayout 안에 한 번만 마운트하면 모든 화면이 자동 집계된다.
 * (네비게이션 onStateChange 대신 usePathname 사용 — expo-router 권장 방식)
 */
export function ScreenViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    logScreenView(pathname);
  }, [pathname]);

  return null;
}