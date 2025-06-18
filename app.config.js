import 'dotenv/config';

export default {
  expo: {
    name: 'Seascape',
    slug: 'seascape',
    owner: 'charlottebmoche',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/fish.png',
    scheme: 'seascape',
    deepLinking: true,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/wave.png',
      resizeMode: 'cover',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cbm.seascape',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription: "This app requires microphone access to enable audio recording during breathing exercises.",
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ['seascape', 'com.cbm.seascape'],
          },
          {
            CFBundleURLSchemes: ['seascape'],
          },
        ],
      }
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
    plugins: ['expo-router', 'expo-secure-store', 'expo-audio'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      eas: {
        'projectId': 'd38ddf75-e6f0-4ea2-b829-b732001a3f93'
      }
    },
  },
};