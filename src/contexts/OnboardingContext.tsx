import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
  goal: string;
  frequency: string;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateGoal: (goal: string) => void;
  updateFrequency: (frequency: string) => void;
  resetOnboarding: () => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goal: '',
    frequency: '',
  });
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const updateGoal = (goal: string) => {
    setOnboardingData((prev) => ({ ...prev, goal }));
  };

  const updateFrequency = (frequency: string) => {
    setOnboardingData((prev) => ({ ...prev, frequency }));
  };

  const resetOnboarding = () => {
    setOnboardingData({ goal: '', frequency: '' });
    setIsOnboardingComplete(false);
  };

  const setOnboardingComplete = (complete: boolean) => {
    setIsOnboardingComplete(complete);
  };

  const value: OnboardingContextType = {
    onboardingData,
    updateGoal,
    updateFrequency,
    resetOnboarding,
    isOnboardingComplete,
    setOnboardingComplete,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

