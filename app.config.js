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
        'ITSAppUsesNonExemptEncryption': false,
        'CFBundleURLTypes': [
          {
            'CFBundleURLSchemes': [
              '1756789639-53rm9l38v3nshkh0o750j31hqh-ncpcjk'
            ]
          }
        ]
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
    plugins: ['expo-router', 'expo-secure-store'],
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