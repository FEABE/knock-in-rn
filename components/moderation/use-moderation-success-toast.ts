import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ModerationReturnTarget } from '@/lib/navigation/routes';

import {
  consumeModerationSuccessToast,
  type PendingModerationSuccessToast,
} from './moderation-success-toast';

export function useModerationSuccessToast(screen: ModerationReturnTarget['screen']) {
  const [toast, setToast] = useState<PendingModerationSuccessToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const pending = consumeModerationSuccessToast(screen);
      if (!pending) return;
      setToast(pending);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 2000);
    }, [screen]),
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return toast;
}
