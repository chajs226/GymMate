import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase 설정
const supabaseUrl = 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

// React Native용 Supabase 클라이언트 생성 (일반 사용자용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native에서는 URL 감지 비활성화
  },
});

// 관리자용 클라이언트 (RLS 우회용) - 프로필 생성 시에만 사용
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// 인증 관련 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// 기존 타입 정의들은 새로운 타입 파일로 이동되었으므로 제거
// 새로운 타입들은 src/types/database.ts에서 import하여 사용 