-- 운동 세션 및 완료 상태 추적을 위한 테이블 추가
-- 생성일: 2025-01-27

-- 운동 세션 테이블 (일별 운동 세션 추적)
CREATE TABLE workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    workout_date DATE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, workout_date)
);

-- 운동별 완료 상태 테이블
CREATE TABLE exercise_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    routine_exercise_id UUID REFERENCES routine_exercises(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(session_id, exercise_id)
);

-- 성과 로그 테이블 (ExerciseDetailScreen에서 기록된 데이터)
CREATE TABLE performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    weight DECIMAL(6,2),
    sets INTEGER,
    reps TEXT,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date);
CREATE INDEX idx_exercise_completions_session ON exercise_completions(session_id);
CREATE INDEX idx_performance_logs_user_exercise ON performance_logs(user_id, exercise_id);
CREATE INDEX idx_performance_logs_session ON performance_logs(session_id);

-- RLS 정책 설정
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;

-- 운동 세션 정책 (익명 사용자도 접근 가능하도록 설정)
CREATE POLICY "Users can manage own workout sessions" ON workout_sessions
    FOR ALL USING (true);

-- 운동 완료 상태 정책
CREATE POLICY "Users can manage own exercise completions" ON exercise_completions
    FOR ALL USING (true);

-- 성과 로그 정책
CREATE POLICY "Users can manage own performance logs" ON performance_logs
    FOR ALL USING (true);

-- 업데이트 트리거 적용
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_completions_updated_at BEFORE UPDATE ON exercise_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
