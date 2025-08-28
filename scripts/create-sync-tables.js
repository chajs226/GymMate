require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSyncTables() {
  try {
    console.log('🔄 운동 동기화 테이블 생성을 시작합니다...');

    // 1. workout_sessions 테이블 생성
    console.log('\n📅 workout_sessions 테이블 생성 중...');
    const { error: sessionsError } = await supabase.rpc('exec_sql_raw', {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
          workout_date DATE NOT NULL,
          day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
          is_completed BOOLEAN DEFAULT false,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          UNIQUE(user_id, workout_date)
        );
      `
    });

    if (sessionsError && !sessionsError.message.includes('already exists')) {
      console.error('❌ workout_sessions 테이블 생성 실패:', sessionsError);
    } else {
      console.log('✅ workout_sessions 테이블 생성 완료');
    }

    // 2. exercise_completions 테이블 생성
    console.log('\n✅ exercise_completions 테이블 생성 중...');
    const { error: completionsError } = await supabase.rpc('exec_sql_raw', {
      sql: `
        CREATE TABLE IF NOT EXISTS exercise_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
          exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
          routine_exercise_id UUID,
          is_completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          UNIQUE(session_id, exercise_id)
        );
      `
    });

    if (completionsError && !completionsError.message.includes('already exists')) {
      console.error('❌ exercise_completions 테이블 생성 실패:', completionsError);
    } else {
      console.log('✅ exercise_completions 테이블 생성 완료');
    }

    // 3. performance_logs 테이블 생성
    console.log('\n📊 performance_logs 테이블 생성 중...');
    const { error: logsError } = await supabase.rpc('exec_sql_raw', {
      sql: `
        CREATE TABLE IF NOT EXISTS performance_logs (
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
      `
    });

    if (logsError && !logsError.message.includes('already exists')) {
      console.error('❌ performance_logs 테이블 생성 실패:', logsError);
    } else {
      console.log('✅ performance_logs 테이블 생성 완료');
    }

    // 4. 인덱스 생성
    console.log('\n🔍 인덱스 생성 중...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date);',
      'CREATE INDEX IF NOT EXISTS idx_exercise_completions_session ON exercise_completions(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_performance_logs_user_exercise ON performance_logs(user_id, exercise_id);',
      'CREATE INDEX IF NOT EXISTS idx_performance_logs_session ON performance_logs(session_id);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql_raw', { sql: indexSql });
      if (indexError && !indexError.message.includes('already exists')) {
        console.log(`⚠️ 인덱스 생성 경고: ${indexError.message}`);
      }
    }
    console.log('✅ 인덱스 생성 완료');

    // 5. 테이블 접근 확인
    console.log('\n🔍 테이블 접근 확인 중...');
    const tables = ['workout_sessions', 'exercise_completions', 'performance_logs'];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: 테이블 접근 가능`);
        }
      } catch (err) {
        console.log(`⚠️ ${tableName}: 확인 중 오류 - ${err.message}`);
      }
    }

    console.log('\n🎉 운동 동기화 테이블 설정이 완료되었습니다!');
    console.log('\n📋 생성된 테이블:');
    console.log('   - workout_sessions: 운동 세션 추적');
    console.log('   - exercise_completions: 운동별 완료 상태');
    console.log('   - performance_logs: 성과 기록 (무게, 세트, 횟수)');

  } catch (error) {
    console.error('❌ 테이블 생성 중 오류가 발생했습니다:', error.message);
    console.error('전체 오류 정보:', error);
  }
}

// 스크립트 실행
createSyncTables();
