// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.pedometer',
  appName: 'PedometerApp',
  webDir: 'dist', // This should point to the directory where Vue.js builds the files
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    }
  },
  server: {
    url: 'http://localhost:8080',
    cleartext: true
  }
};

export default config;
