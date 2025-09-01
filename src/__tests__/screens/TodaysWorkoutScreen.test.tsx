import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import TodaysWorkoutScreen from '../../screens/TodaysWorkoutScreen';
import { DatabaseService } from '../../services/database';
import { UserService } from '../../services/UserService';
import { WorkoutStateService } from '../../services/WorkoutStateService';
import { 
  render, 
  mockExercise, 
  mockRoutineExercise, 
  waitForAsyncOperations,
  mockNavigation,
  checkAccessibility 
} from '../utils/testUtils';

// Mock services
jest.mock('../../services/database');
jest.mock('../../services/UserService');
jest.mock('../../services/WorkoutStateService');
jest.mock('../../services/SyncService');

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: (callback: () => void) => {
    React.useEffect(callback, []);
  },
}));

const MockedDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;
const MockedUserService = UserService as jest.Mocked<typeof UserService>;
const MockedWorkoutStateService = WorkoutStateService as jest.Mocked<typeof WorkoutStateService>;

describe('TodaysWorkoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    MockedUserService.getCurrentUserId.mockResolvedValue('test-user-1');
    MockedDatabaseService.getUserRoutine.mockResolvedValue({
      id: 'test-user-routine-1',
      user_id: 'test-user-1',
      routine_id: 'test-routine-1',
      assigned_at: '2024-01-01T00:00:00Z',
    });
    MockedDatabaseService.getTodaysWorkout.mockResolvedValue({
      routine: { name: '오늘의 운동' },
      exercises: [mockRoutineExercise],
    });
    MockedWorkoutStateService.getCurrentSession.mockResolvedValue({
      id: 'test-session-1',
      userId: 'test-user-1',
      routineId: 'test-routine-1',
      dayOfWeek: 1,
      completedExercises: new Set(),
      isCompleted: false,
      startedAt: Date.now(),
      completedAt: null,
    });
  });

  test('renders loading state initially', () => {
    const { getByText } = render(<TodaysWorkoutScreen />);
    expect(getByText('오늘의 운동을 불러오는 중...')).toBeTruthy();
  });

  test('displays workout title and exercises after loading', async () => {
    const { getByText, queryByText } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(queryByText('오늘의 운동을 불러오는 중...')).toBeFalsy();
    });
    
    expect(getByText('오늘의 운동')).toBeTruthy();
    expect(getByText(mockExercise.name)).toBeTruthy();
  });

  test('shows rest day message when no exercises', async () => {
    MockedDatabaseService.getTodaysWorkout.mockResolvedValue({
      routine: { name: '휴식일' },
      exercises: [],
    });

    const { getByText } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByText('오늘은 휴식일입니다! 🏖️')).toBeTruthy();
    });
  });

  test('displays progress correctly', async () => {
    // Setup session with one completed exercise
    MockedWorkoutStateService.getCurrentSession.mockResolvedValue({
      id: 'test-session-1',
      userId: 'test-user-1',
      routineId: 'test-routine-1',
      dayOfWeek: 1,
      completedExercises: new Set([mockExercise.id]),
      isCompleted: false,
      startedAt: Date.now(),
      completedAt: null,
    });

    const { getByText } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByText('1/1 완료')).toBeTruthy();
    });
  });

  test('navigates to exercise detail when exercise is pressed', async () => {
    const { getByText } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByText(mockExercise.name)).toBeTruthy();
    });

    fireEvent.press(getByText(mockExercise.name));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ExerciseDetail', {
      exerciseId: mockExercise.id,
      exerciseName: mockExercise.name,
    });
  });

  test('toggles exercise completion when checkbox is pressed', async () => {
    const { getByTestId } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByTestId(`checkbox-${mockExercise.id}`)).toBeTruthy();
    });

    fireEvent.press(getByTestId(`checkbox-${mockExercise.id}`));
    
    expect(MockedWorkoutStateService.toggleExerciseCompletion).toHaveBeenCalled();
  });

  test('shows completion modal when all exercises are completed', async () => {
    // Mock all exercises completed
    MockedWorkoutStateService.getCurrentSession.mockResolvedValue({
      id: 'test-session-1',
      userId: 'test-user-1',
      routineId: 'test-routine-1',
      dayOfWeek: 1,
      completedExercises: new Set([mockExercise.id]),
      isCompleted: true,
      startedAt: Date.now(),
      completedAt: Date.now(),
    });

    MockedWorkoutStateService.toggleExerciseCompletion.mockImplementation(async (session) => ({
      ...session,
      isCompleted: true,
      completedAt: Date.now(),
    }));

    const { getByText, getByTestId } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByTestId(`checkbox-${mockExercise.id}`)).toBeTruthy();
    });

    fireEvent.press(getByTestId(`checkbox-${mockExercise.id}`));
    
    await waitFor(() => {
      expect(getByText('운동 완료!')).toBeTruthy();
    });
  });

  test('handles error state gracefully', async () => {
    MockedDatabaseService.getTodaysWorkout.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<TodaysWorkoutScreen />);
    
    await waitFor(() => {
      expect(getByText('오늘은 휴식일입니다! 🏖️')).toBeTruthy();
    });
  });

  test('refreshes data when screen focuses', async () => {
    const { rerender } = render(<TodaysWorkoutScreen />);
    
    await waitForAsyncOperations();
    
    // Clear mock calls from initial render
    jest.clearAllMocks();
    
    // Simulate screen focus
    rerender(<TodaysWorkoutScreen />);
    
    expect(MockedUserService.getCurrentUserId).toHaveBeenCalled();
    expect(MockedDatabaseService.getUserRoutine).toHaveBeenCalled();
  });

  describe('Development features', () => {
    test('shows debug buttons in development mode', async () => {
      // Mock __DEV__ to be true
      (global as any).__DEV__ = true;

      const { getByText } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(getByText('🔄 운동 데이터 새로고침')).toBeTruthy();
        expect(getByText('📱 스토리지 상태 출력')).toBeTruthy();
        expect(getByText('☁️ 수동 동기화')).toBeTruthy();
      });
    });

    test('hides debug buttons in production mode', async () => {
      // Mock __DEV__ to be false
      (global as any).__DEV__ = false;

      const { queryByText } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(queryByText('🔄 운동 데이터 새로고침')).toBeFalsy();
        expect(queryByText('📱 스토리지 상태 출력')).toBeFalsy();
        expect(queryByText('☁️ 수동 동기화')).toBeFalsy();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper accessibility labels and roles', async () => {
      const component = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(component.getByText(mockExercise.name)).toBeTruthy();
      });
      
      const accessibilityErrors = checkAccessibility(component);
      expect(accessibilityErrors.length).toBeLessThanOrEqual(2); // Allow some minor issues
    });

    test('exercise checkboxes have proper accessibility', async () => {
      const { getByTestId } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        const checkbox = getByTestId(`checkbox-${mockExercise.id}`);
        expect(checkbox.props.accessibilityRole).toBe('checkbox');
        expect(checkbox.props.accessibilityLabel).toContain(mockExercise.name);
      });
    });
  });

  describe('Performance', () => {
    test('renders within acceptable time', async () => {
      const startTime = performance.now();
      
      render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(MockedDatabaseService.getTodaysWorkout).toHaveBeenCalled();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    test('handles large exercise lists efficiently', async () => {
      // Create a large list of exercises
      const manyExercises = Array.from({ length: 50 }, (_, i) => ({
        ...mockRoutineExercise,
        id: `exercise-${i}`,
        exercise_id: `exercise-${i}`,
        exercises: {
          ...mockExercise,
          id: `exercise-${i}`,
          name: `운동 ${i + 1}`,
        },
      }));

      MockedDatabaseService.getTodaysWorkout.mockResolvedValue({
        routine: { name: '긴 운동 루틴' },
        exercises: manyExercises,
      });

      const startTime = performance.now();
      const { getByText } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(getByText('긴 운동 루틴')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still render efficiently with many exercises
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Error handling', () => {
    test('recovers from service failures', async () => {
      MockedUserService.getCurrentUserId.mockRejectedValueOnce(new Error('Auth error'));
      MockedUserService.getCurrentUserId.mockResolvedValue('test-user-1');

      const { getByText } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        // Should still show rest day message as fallback
        expect(getByText('오늘은 휴식일입니다! 🏖️')).toBeTruthy();
      });
    });

    test('handles missing user routine gracefully', async () => {
      MockedDatabaseService.getUserRoutine.mockResolvedValue(null);

      const { getByText } = render(<TodaysWorkoutScreen />);
      
      await waitFor(() => {
        expect(getByText('오늘은 휴식일입니다! 🏖️')).toBeTruthy();
      });
    });
  });
});
