import { supabase } from '../config/supabase';
import { Routine, Exercise, UserProfile, RoutineExercise, WorkoutLog } from '../types/database';



// 데이터베이스 서비스 클래스
export class DatabaseService {
  // Supabase 연결 상태 확인
  static async testConnection() {
    try {
      console.log('🔍 Supabase 연결 테스트 중...');
      
      // 더 간단한 쿼리로 연결 상태 확인
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Supabase 연결 실패:', error);
        return {
          connected: false,
          error: error.message,
          details: error
        };
      }

      console.log('✅ Supabase 연결 성공');
      return {
        connected: true,
        data: data
      };
    } catch (error) {
      console.error('❌ Supabase 연결 테스트 중 예외 발생:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
  }

  // 사용자 프로필 관련 메서드
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`사용자 프로필 조회 실패: ${error.message}`);
    }

    return data;
  }

  static async createUserProfile(profile: {
    user_id: string;
    goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
    frequency: '2 days/week' | '3 days/week' | '4 days/week';
  }) {
    try {
      console.log('🌐 Supabase에 프로필 생성 중...');
      console.log('   프로필 데이터:', {
        user_id: profile.user_id,
        goal: profile.goal,
        frequency: profile.frequency
      });
      
      // FK 제약조건이 제거되었으므로 임시 UUID로도 삽입 가능
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select();

      if (error) {
        console.error('❌ 프로필 생성 실패:', error);
        console.error('   오류 코드:', error.code);
        console.error('   오류 메시지:', error.message);
        console.error('   오류 세부사항:', error.details);
        
        // FK 오류인 경우 안내
        if (error.code === '23503') {
          throw new Error(`Foreign Key 제약조건 오류: Supabase 대시보드에서 FK 제약조건을 제거해주세요. (${error.message})`);
        }
        
        throw new Error(`사용자 프로필 생성 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('프로필이 생성되었지만 데이터를 반환받지 못했습니다.');
      }

      console.log('✅ 프로필 생성 성공:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ 프로필 생성 중 예외 발생:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<{
    goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
    frequency: '2 days/week' | '3 days/week' | '4 days/week';
    assigned_routine_id: string;
  }>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 프로필 업데이트 실패: ${error.message}`);
    }

    return data;
  }

  // 루틴 관련 메서드
  static async getRoutines(goal?: string, frequency?: string) {
    let query = supabase.from('routines').select('*');

    if (goal) {
      query = query.eq('goal', goal);
    }

    if (frequency) {
      query = query.eq('frequency', frequency);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`루틴 조회 실패: ${error.message}`);
    }

    return data;
  }

  static async getRoutineById(routineId: string) {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (error) {
      throw new Error(`루틴 조회 실패: ${error.message}`);
    }

    return data;
  }

  // 루틴 운동 관련 메서드
  static async getRoutineExercises(routineId: string, dayOfWeek: number) {
    const { data, error } = await supabase
      .from('routine_exercises')
      .select(`
        *,
        exercises (
          id,
          name,
          description,
          video_url,
          tips,
          muscle_groups,
          equipment,
          difficulty
        )
      `)
      .eq('routine_id', routineId)
      .eq('day_of_week', dayOfWeek)
      .order('order_index');

    if (error) {
      throw new Error(`루틴 운동 조회 실패: ${error.message}`);
    }

    return data;
  }

  // 운동 관련 메서드
  static async getExerciseById(exerciseId: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      throw new Error(`운동 조회 실패: ${error.message}`);
    }

    return data;
  }

  static async getExercisesByDifficulty(difficulty: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', difficulty);

    if (error) {
      throw new Error(`운동 조회 실패: ${error.message}`);
    }

    return data;
  }

  // 대체 운동 관련 메서드
  static async getAlternativeExercises(exerciseId: string) {
    const { data, error } = await supabase
      .from('alternative_exercises')
      .select(`
        alternative_exercise_id,
        exercises!alternative_exercise_id (
          id,
          name,
          description,
          video_url,
          tips,
          muscle_groups,
          equipment,
          difficulty
        )
      `)
      .eq('exercise_id', exerciseId);

    if (error) {
      throw new Error(`대체 운동 조회 실패: ${error.message}`);
    }

    return data.map(item => item.exercises);
  }

  static async getRandomAlternativeExercise(exerciseId: string) {
    const alternatives = await this.getAlternativeExercises(exerciseId);
    
    if (alternatives.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * alternatives.length);
    return alternatives[randomIndex];
  }

  // 사용자 루틴 할당 관련 메서드
  static async assignRoutineToUser(userId: string, routineId: string) {
    const { data, error } = await supabase
      .from('user_routines')
      .upsert({
        user_id: userId,
        routine_id: routineId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`루틴 할당 실패: ${error.message}`);
    }

    return data;
  }

  static async getUserRoutine(userId: string) {
    const { data, error } = await supabase
      .from('user_routines')
      .select(`
        *,
        routines (
          id,
          name,
          description,
          goal,
          frequency,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      // 사용자 루틴이 없는 경우는 에러가 아닌 null 반환
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`사용자 루틴 조회 실패: ${error.message}`);
    }

    return data;
  }

  // 운동 로그 관련 메서드
  static async logWorkout(workoutLog: {
    user_id: string;
    exercise_id: string;
    routine_id: string;
    sets_completed: number;
    reps_completed?: string;
    weight_used?: number;
  }) {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert(workoutLog)
      .select()
      .single();

    if (error) {
      throw new Error(`운동 로그 기록 실패: ${error.message}`);
    }

    return data;
  }

  static async getUserWorkoutLogs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select(`
        *,
        exercises (
          id,
          name
        ),
        routines (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`운동 로그 조회 실패: ${error.message}`);
    }

    return data;
  }

  // PRD 요구사항에 따른 루틴 매핑 로직
  static async getRoutineByUserPreferences(goal: string, frequency: string) {
    try {
      console.log('🌐 Supabase에서 루틴 조회 중...');
      console.log(`   목표: ${goal}, 빈도: ${frequency}`);
      
      // 먼저 모든 루틴을 조회해서 데이터가 있는지 확인
      const { data: allRoutines, error: allError } = await supabase
        .from('routines')
        .select('*');

      if (allError) {
        console.error('❌ 전체 루틴 조회 실패:', allError);
        throw new Error(`루틴 조회 실패: ${allError.message}`);
      }

      console.log('📊 전체 루틴 데이터:', allRoutines);
      console.log('📊 루틴 개수:', allRoutines?.length || 0);

      // 데이터가 없으면 시드 데이터 생성 제안
      if (!allRoutines || allRoutines.length === 0) {
        console.log('⚠️ 데이터베이스에 루틴 데이터가 없습니다. 시드 데이터를 실행해주세요.');
        throw new Error('데이터베이스에 루틴 데이터가 없습니다. 시드 데이터를 먼저 생성해주세요.');
      }
      
      // 조건에 맞는 루틴 조회 - .single() 대신 배열로 조회
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('goal', goal)
        .eq('frequency', frequency)
        .eq('difficulty', 'beginner')
        .limit(1);

      if (error) {
        console.error('❌ 조건부 루틴 조회 실패:', error);
        console.error('   조회 조건:', { goal, frequency, difficulty: 'beginner' });
        throw new Error(`루틴 매핑 실패: ${error.message}`);
      }

      // 결과가 없는 경우 처리
      if (!data || data.length === 0) {
        console.log('⚠️ 조건에 맞는 루틴이 없습니다.');
        console.log('   사용 가능한 루틴들:', allRoutines.map(r => ({
          goal: r.goal,
          frequency: r.frequency,
          difficulty: r.difficulty
        })));
        
        // 대안: 같은 목표의 다른 빈도 루틴 찾기
        const { data: alternativeData, error: altError } = await supabase
          .from('routines')
          .select('*')
          .eq('goal', goal)
          .eq('difficulty', 'beginner')
          .limit(1);

        if (altError || !alternativeData || alternativeData.length === 0) {
          throw new Error(`조건에 맞는 루틴을 찾을 수 없습니다. 목표: ${goal}, 빈도: ${frequency}`);
        }

        console.log('✅ 대안 루틴 조회 성공:', alternativeData[0]);
        return alternativeData[0];
      }

      console.log('✅ 루틴 조회 성공:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ 루틴 조회 중 예외 발생:', error);
      throw error;
    }
  }  // 오늘의 운동 조회 (사용자 ID와 요일 기반)
  static async getTodaysWorkout(userId: string, dayOfWeek: number) {
    // 사용자의 할당된 루틴 조회
    const userRoutine = await this.getUserRoutine(userId);
    
    if (!userRoutine) {
      throw new Error('사용자에게 할당된 루틴이 없습니다.');
    }

    // 해당 요일의 운동 조회
    const routineExercises = await this.getRoutineExercises(
      userRoutine.routine_id,
      dayOfWeek
    );

    return {
      routine: userRoutine.routines,
      exercises: routineExercises
    };
  }

  // 운동 완료 상태 확인
  static async checkWorkoutCompletion(userId: string, routineId: string, dayOfWeek: number) {
    // 해당 요일의 모든 운동 조회
    const routineExercises = await this.getRoutineExercises(routineId, dayOfWeek);
    
    // 오늘 완료된 운동 로그 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: completedLogs, error } = await supabase
      .from('workout_logs')
      .select('exercise_id')
      .eq('user_id', userId)
      .eq('routine_id', routineId)
      .gte('completed_at', today.toISOString());

    if (error) {
      throw new Error(`운동 완료 상태 확인 실패: ${error.message}`);
    }

    const completedExerciseIds = new Set(completedLogs.map(log => log.exercise_id));
    const totalExercises = routineExercises.length;
    const completedExercises = routineExercises.filter(ex => 
      completedExerciseIds.has(ex.exercise_id)
    ).length;

    return {
      total: totalExercises,
      completed: completedExercises,
      isComplete: completedExercises === totalExercises
    };
  }
}

// 유틸리티 함수들
export const DatabaseUtils = {
  // 요일 번호를 문자열로 변환
  getDayName(dayNumber: number): string {
    const days = ['', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    return days[dayNumber] || '알 수 없음';
  },

  // 요일 번호를 영어로 변환
  getDayNameEnglish(dayNumber: number): string {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber] || 'Unknown';
  },

  // 현재 요일 번호 반환 (1-7, 월요일=1)
  getCurrentDayOfWeek(): number {
    const day = new Date().getDay();
    return day === 0 ? 7 : day; // 일요일을 7로 변환
  },

  // 운동 그룹별 이름 생성
  getWorkoutDayName(exercises: any[]): string {
    const muscleGroups = new Set<string>();
    
    exercises.forEach(exercise => {
      if (exercise.exercises?.muscle_groups) {
        exercise.exercises.muscle_groups.forEach((group: string) => {
          muscleGroups.add(group);
        });
      }
    });

    const groupNames: { [key: string]: string } = {
      'chest': '가슴',
      'back': '등',
      'legs': '하체',
      'shoulders': '어깨',
      'biceps': '이두근',
      'triceps': '삼두근',
      'core': '코어',
      'glutes': '둔근'
    };

    const koreanGroups = Array.from(muscleGroups)
      .map(group => groupNames[group] || group)
      .filter(Boolean);

    return koreanGroups.join(' & ') || '전신';
  }
};

