import { WorkoutStateService, WorkoutSession, PerformanceLog } from '../../services/WorkoutStateService';
import { mockAsyncStorage, mockPerformanceLog, waitForAsyncOperations } from '../utils/testUtils';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('WorkoutStateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('getCurrentSession', () => {
    test('creates new session when none exists', async () => {
      const session = await WorkoutStateService.getCurrentSession('user1', 'routine1', 1);
      
      expect(session).toEqual({
        id: expect.stringMatching(/^session_user1_routine1_1_\d+$/),
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(),
        isCompleted: false,
        startedAt: expect.any(Number),
        completedAt: null,
      });
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'workout_sessions',
        expect.any(String)
      );
    });

    test('returns existing session when found', async () => {
      const existingSession: WorkoutSession = {
        id: 'session_user1_routine1_1_12345',
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(['exercise1']),
        isCompleted: false,
        startedAt: 12345,
        completedAt: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          'session_user1_routine1_1_12345': {
            ...existingSession,
            completedExercises: ['exercise1'], // Set is serialized as array
          }
        })
      );

      const session = await WorkoutStateService.getCurrentSession('user1', 'routine1', 1);
      
      expect(session.id).toBe('session_user1_routine1_1_12345');
      expect(session.completedExercises.has('exercise1')).toBe(true);
    });
  });

  describe('toggleExerciseCompletion', () => {
    test('adds exercise to completed set when not completed', async () => {
      const session: WorkoutSession = {
        id: 'test_session',
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(),
        isCompleted: false,
        startedAt: Date.now(),
        completedAt: null,
      };

      const updatedSession = await WorkoutStateService.toggleExerciseCompletion(session, 'exercise1');
      
      expect(updatedSession.completedExercises.has('exercise1')).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('removes exercise from completed set when already completed', async () => {
      const session: WorkoutSession = {
        id: 'test_session',
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(['exercise1']),
        isCompleted: false,
        startedAt: Date.now(),
        completedAt: null,
      };

      const updatedSession = await WorkoutStateService.toggleExerciseCompletion(session, 'exercise1');
      
      expect(updatedSession.completedExercises.has('exercise1')).toBe(false);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('savePerformanceLog', () => {
    test('saves performance log to storage', async () => {
      const log: PerformanceLog = {
        ...mockPerformanceLog,
        loggedAt: Date.now(),
      };

      await WorkoutStateService.savePerformanceLog(log);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'performance_logs',
        expect.any(String)
      );
    });

    test('throws error for invalid log data', async () => {
      const invalidLog = {
        ...mockPerformanceLog,
        weight: -10, // Invalid weight
      };

      await expect(WorkoutStateService.savePerformanceLog(invalidLog)).rejects.toThrow();
    });
  });

  describe('getRecentPerformanceLogs', () => {
    test('returns recent logs for specific exercise', async () => {
      const logs = [
        { ...mockPerformanceLog, loggedAt: Date.now() - 86400000 }, // 1 day ago
        { ...mockPerformanceLog, loggedAt: Date.now() - 172800000 }, // 2 days ago
        { ...mockPerformanceLog, loggedAt: Date.now() - 259200000 }, // 3 days ago
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(logs));

      const recentLogs = await WorkoutStateService.getRecentPerformanceLogs('user1', 'exercise1', 2);
      
      expect(recentLogs).toHaveLength(2);
      expect(recentLogs[0].loggedAt).toBeGreaterThan(recentLogs[1].loggedAt);
    });

    test('returns empty array when no logs exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const recentLogs = await WorkoutStateService.getRecentPerformanceLogs('user1', 'exercise1', 5);
      
      expect(recentLogs).toEqual([]);
    });
  });

  describe('clearAllData', () => {
    test('removes all workout data from storage', async () => {
      await WorkoutStateService.clearAllData();
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('workout_sessions');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('performance_logs');
    });
  });

  describe('completeSessionIfAllDone', () => {
    test('marks session as completed when all exercises are done', async () => {
      const session: WorkoutSession = {
        id: 'test_session',
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(['exercise1', 'exercise2']),
        isCompleted: false,
        startedAt: Date.now(),
        completedAt: null,
      };

      const totalExercises = 2;
      const result = await WorkoutStateService.completeSessionIfAllDone(session, totalExercises);
      
      expect(result.isCompleted).toBe(true);
      expect(result.completedAt).toBeTruthy();
    });

    test('does not mark session as completed when exercises remain', async () => {
      const session: WorkoutSession = {
        id: 'test_session',
        userId: 'user1',
        routineId: 'routine1',
        dayOfWeek: 1,
        completedExercises: new Set(['exercise1']),
        isCompleted: false,
        startedAt: Date.now(),
        completedAt: null,
      };

      const totalExercises = 3;
      const result = await WorkoutStateService.completeSessionIfAllDone(session, totalExercises);
      
      expect(result.isCompleted).toBe(false);
      expect(result.completedAt).toBeNull();
    });
  });

  describe('validation', () => {
    test('validates performance log data', async () => {
      const validLog = mockPerformanceLog;
      await expect(WorkoutStateService.savePerformanceLog(validLog)).resolves.not.toThrow();

      const invalidLogs = [
        { ...mockPerformanceLog, weight: -1 },
        { ...mockPerformanceLog, sets: 0 },
        { ...mockPerformanceLog, reps: -5 },
        { ...mockPerformanceLog, userId: '' },
        { ...mockPerformanceLog, exerciseId: '' },
      ];

      for (const invalidLog of invalidLogs) {
        await expect(WorkoutStateService.savePerformanceLog(invalidLog)).rejects.toThrow();
      }
    });
  });

  describe('data consistency', () => {
    test('handles corrupted storage data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const session = await WorkoutStateService.getCurrentSession('user1', 'routine1', 1);
      expect(session.userId).toBe('user1');
      expect(session.completedExercises.size).toBe(0);
    });

    test('handles concurrent access properly', async () => {
      const promises = [
        WorkoutStateService.getCurrentSession('user1', 'routine1', 1),
        WorkoutStateService.getCurrentSession('user1', 'routine1', 1),
        WorkoutStateService.getCurrentSession('user1', 'routine1', 1),
      ];

      const sessions = await Promise.all(promises);
      
      // All sessions should have the same ID (same user, routine, day)
      expect(sessions[0].id).toBe(sessions[1].id);
      expect(sessions[1].id).toBe(sessions[2].id);
    });
  });

  describe('performance', () => {
    test('operations complete within reasonable time', async () => {
      const startTime = Date.now();
      
      await WorkoutStateService.getCurrentSession('user1', 'routine1', 1);
      await WorkoutStateService.savePerformanceLog(mockPerformanceLog);
      await WorkoutStateService.getRecentPerformanceLogs('user1', 'exercise1', 5);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // All operations should complete within 100ms (in mock environment)
      expect(executionTime).toBeLessThan(100);
    });

    test('handles large datasets efficiently', async () => {
      // Simulate large dataset
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPerformanceLog,
        id: `log-${i}`,
        loggedAt: Date.now() - i * 86400000,
      }));

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(largeLogs));

      const startTime = Date.now();
      const recentLogs = await WorkoutStateService.getRecentPerformanceLogs('user1', 'exercise1', 10);
      const endTime = Date.now();

      expect(recentLogs).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast even with large dataset
    });
  });
});
