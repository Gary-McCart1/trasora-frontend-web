import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trasora.app',
  appName: 'Trasora',
  webDir: 'out', // unused, since we are loading live URL
  server: {
    url: 'https://trasora-frontend-web.vercel.app', // live frontend URL
    cleartext: true,
  },
};

export default config;
