-- GymMate MVP 초기 데이터베이스 스키마
-- 생성일: 2025-01-27

-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal TEXT CHECK (goal IN ('Muscle Gain', 'Fat Loss', 'General Fitness')) NOT NULL,
    frequency TEXT CHECK (frequency IN ('2 days/week', '3 days/week', '4 days/week')) NOT NULL,
    assigned_routine_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- 운동 테이블
CREATE TABLE exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    tips JSONB DEFAULT '[]'::jsonb,
    muscle_groups TEXT[] DEFAULT '{}',
    equipment TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 대체 운동 관계 테이블
CREATE TABLE alternative_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    alternative_exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(exercise_id, alternative_exercise_id)
);

-- 워크아웃 루틴 테이블
CREATE TABLE routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT CHECK (goal IN ('Muscle Gain', 'Fat Loss', 'General Fitness')) NOT NULL,
    frequency TEXT CHECK (frequency IN ('2 days/week', '3 days/week', '4 days/week')) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 루틴 운동 관계 테이블
CREATE TABLE routine_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
    sets INTEGER NOT NULL,
    reps TEXT NOT NULL,
    rest_time INTEGER DEFAULT 60, -- 초 단위
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(routine_id, day_of_week, order_index)
);

-- 사용자 루틴 할당 테이블
CREATE TABLE user_routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- 운동 완료 로그 테이블
CREATE TABLE workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_completed TEXT,
    weight_used DECIMAL(5,2),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX idx_alternative_exercises_exercise_id ON alternative_exercises(exercise_id);
CREATE INDEX idx_routines_goal_frequency ON routines(goal, frequency);
CREATE INDEX idx_routine_exercises_routine_day ON routine_exercises(routine_id, day_of_week);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, completed_at);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE alternative_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 운동 정책 (모든 인증된 사용자가 읽기 가능)
CREATE POLICY "Authenticated users can view exercises" ON exercises
    FOR SELECT USING (auth.role() = 'authenticated');

-- 대체 운동 정책
CREATE POLICY "Authenticated users can view alternative exercises" ON alternative_exercises
    FOR SELECT USING (auth.role() = 'authenticated');

-- 루틴 정책
CREATE POLICY "Authenticated users can view routines" ON routines
    FOR SELECT USING (auth.role() = 'authenticated');

-- 루틴 운동 정책
CREATE POLICY "Authenticated users can view routine exercises" ON routine_exercises
    FOR SELECT USING (auth.role() = 'authenticated');

-- 사용자 루틴 정책
CREATE POLICY "Users can view own routine assignment" ON user_routines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine assignment" ON user_routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routine assignment" ON user_routines
    FOR UPDATE USING (auth.uid() = user_id);

-- 운동 로그 정책
CREATE POLICY "Users can view own workout logs" ON workout_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON workout_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

