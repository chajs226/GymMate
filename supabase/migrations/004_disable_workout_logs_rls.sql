-- 간단한 해결책: workout_logs 테이블의 RLS 비활성화
-- 개발/테스트 환경에서 임시 UUID 사용자들이 자유롭게 데이터를 삽입할 수 있도록 함

-- workout_logs 테이블의 RLS 비활성화
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;

-- 기존 정책들 모두 제거
DROP POLICY IF EXISTS "workout_logs_policy" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can view their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Allow all users to insert workout logs" ON workout_logs;

-- 확인: RLS 상태 체크
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'workout_logs';
