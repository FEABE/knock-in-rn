const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const KAKAO_TALK_PACKAGE = 'com.kakao.talk';
const KAKAO_APP_KEY_META_DATA = 'com.kakao.sdk.AppKey';

module.exports = function withKakaoAndroidQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.queries = manifest.queries ?? [];
    manifest.queries[0] = manifest.queries[0] ?? {};

    const hasKakaoTalkQuery = manifest.queries.some((query) =>
      query.package?.some((pkg) => pkg.$?.['android:name'] === KAKAO_TALK_PACKAGE),
    );

    if (!hasKakaoTalkQuery) {
      manifest.queries[0].package = manifest.queries[0].package ?? [];
      manifest.queries[0].package.push({ $: { 'android:name': KAKAO_TALK_PACKAGE } });
    }

    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    mainApplication['meta-data'] = mainApplication['meta-data'] ?? [];

    const hasKakaoAppKey = mainApplication['meta-data'].some(
      (item) => item.$?.['android:name'] === KAKAO_APP_KEY_META_DATA,
    );

    if (!hasKakaoAppKey) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': KAKAO_APP_KEY_META_DATA,
          'android:value': '@string/kakao_app_key',
        },
      });
    }

    return config;
  });
};
