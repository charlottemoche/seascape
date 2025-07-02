import 'dotenv/config';

export default {
  expo: {
    name: 'Seascape',
    slug: 'seascape',
    owner: 'charlottebmoche',
    version: '1.5.8',
    orientation: 'portrait',
    icon: './assets/images/fish.png',
    scheme: 'seascape',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splashscreen.png',
      resizeMode: 'cover',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cbm.seascape',
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription: "This app requires microphone access to enable audio recording during breathing exercises.",
      },
      usesAppleSignIn: true,
      entitlements: {
        'aps-environment': 'production'
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.cbm.seascape',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-audio',
      'expo-notifications',
      'expo-web-browser',
      'expo-apple-authentication',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.1756789639-53rm9l38v3nshkh0o750j31hqhncpcjk'
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      expoPushAccessToken: process.env.EXPO_PUBLIC_EXPO_PUSH_ACCESS_TOKEN,
      eas: {
        'projectId': 'd38ddf75-e6f0-4ea2-b829-b732001a3f93'
      }
    },
  },
};