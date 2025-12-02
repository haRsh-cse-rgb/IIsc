import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iisc.stis',
  appName: 'STIS Conference',
  webDir: 'out',
  server: {
    // For production, set this to your deployed server URL
    // This allows the app to use API routes from your server
    // url: process.env.CAPACITOR_SERVER_URL || 'https://your-production-url.com',
    // cleartext: false
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  },
  ios: {
    scheme: 'STIS Conference'
  }
};

export default config;
