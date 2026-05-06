/** @type {import('@expo/config').ExpoConfig} */
const config = {
  name: 'MealFlow',
  slug: 'MealFlow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mealflow',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.morant.mealflow',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    buildNumber: '3',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    package: 'com.morant.mealflow',
    googleServicesFile: './google-services.json',
    permissions: ['android.permission.RECORD_AUDIO'],
  },
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '16.1',
          buildReactNativeFromSource: true,
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow MealFlow to access your photos to extract ingredients.',
        cameraPermission: 'Allow MealFlow to use the camera to scan your fridge.',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    'expo-secure-store',
    // Only inject Bugsnag source map upload in cloud builds where BUGSNAG_API_KEY is available.
    // Local builds skip this to avoid a failing Xcode build phase.
    ...(process.env.BUGSNAG_API_KEY ? ['@bugsnag/plugin-expo-eas-sourcemaps'] : []),
  ],
  experiments: {
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: '9a9708fd-b419-47c4-a23e-75d5d1a88760',
    },
    bugsnag: {
      apiKey: process.env.BUGSNAG_API_KEY ?? 'ef23e88d9bcc1340edf4680977f5baa7',
    },
  },
  owner: 'morant',
};

module.exports = config;
