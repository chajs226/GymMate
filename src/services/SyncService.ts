import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { WorkoutStateService, WorkoutSession, PerformanceLog } from './WorkoutStateService';
import { UserService } from './UserService';

/**
 * 동기화 상태를 나타내는 인터페이스
 */
interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingUploads: number;
  syncInProgress: boolean;
}

/**
 * Supabase와 로컬 데이터를 동기화하는 서비스
 */
export class SyncService {
  private static readonly SYNC_STATUS_KEY = 'sync_status';
  private static readonly LAST_SYNC_KEY = 'last_sync_timestamp';

  /**
   * 전체 동기화를 실행합니다 (업로드 + 다운로드)
   */
  static async performFullSync(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 전체 동기화 시작...');

      // 네트워크 연결 확인
      const isOnline = await this.checkNetworkConnection();
      if (!isOnline) {
        return { success: false, message: '네트워크 연결을 확인해주세요.' };
      }

      const userId = await UserService.getCurrentUserId();

      // 1. 로컬 데이터를 Supabase에 업로드
      const uploadResult = await this.uploadLocalDataToSupabase(userId);
      if (!uploadResult.success) {
        return uploadResult;
      }

      // 2. Supabase에서 최신 데이터 다운로드
      const downloadResult = await this.downloadDataFromSupabase(userId);
      if (!downloadResult.success) {
        return downloadResult;
      }

      // 3. 마지막 동기화 시간 업데이트
      await this.updateLastSyncTime();

      console.log('✅ 전체 동기화 완료');
      return { success: true, message: '동기화가 완료되었습니다!' };

    } catch (error) {
      console.error('❌ 동기화 중 오류:', error);
      return { success: false, message: '동기화 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 로컬 데이터를 Supabase에 업로드합니다
   */
  static async uploadLocalDataToSupabase(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📤 로컬 데이터 업로드 시작...');

      // 1. 세션 히스토리는 현재 기존 테이블 구조로는 지원하지 않음
      // 대신 성과 로그만 동기화
      let uploadedSessions = 0;

      // 2. 성과 로그 업로드
      const performanceLogs = await WorkoutStateService.getAllPerformanceLogs(userId, 100);
      let uploadedLogs = 0;

      console.log(`📊 로컬에서 발견된 성과 로그: ${performanceLogs.length}개`);
      console.log('📋 로그 데이터 샘플:', performanceLogs.slice(0, 2));

      for (const log of performanceLogs) {
        try {
          console.log('🔍 처리 중인 로그:', {
            id: log.id,
            userId: log.userId,
            exerciseId: log.exerciseId,
            routineId: log.routineId,
            weight: log.weight,
            sets: log.sets,
            reps: log.reps,
            loggedAt: log.loggedAt
          });

          // 기존 workout_logs 테이블을 사용하여 업로드
          // 중복 체크를 위해 동일한 시간대의 로그가 있는지 확인
          console.log('🔍 중복 체크 중:', {
            user_id: log.userId,
            exercise_id: log.exerciseId,
            logged_at: log.loggedAt
          });

          const { data: existingLog, error: checkError } = await supabase
            .from('workout_logs')
            .select('id')
            .eq('user_id', log.userId)
            .eq('exercise_id', log.exerciseId)
            .gte('completed_at', new Date(new Date(log.loggedAt).getTime() - 60000).toISOString()) // 1분 전후
            .lte('completed_at', new Date(new Date(log.loggedAt).getTime() + 60000).toISOString())
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.warn('⚠️ 중복 체크 중 오류:', checkError);
          }

          if (!existingLog) {
            console.log('✅ 중복 없음, 업로드 진행');
            // 새 로그 업로드 (기존 workout_logs 테이블 스키마에 맞춤)
            console.log('📤 업로드 시도 중인 로그:', {
              user_id: log.userId,
              exercise_id: log.exerciseId,
              routine_id: log.routineId,
              sets_completed: log.sets || 0,
              reps_completed: log.reps || '0',
              weight_used: log.weight || null,
              completed_at: log.loggedAt,
            });

            // routine_id가 없는 경우 기본 루틴 사용
            let routineIdToUse = log.routineId;
            if (!routineIdToUse) {
              console.log('⚠️ routine_id가 없음, 사용자 루틴 조회 중...');
              try {
                const { data: userRoutine } = await supabase
                  .from('user_routines')
                  .select('routine_id')
                  .eq('user_id', log.userId)
                  .single();
                
                if (userRoutine) {
                  routineIdToUse = userRoutine.routine_id;
                  console.log('✅ 사용자 루틴 발견:', routineIdToUse);
                } else {
                  // 기본 루틴 사용
                  const { data: defaultRoutine } = await supabase
                    .from('routines')
                    .select('id')
                    .limit(1)
                    .single();
                  
                  if (defaultRoutine) {
                    routineIdToUse = defaultRoutine.id;
                    console.log('✅ 기본 루틴 사용:', routineIdToUse);
                  }
                }
              } catch (error) {
                console.warn('⚠️ 루틴 조회 실패:', error);
              }
            }

            // exercise_id 검증
            console.log('🔍 exercise_id 검증 중:', log.exerciseId);
            const { data: exerciseExists } = await supabase
              .from('exercises')
              .select('id')
              .eq('id', log.exerciseId)
              .single();

            if (!exerciseExists) {
              console.warn('⚠️ 유효하지 않은 exercise_id, 업로드 건너뜀:', log.exerciseId);
              continue;
            }

            // routine_id가 여전히 없으면 건너뛰기
            if (!routineIdToUse) {
              console.warn('⚠️ routine_id를 찾을 수 없어 업로드 건너뜀');
              continue;
            }

            const { data: insertResult, error: logError } = await supabase
              .from('workout_logs')
              .insert({
                user_id: log.userId,
                exercise_id: log.exerciseId,
                routine_id: routineIdToUse,
                sets_completed: log.sets || 0,
                reps_completed: log.reps || '0',
                weight_used: log.weight || null,
                completed_at: log.loggedAt,
              })
              .select();

            if (logError) {
              console.error('❌ 로그 업로드 실패:', {
                message: logError.message,
                code: logError.code,
                details: logError.details,
                hint: logError.hint
              });
            } else {
              console.log('✅ 로그 업로드 성공:', insertResult);
              uploadedLogs++;
            }
          } else {
            console.log('⚠️ 중복 로그 발견, 업로드 건너뜀:', existingLog);
          }
        } catch (error) {
          console.error('❌ 로그 처리 중 예외 발생:', error);
        }
      }

      console.log(`✅ 업로드 완료: 세션 ${uploadedSessions}개, 로그 ${uploadedLogs}개`);
      return { 
        success: true, 
        message: `업로드 완료: 세션 ${uploadedSessions}개, 로그 ${uploadedLogs}개` 
      };

    } catch (error) {
      console.error('❌ 업로드 중 오류:', error);
      return { success: false, message: '업로드 중 오류가 발생했습니다.' };
    }
  }

  /**
   * Supabase에서 데이터를 다운로드하여 로컬에 병합합니다
   */
  static async downloadDataFromSupabase(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📥 클라우드 데이터 다운로드 시작...');

      // 1. 최근 30일간의 성과 로그 다운로드 (기존 workout_logs 테이블 사용)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: remoteLogs, error: logError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false })
        .limit(100);

      if (logError) {
        console.error('❌ 로그 다운로드 실패:', logError);
        return { success: false, message: '성과 로그 다운로드에 실패했습니다.' };
      }

      // 2. 로컬 데이터와 병합 (현재는 로깅만, 실제 병합은 복잡한 로직 필요)
      console.log(`📊 다운로드된 데이터: 로그 ${remoteLogs?.length || 0}개`);

      // TODO: 실제 병합 로직 구현
      // - 원격 데이터를 로컬 PerformanceLog 형식으로 변환
      // - 중복 제거 후 로컬 AsyncStorage 업데이트
      // - 최신 데이터 우선 정책 적용

      return { 
        success: true, 
        message: `다운로드 완료: 로그 ${remoteLogs?.length || 0}개` 
      };

    } catch (error) {
      console.error('❌ 다운로드 중 오류:', error);
      return { success: false, message: '다운로드 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 네트워크 연결 상태를 확인합니다
   */
  static async checkNetworkConnection(): Promise<boolean> {
    try {
      // Supabase에 간단한 쿼리를 보내서 연결 상태 확인
      const { data, error } = await supabase
        .from('exercises')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.warn('⚠️ 네트워크 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * 동기화 상태를 가져옵니다
   */
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const isOnline = await this.checkNetworkConnection();
      const lastSyncData = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      const lastSync = lastSyncData ? JSON.parse(lastSyncData) : null;

      // 대기 중인 업로드 수 계산 (간단히 로컬 데이터 수로 추정)
      const userId = await UserService.getCurrentUserId();
      const sessions = await WorkoutStateService.getSessionHistory(userId, 30);
      const pendingUploads = sessions.length;

      return {
        isOnline,
        lastSync,
        pendingUploads,
        syncInProgress: false, // 실제로는 상태 관리 필요
      };
    } catch (error) {
      console.error('❌ 동기화 상태 조회 실패:', error);
      return {
        isOnline: false,
        lastSync: null,
        pendingUploads: 0,
        syncInProgress: false,
      };
    }
  }

  /**
   * 마지막 동기화 시간을 업데이트합니다
   */
  private static async updateLastSyncTime(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, JSON.stringify(now));
    } catch (error) {
      console.error('❌ 동기화 시간 업데이트 실패:', error);
    }
  }

  /**
   * 자동 동기화를 설정합니다 (앱 시작 시 실행)
   */
  static async setupAutoSync(): Promise<void> {
    try {
      console.log('🔄 자동 동기화 설정 중...');

      // 네트워크 연결이 있을 때만 실행
      const isOnline = await this.checkNetworkConnection();
      if (!isOnline) {
        console.log('📱 오프라인 모드: 자동 동기화 건너뜀');
        return;
      }

      // 마지막 동기화 시간 확인
      const lastSyncData = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      const lastSync = lastSyncData ? new Date(JSON.parse(lastSyncData)) : null;
      const now = new Date();

      // 24시간 이상 지났으면 자동 동기화 실행
      if (!lastSync || (now.getTime() - lastSync.getTime()) > 24 * 60 * 60 * 1000) {
        console.log('⏰ 자동 동기화 실행 (24시간 경과)');
        await this.performFullSync();
      } else {
        console.log('✅ 최근 동기화됨: 자동 동기화 건너뜀');
      }

    } catch (error) {
      console.error('❌ 자동 동기화 설정 실패:', error);
    }
  }

  /**
   * 개발용: 동기화 관련 데이터 초기화
   */
  static async clearSyncData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.SYNC_STATUS_KEY,
        this.LAST_SYNC_KEY,
      ]);
      console.log('🗑️ 동기화 데이터 초기화 완료');
    } catch (error) {
      console.error('❌ 동기화 데이터 초기화 실패:', error);
    }
  }
}


