import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lottos.app',
  appName: 'Lottos',
  webDir: 'dist',
  server: {
    url: 'https://216c43eb-67d2-4b40-a6ba-81d9201b5546.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
