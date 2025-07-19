import { ref, computed } from 'vue';

export function useAppLoading() {
  const isLoading = ref(true);
  const loadingProgress = ref(0);
  const loadingSteps = ref<string[]>([]);
  const currentStep = ref(0);

  const progressPercentage = computed(() => {
    return Math.round((loadingProgress.value / 100) * 100);
  });

  const addLoadingStep = (step: string) => {
    loadingSteps.value.push(step);
  };

  const updateProgress = (progress: number, step?: string) => {
    loadingProgress.value = Math.min(progress, 100);
    if (step) {
      currentStep.value = loadingSteps.value.indexOf(step) + 1;
    }
  };

  const startLoading = () => {
    isLoading.value = true;
    loadingProgress.value = 0;
    currentStep.value = 0;
  };

  const completeLoading = () => {
    loadingProgress.value = 100;
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  };

  const simulateLoading = async (steps: string[], duration = 2000) => {
    startLoading();
    loadingSteps.value = steps;
    
    const stepDuration = duration / steps.length;
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      currentStep.value = i + 1;
      loadingProgress.value = ((i + 1) / steps.length) * 100;
      
      // Имитируем загрузку каждого шага
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    
    completeLoading();
  };

  return {
    isLoading,
    loadingProgress,
    loadingSteps,
    currentStep,
    progressPercentage,
    addLoadingStep,
    updateProgress,
    startLoading,
    completeLoading,
    simulateLoading
  };
} 