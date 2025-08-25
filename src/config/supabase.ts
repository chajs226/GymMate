import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

// Supabase 클라이언트 생성 (최소 설정)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 관련 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// 기존 타입 정의들은 새로운 타입 파일로 이동되었으므로 제거
// 새로운 타입들은 src/types/database.ts에서 import하여 사용 