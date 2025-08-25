// 데이터베이스 테이블 타입 정의

export interface UserProfile {
  id: string;
  user_id: string;
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
  assigned_routine_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  video_url?: string;
  tips: string[];
  muscle_groups: string[];
  equipment?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface AlternativeExercise {
  id: string;
  exercise_id: string;
  alternative_exercise_id: string;
  created_at: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  day_of_week: number;
  sets: number;
  reps: string;
  rest_time: number;
  order_index: number;
  created_at: string;
}

export interface UserRoutine {
  id: string;
  user_id: string;
  routine_id: string;
  assigned_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_id: string;
  routine_id: string;
  sets_completed: number;
  reps_completed?: string;
  weight_used?: number;
  completed_at: string;
}

// 조인된 데이터 타입들
export interface RoutineExerciseWithExercise extends RoutineExercise {
  exercises: Exercise;
}

export interface UserRoutineWithRoutine extends UserRoutine {
  routines: Routine;
}

export interface WorkoutLogWithDetails extends WorkoutLog {
  exercises: Pick<Exercise, 'id' | 'name'>;
  routines: Pick<Routine, 'id' | 'name'>;
}

// API 응답 타입들
export interface TodaysWorkoutResponse {
  routine: Routine;
  exercises: RoutineExerciseWithExercise[];
}

export interface WorkoutCompletionStatus {
  total: number;
  completed: number;
  isComplete: boolean;
}

// 사용자 입력 타입들
export interface CreateUserProfileInput {
  user_id: string;
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
}

export interface UpdateUserProfileInput {
  goal?: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency?: '2 days/week' | '3 days/week' | '4 days/week';
  assigned_routine_id?: string;
}

export interface LogWorkoutInput {
  user_id: string;
  exercise_id: string;
  routine_id: string;
  sets_completed: number;
  reps_completed?: string;
  weight_used?: number;
}

// 루틴 매핑 타입
export interface RoutineMapping {
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
  routineName: string;
}

// 상수 정의
export const GOALS = ['Muscle Gain', 'Fat Loss', 'General Fitness'] as const;
export const FREQUENCIES = ['2 days/week', '3 days/week', '4 days/week'] as const;
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight'
] as const;

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'glutes'
] as const;

// 타입 가드 함수들
export const isGoal = (value: string): value is 'Muscle Gain' | 'Fat Loss' | 'General Fitness' => {
  return GOALS.includes(value as any);
};

export const isFrequency = (value: string): value is '2 days/week' | '3 days/week' | '4 days/week' => {
  return FREQUENCIES.includes(value as any);
};

export const isDifficulty = (value: string): value is 'beginner' | 'intermediate' | 'advanced' => {
  return DIFFICULTIES.includes(value as any);
};

export const isEquipmentType = (value: string): value is typeof EQUIPMENT_TYPES[number] => {
  return EQUIPMENT_TYPES.includes(value as any);
};

export const isMuscleGroup = (value: string): value is typeof MUSCLE_GROUPS[number] => {
  return MUSCLE_GROUPS.includes(value as any);
};

