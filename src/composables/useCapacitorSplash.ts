import { ref } from 'vue';
import { SplashScreen } from '@capacitor/splash-screen';

export function useCapacitorSplash() {
  const isNativeSplashVisible = ref(true);

  const hideNativeSplash = async () => {
    try {
      await SplashScreen.hide();
      isNativeSplashVisible.value = false;
    } catch (error) {
      console.warn('Failed to hide native splash screen:', error);
    }
  };

  const showNativeSplash = async () => {
    try {
      await SplashScreen.show();
      isNativeSplashVisible.value = true;
    } catch (error) {
      console.warn('Failed to show native splash screen:', error);
    }
  };

  const hideNativeSplashAfterDelay = async (delay: number = 1000) => {
    setTimeout(async () => {
      await hideNativeSplash();
    }, delay);
  };

  return {
    isNativeSplashVisible,
    hideNativeSplash,
    showNativeSplash,
    hideNativeSplashAfterDelay
  };
} 