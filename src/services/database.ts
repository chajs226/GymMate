import { supabase } from '../config/supabase';

// 데이터베이스 서비스 클래스
export class DatabaseService {
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
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 프로필 생성 실패: ${error.message}`);
    }

    return data;
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
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('goal', goal)
      .eq('frequency', frequency)
      .eq('difficulty', 'beginner')
      .single();

    if (error) {
      throw new Error(`루틴 매핑 실패: ${error.message}`);
    }

    return data;
  }

  // 오늘의 운동 조회 (사용자 ID와 요일 기반)
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
