-- RLS 정책 수정: 익명 사용자도 루틴과 운동 데이터를 읽을 수 있도록 허용
-- 생성일: 2025-01-27

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can view alternative exercises" ON alternative_exercises;
DROP POLICY IF EXISTS "Authenticated users can view routines" ON routines;
DROP POLICY IF EXISTS "Authenticated users can view routine exercises" ON routine_exercises;

-- 새로운 정책 생성: 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view exercises" ON exercises
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view alternative exercises" ON alternative_exercises
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view routines" ON routines
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view routine exercises" ON routine_exercises
    FOR SELECT USING (true);
