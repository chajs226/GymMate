import {createClient} from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키를 가져옵니다
// 실제 프로덕션에서는 환경 변수나 보안 저장소를 사용해야 합니다
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 관련 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// 데이터베이스 테이블 타입 정의
export interface Exercise {
  id: string;
  name: string;
  description: string;
  video_url: string;
  tips: string[];
  alternative_exercise_ids: string[];
  muscle_groups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_time: number;
  order: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  goal: 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  frequency: '2 days/week' | '3 days/week' | '4 days/week';
  assigned_routine_id: string;
  created_at: string;
  updated_at: string;
} 