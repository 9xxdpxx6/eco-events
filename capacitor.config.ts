import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'EcoEvents',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Не показывать стандартный splash screen
      backgroundColor: '#2ecc71', // Цвет фона
      showSpinner: false, // Не показывать спиннер
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
