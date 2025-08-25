import { createClient } from '@supabase/supabase-js';

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

// 기존 타입 정의들은 새로운 타입 파일로 이동되었으므로 제거
// 새로운 타입들은 src/types/database.ts에서 import하여 사용 