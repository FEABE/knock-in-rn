import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'knock-in-rn',
  slug: 'knock-in-rn',
  owner: 'chl09jaes-team',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'knockinrn',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.knockin',
    appleTeamId: '2VW85FYXV8',
    googleServicesFile: './GoogleService-Info.plist',
    usesAppleSignIn: true,
    entitlements: {
      'aps-environment': 'development',
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
    'expo-font',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    'expo-secure-store',
    'expo-apple-authentication',
    [
      'expo-image-picker',
      {
        photosPermission: '방 게시글에 올릴 사진을 선택하기 위해 사진 보관함 접근이 필요합니다.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
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
