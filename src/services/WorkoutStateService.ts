import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 운동 세션 상태를 나타내는 인터페이스
 */
export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  workoutDate: string; // YYYY-MM-DD 형식
  dayOfWeek: number;
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
  completedExercises: Set<string>; // exercise_id들의 Set
}

/**
 * 성과 로그를 나타내는 인터페이스
 */
export interface PerformanceLog {
  id: string;
  userId: string;
  exerciseId: string;
  routineId?: string;
  sessionId?: string;
  weight?: number;
  sets?: number;
  reps?: string;
  notes?: string;
  loggedAt: string;
}

/**
 * 운동 상태 관리를 위한 로컬 스토리지 서비스
 */
export class WorkoutStateService {
  private static readonly STORAGE_KEYS = {
    CURRENT_SESSION: 'workout_current_session',
    SESSION_HISTORY: 'workout_session_history',
    PERFORMANCE_LOGS: 'workout_performance_logs',
    SYNC_QUEUE: 'workout_sync_queue',
  };

  /**
   * 현재 날짜의 운동 세션을 가져오거나 생성합니다
   */
  static async getCurrentSession(
    userId: string,
    routineId: string,
    dayOfWeek: number
  ): Promise<WorkoutSession> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const sessionKey = `${userId}_${today}`;
      
      // 기존 세션 확인
      const existingSessionData = await AsyncStorage.getItem(
        `${this.STORAGE_KEYS.CURRENT_SESSION}_${sessionKey}`
      );

      if (existingSessionData) {
        const session = JSON.parse(existingSessionData);
        // Set 객체 복원
        session.completedExercises = new Set(session.completedExercises || []);
        console.log('📱 기존 운동 세션 로드:', session);
        return session;
      }

      // 새 세션 생성
      const newSession: WorkoutSession = {
        id: `session_${userId}_${today}_${Date.now()}`,
        userId,
        routineId,
        workoutDate: today,
        dayOfWeek,
        isCompleted: false,
        startedAt: new Date().toISOString(),
        completedExercises: new Set<string>(),
      };

      // 세션 저장
      await this.saveCurrentSession(newSession);
      console.log('📱 새 운동 세션 생성:', newSession);
      return newSession;
    } catch (error) {
      console.error('❌ 현재 세션 가져오기 실패:', error);
      throw new Error('운동 세션을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 현재 세션을 저장합니다
   */
  static async saveCurrentSession(session: WorkoutSession): Promise<void> {
    try {
      const sessionKey = `${session.userId}_${session.workoutDate}`;
      
      // Set을 Array로 변환하여 저장
      const sessionToSave = {
        ...session,
        completedExercises: Array.from(session.completedExercises),
      };

      await AsyncStorage.setItem(
        `${this.STORAGE_KEYS.CURRENT_SESSION}_${sessionKey}`,
        JSON.stringify(sessionToSave)
      );

      console.log('💾 운동 세션 저장 완료:', sessionKey);
    } catch (error) {
      console.error('❌ 세션 저장 실패:', error);
      throw new Error('운동 세션 저장에 실패했습니다.');
    }
  }

  /**
   * 운동 완료 상태를 토글합니다
   */
  static async toggleExerciseCompletion(
    session: WorkoutSession,
    exerciseId: string
  ): Promise<WorkoutSession> {
    try {
      const updatedSession = { ...session };
      
      if (updatedSession.completedExercises.has(exerciseId)) {
        updatedSession.completedExercises.delete(exerciseId);
        console.log('✅ 운동 완료 취소:', exerciseId);
      } else {
        updatedSession.completedExercises.add(exerciseId);
        console.log('✅ 운동 완료 표시:', exerciseId);
      }

      // 세션 저장
      await this.saveCurrentSession(updatedSession);
      
      return updatedSession;
    } catch (error) {
      console.error('❌ 운동 완료 상태 변경 실패:', error);
      throw new Error('운동 완료 상태를 변경하는데 실패했습니다.');
    }
  }

  /**
   * 전체 운동이 완료되었는지 확인하고 세션을 완료 처리합니다
   */
  static async completeSessionIfAllDone(
    session: WorkoutSession,
    totalExerciseCount: number
  ): Promise<WorkoutSession> {
    try {
      if (session.completedExercises.size === totalExerciseCount && !session.isCompleted) {
        const completedSession = {
          ...session,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        };

        await this.saveCurrentSession(completedSession);
        
        // 세션 히스토리에 추가
        await this.addToSessionHistory(completedSession);
        
        console.log('🎉 운동 세션 완료!', completedSession);
        return completedSession;
      }

      return session;
    } catch (error) {
      console.error('❌ 세션 완료 처리 실패:', error);
      throw new Error('운동 세션 완료 처리에 실패했습니다.');
    }
  }

  /**
   * 세션을 히스토리에 추가합니다
   */
  private static async addToSessionHistory(session: WorkoutSession): Promise<void> {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSION_HISTORY);
      const history: WorkoutSession[] = historyData ? JSON.parse(historyData) : [];
      
      // Set을 Array로 변환
      const sessionToSave = {
        ...session,
        completedExercises: Array.from(session.completedExercises),
      };
      
      history.push(sessionToSave as any);
      
      // 최근 30일만 유지
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredHistory = history.filter(s => 
        new Date(s.workoutDate) >= thirtyDaysAgo
      );
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SESSION_HISTORY,
        JSON.stringify(filteredHistory)
      );

      console.log('📚 세션 히스토리에 추가:', session.id);
    } catch (error) {
      console.error('❌ 히스토리 추가 실패:', error);
    }
  }

  /**
   * 성과 로그를 저장합니다
   */
  static async savePerformanceLog(log: Omit<PerformanceLog, 'id' | 'loggedAt'>): Promise<PerformanceLog> {
    try {
      const performanceLog: PerformanceLog = {
        ...log,
        id: `perf_${log.userId}_${log.exerciseId}_${Date.now()}`,
        loggedAt: new Date().toISOString(),
      };

      // 기존 로그들 가져오기
      const existingLogsData = await AsyncStorage.getItem(this.STORAGE_KEYS.PERFORMANCE_LOGS);
      const existingLogs: PerformanceLog[] = existingLogsData ? JSON.parse(existingLogsData) : [];
      
      // 새 로그 추가
      existingLogs.push(performanceLog);
      
      // 최근 100개만 유지
      const recentLogs = existingLogs.slice(-100);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PERFORMANCE_LOGS,
        JSON.stringify(recentLogs)
      );

      console.log('📊 성과 로그 저장:', performanceLog);
      return performanceLog;
    } catch (error) {
      console.error('❌ 성과 로그 저장 실패:', error);
      throw new Error('성과 로그 저장에 실패했습니다.');
    }
  }

  /**
   * 특정 운동의 최근 성과 로그를 가져옵니다
   */
  static async getRecentPerformanceLogs(
    userId: string,
    exerciseId: string,
    limit: number = 5
  ): Promise<PerformanceLog[]> {
    try {
      const logsData = await AsyncStorage.getItem(this.STORAGE_KEYS.PERFORMANCE_LOGS);
      const allLogs: PerformanceLog[] = logsData ? JSON.parse(logsData) : [];
      
      const exerciseLogs = allLogs
        .filter(log => log.userId === userId && log.exerciseId === exerciseId)
        .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
        .slice(0, limit);

      return exerciseLogs;
    } catch (error) {
      console.error('❌ 성과 로그 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 성과 로그를 가져옵니다 (동기화용)
   */
  static async getAllPerformanceLogs(
    userId: string,
    limit: number = 100
  ): Promise<PerformanceLog[]> {
    try {
      const logsData = await AsyncStorage.getItem(this.STORAGE_KEYS.PERFORMANCE_LOGS);
      const allLogs: PerformanceLog[] = logsData ? JSON.parse(logsData) : [];
      
      const userLogs = allLogs
        .filter(log => log.userId === userId)
        .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
        .slice(0, limit);

      return userLogs;
    } catch (error) {
      console.error('❌ 전체 성과 로그 조회 실패:', error);
      return [];
    }
  }

  /**
   * 세션 히스토리를 가져옵니다
   */
  static async getSessionHistory(userId: string, limit: number = 10): Promise<WorkoutSession[]> {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSION_HISTORY);
      const allSessions: any[] = historyData ? JSON.parse(historyData) : [];
      
      const userSessions = allSessions
        .filter(session => session.userId === userId)
        .map(session => ({
          ...session,
          completedExercises: new Set(session.completedExercises || []),
        }))
        .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
        .slice(0, limit);

      return userSessions;
    } catch (error) {
      console.error('❌ 세션 히스토리 조회 실패:', error);
      return [];
    }
  }

  /**
   * 개발용: 모든 저장된 데이터를 초기화합니다
   */
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SESSION_HISTORY),
        AsyncStorage.removeItem(this.STORAGE_KEYS.PERFORMANCE_LOGS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE),
      ]);

      // 현재 세션들도 모두 삭제
      const allKeys = await AsyncStorage.getAllKeys();
      const sessionKeys = allKeys.filter(key => 
        key.startsWith(this.STORAGE_KEYS.CURRENT_SESSION)
      );
      
      if (sessionKeys.length > 0) {
        await AsyncStorage.multiRemove(sessionKeys);
      }

      console.log('🗑️ 모든 운동 데이터 초기화 완료');
    } catch (error) {
      console.error('❌ 데이터 초기화 실패:', error);
    }
  }

  /**
   * 디버깅용: 현재 저장된 데이터 상태를 출력합니다
   */
  static async debugPrintStorageState(): Promise<void> {
    try {
      console.log('\n📱 === 운동 상태 스토리지 디버그 ===');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const workoutKeys = allKeys.filter(key => key.includes('workout_'));
      
      console.log(`총 ${workoutKeys.length}개의 운동 관련 키 발견:`);
      
      for (const key of workoutKeys) {
        const data = await AsyncStorage.getItem(key);
        console.log(`\n🔑 ${key}:`);
        console.log(data ? JSON.parse(data) : 'null');
      }
      
      console.log('\n📱 === 디버그 완료 ===\n');
    } catch (error) {
      console.error('❌ 스토리지 상태 디버깅 실패:', error);
    }
  }
}
