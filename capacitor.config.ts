import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'EcoEvents',
  webDir: 'dist',
  server: {
    // url: 'https://192.168.227.172:8443',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Не показывать стандартный splash screen
      backgroundColor: '#355ADD', // Цвет фона
      showSpinner: false, // Не показывать спиннер
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
