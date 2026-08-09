import type { ExpoConfig } from 'expo/config';

/** 방 게시글 업로드와 채팅 사진 보내기가 같은 사진 보관함 권한을 쓴다. */
const PHOTOS_PERMISSION =
  '방 게시글에 올리거나 채팅에서 사진을 보내기 위해 사진 보관함에 접근합니다.';

const config: ExpoConfig = {
  name: '노크인',
  slug: 'knock-in-rn',
  owner: 'chl09jaes-team',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'knockinrn',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.knockin',
    appleTeamId: '2VW85FYXV8',
    googleServicesFile: './GoogleService-Info.plist',
    usesAppleSignIn: true,
    entitlements: {
      'aps-environment': 'development',
      'com.apple.developer.applesignin': ['Default'],
    },
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    package: 'com.knockin',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    './plugins/with-kakao-android-queries',
    'expo-font',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    'expo-secure-store',
    'expo-apple-authentication',
    // NSPhotoLibraryUsageDescription 은 expo-image-picker / expo-media-library 두 플러그인이
    // 모두 건드리므로, 나중에 적용되는 쪽이 이기지 않도록 같은 문구를 양쪽에 둔다.
    [
      'expo-image-picker',
      {
        photosPermission: PHOTOS_PERMISSION,
        cameraPermission: '채팅에서 사진을 찍어 보내기 위해 카메라를 사용합니다.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: PHOTOS_PERMISSION,
        // 앱에서 사진을 저장하지 않으므로 저장 권한 문구는 두지 않는다.
        savePhotosPermission: false,
        // Android 13+ 는 READ_MEDIA_IMAGES 만 있으면 된다(동영상/오디오는 요청하지 않는다).
        granularPermissions: ['photo'],
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 245,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],

    [
      '@react-native-seoul/kakao-login',
      {
        kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY,
        kotlinVersion: '2.1.10',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
        android: {
          kotlinVersion: '2.1.10',
          extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: '5a6d97d4-5a83-48d3-aeef-a44a2cfb1c2f',
    },
  },
};

export default config;
