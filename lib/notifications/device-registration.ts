import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  hasPermission,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { PermissionsAndroid, Platform } from 'react-native';

import { registerMyDevice, type DevicePlatform, type DeviceRegistrationRequest } from '@/lib/api';

const DEVICE_ID_KEY = 'knock-in.install-device-id';
const MAX_DEVICE_ID_LENGTH = 50;
const MAX_FCM_TOKEN_LENGTH = 512;

let memoryDeviceId: string | null = null;

export type PushDeviceSyncResult =
  | { status: 'registered' }
  | { status: 'permission-denied' }
  | { status: 'failed'; code?: string; message: string };

/**
 * 로그인 직후 현재 설치 기기를 백엔드 회원 정보에 연결한다.
 * 알림 권한이나 Firebase 문제는 로그인 자체를 막지 않도록 결과로만 반환한다.
 */
export async function syncPushDevice(options: {
  requestPermission: boolean;
}): Promise<PushDeviceSyncResult> {
  try {
    const permissionGranted = await ensureNotificationPermission(options.requestPermission);
    if (!permissionGranted) return { status: 'permission-denied' };

    const messaging = getMessaging();
    await registerDeviceForRemoteMessages(messaging);
    const fcmToken = await getToken(messaging);
    return registerTokenWithBackend(fcmToken);
  } catch (error: unknown) {
    return registrationFailure(error);
  }
}

/**
 * FCM 토큰이 교체되면 로그인된 회원의 저장값도 즉시 갱신한다.
 */
export function subscribeToPushTokenRefresh(): () => void {
  try {
    const messaging = getMessaging();
    return onTokenRefresh(messaging, (fcmToken) => {
      void registerTokenWithBackend(fcmToken).then((result) => {
        if (__DEV__ && result.status !== 'registered') {
          console.warn('[push] refreshed FCM token was not registered', {
            status: result.status,
            code: result.status === 'failed' ? result.code : undefined,
            message: result.status === 'failed' ? result.message : undefined,
          });
        }
      });
    });
  } catch (error: unknown) {
    if (__DEV__) {
      console.warn('[push] token refresh subscription is unavailable', registrationFailure(error));
    }
    return () => {};
  }
}

async function registerTokenWithBackend(fcmToken: string): Promise<PushDeviceSyncResult> {
  if (!fcmToken || fcmToken.length > MAX_FCM_TOKEN_LENGTH) {
    return {
      status: 'failed',
      code: 'INVALID_FCM_TOKEN',
      message: 'FCM 토큰 길이가 백엔드 계약과 맞지 않습니다.',
    };
  }

  const body: DeviceRegistrationRequest = {
    deviceId: await getOrCreateDeviceId(),
    fcmToken,
    platform: platformForBackend(),
  };
  const response = await registerMyDevice(body);
  if (response.status === 200 && !response.error) return { status: 'registered' };

  return {
    status: 'failed',
    code: response.error?.code,
    message: response.error?.message ?? `기기 등록에 실패했습니다. (${response.status})`,
  };
}

async function getOrCreateDeviceId(): Promise<string> {
  if (memoryDeviceId) return memoryDeviceId;

  try {
    if (await SecureStore.isAvailableAsync()) {
      const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (stored && stored.length <= MAX_DEVICE_ID_LENGTH) {
        memoryDeviceId = stored;
        return stored;
      }
    }
  } catch {
    // SecureStore를 사용할 수 없는 환경에서는 현재 실행 동안 같은 ID를 유지한다.
  }

  const generated = Crypto.randomUUID();
  memoryDeviceId = generated;
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);
    }
  } catch {
    // 메모리 값으로 현재 실행의 기기 식별은 계속할 수 있다.
  }
  return generated;
}

async function ensureNotificationPermission(shouldRequest: boolean): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) return true;
    if (shouldRequest) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  const messaging = getMessaging();
  const status = shouldRequest
    ? await requestPermission(messaging)
    : await hasPermission(messaging);
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

function platformForBackend(): DevicePlatform {
  return Platform.OS === 'android' ? 'ANDROID' : 'IOS';
}

function registrationFailure(error: unknown): PushDeviceSyncResult {
  const candidate = error as { code?: unknown; message?: unknown } | null;
  return {
    status: 'failed',
    code: typeof candidate?.code === 'string' ? candidate.code : undefined,
    message:
      typeof candidate?.message === 'string'
        ? candidate.message
        : 'FCM 기기 등록 중 알 수 없는 오류가 발생했습니다.',
  };
}
