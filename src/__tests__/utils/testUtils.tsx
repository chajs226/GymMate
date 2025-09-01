import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock providers for testing
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Common test data
export const mockExercise = {
  id: 'test-exercise-1',
  name: '벤치 프레스',
  description: '가슴 근육을 강화하는 기본 운동',
  muscle_groups: ['가슴', '삼두근'],
  equipment: '바벨',
  difficulty: 'beginner' as const,
  video_url: 'https://example.com/bench-press.mp4',
  tips: ['등을 평평하게 유지하세요', '바를 가슴 중앙으로 내리세요'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockRoutine = {
  id: 'test-routine-1',
  name: '초급자 상체 운동',
  description: '초급자를 위한 상체 운동 루틴',
  goal: 'Muscle Gain' as const,
  frequency: '3 days/week' as const,
  difficulty: 'beginner' as const,
  duration_weeks: 8,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockRoutineExercise = {
  id: 'test-routine-exercise-1',
  routine_id: 'test-routine-1',
  exercise_id: 'test-exercise-1',
  day_of_week: 1,
  order_in_day: 1,
  sets: 3,
  reps: '10-12',
  rest_time: 60,
  exercises: mockExercise,
};

export const mockUserProfile = {
  id: 'test-profile-1',
  user_id: 'test-user-1',
  goal: 'Muscle Gain' as const,
  frequency: '3 days/week' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockPerformanceLog = {
  id: 'test-log-1',
  userId: 'test-user-1',
  exerciseId: 'test-exercise-1',
  routineId: 'test-routine-1',
  weight: 60,
  sets: 3,
  reps: 12,
  notes: '',
  loggedAt: Date.now(),
};

// Mock AsyncStorage for testing
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock route
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Test helpers
export const waitForAsyncOperations = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const flushPromises = () => 
  new Promise(resolve => setImmediate(resolve));

// Mock Alert for testing
export const mockAlert = {
  alert: jest.fn((title, message, buttons) => {
    // Automatically call the first button's onPress if it exists
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  }),
};

// Performance test helper
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  await renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility test helper
export const checkAccessibility = (component: any) => {
  const errors: string[] = [];
  
  // Check for accessibility labels
  const touchableElements = component.findAllByType('TouchableOpacity');
  touchableElements.forEach((element: any) => {
    if (!element.props.accessibilityLabel && !element.props.accessibilityHint) {
      errors.push('TouchableOpacity missing accessibility label or hint');
    }
  });
  
  // Check for proper heading structure
  const textElements = component.findAllByType('Text');
  textElements.forEach((element: any) => {
    if (element.props.style && element.props.style.fontSize > 20) {
      if (!element.props.accessibilityRole || element.props.accessibilityRole !== 'header') {
        errors.push('Large text should have accessibilityRole="header"');
      }
    }
  });
  
  return errors;
};

// Network mock helper
export const mockNetworkResponse = (data: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay);
  });
};

// Mock Supabase client
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockExercise, error: null })),
        limit: jest.fn(() => Promise.resolve({ data: [mockExercise], error: null })),
      })),
      limit: jest.fn(() => Promise.resolve({ data: [mockExercise], error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
};
