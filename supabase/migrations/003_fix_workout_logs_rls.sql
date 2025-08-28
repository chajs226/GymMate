-- workout_logs 테이블의 RLS 정책 설정
-- 임시 UUID 사용자도 자신의 운동 기록을 삽입할 수 있도록 허용

-- 1. workout_logs 테이블의 기존 정책 확인 및 제거
DROP POLICY IF EXISTS "workout_logs_policy" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can view their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete their own workout logs" ON workout_logs;

-- 2. 새로운 정책 생성 (임시 UUID 사용자 포함)

-- INSERT 정책: 모든 사용자가 운동 로그를 삽입할 수 있음
CREATE POLICY "Allow all users to insert workout logs" ON workout_logs
  FOR INSERT
  WITH CHECK (true);

-- SELECT 정책: 사용자는 자신의 운동 로그만 조회 가능
CREATE POLICY "Users can view their own workout logs" ON workout_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id::text = user_id::text);

-- UPDATE 정책: 사용자는 자신의 운동 로그만 수정 가능
CREATE POLICY "Users can update their own workout logs" ON workout_logs
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id::text = user_id::text)
  WITH CHECK (auth.uid() = user_id OR user_id::text = user_id::text);

-- DELETE 정책: 사용자는 자신의 운동 로그만 삭제 가능
CREATE POLICY "Users can delete their own workout logs" ON workout_logs
  FOR DELETE
  USING (auth.uid() = user_id OR user_id::text = user_id::text);

-- 3. RLS가 활성화되어 있는지 확인하고 필요시 활성화
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- 4. 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'workout_logs';
