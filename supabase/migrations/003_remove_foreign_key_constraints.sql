-- Foreign Key 제약조건 제거 (개발용)
-- 주의: 이는 개발 단계에서만 사용하세요

-- 기존 Foreign Key 제약조건 제거
ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_user_id_fkey;

-- user_id 필드를 일반 TEXT 필드로 변경 (선택사항)
-- 또는 Foreign Key 없이 UUID 타입 유지 가능

-- 필요시 나중에 다시 추가할 수 있는 제약조건
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 다른 테이블들도 동일하게 처리
ALTER TABLE user_routines DROP CONSTRAINT IF EXISTS user_routines_user_id_fkey;
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_user_id_fkey;
