-- workout_logs 테이블의 user_id 외래키 제약조건 제거
-- 이는 임시 UUID 사용자들도 workout_logs에 데이터를 저장할 수 있게 합니다.

-- 1. 기존 외래키 제약조건 확인 및 제거
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- workout_logs 테이블의 user_id 외래키 제약조건 찾기
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'workout_logs'::regclass 
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f'
    AND conkey @> ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'workout_logs'::regclass AND attname = 'user_id')]
    LIMIT 1;

    -- 제약조건이 존재하면 삭제
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE workout_logs DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on workout_logs.user_id';
    END IF;
END $$;

-- 2. user_id 컬럼을 NOT NULL로 유지 (데이터 무결성을 위해)
-- 외래키 제약조건만 제거하고 NOT NULL 제약조건은 유지

COMMENT ON COLUMN workout_logs.user_id IS 'User ID (no foreign key constraint to support temporary UUIDs)';

-- 3. 인덱스는 유지 (성능을 위해)
-- workout_logs(user_id, completed_at) 인덱스는 그대로 둠
