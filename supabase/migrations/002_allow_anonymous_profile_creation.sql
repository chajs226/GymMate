-- 임시 정책: 익명 사용자도 프로필 생성 가능하도록 수정
-- 주의: 이는 임시 해결책이며, 실제 프로덕션에서는 인증 후 사용해야 합니다.

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 새로운 정책 생성 (익명 사용자도 삽입 가능)
CREATE POLICY "Allow anonymous profile creation" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- 익명 사용자도 프로필 조회 가능하도록 정책 수정
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

CREATE POLICY "Allow profile viewing" ON user_profiles
    FOR SELECT USING (true);

-- 익명 사용자도 프로필 업데이트 가능하도록 정책 수정
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Allow profile updates" ON user_profiles
    FOR UPDATE USING (true);

-- 익명 사용자도 루틴 정보를 읽을 수 있도록 정책 수정
DROP POLICY IF EXISTS "Authenticated users can view routines" ON routines;

CREATE POLICY "Allow routine viewing" ON routines
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can view routine exercises" ON routine_exercises;

CREATE POLICY "Allow routine exercises viewing" ON routine_exercises
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;

CREATE POLICY "Allow exercises viewing" ON exercises
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can view alternative exercises" ON alternative_exercises;

CREATE POLICY "Allow alternative exercises viewing" ON alternative_exercises
    FOR SELECT USING (true);
