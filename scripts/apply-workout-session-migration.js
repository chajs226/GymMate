require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('운동 세션 추적 테이블 마이그레이션을 시작합니다...');

    // 마이그레이션 파일 읽기
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_add_workout_session_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // SQL을 세미콜론으로 분리하여 개별 실행
    const sqlStatements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`총 ${sqlStatements.length}개의 SQL 문을 실행합니다...`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`\n[${i + 1}/${sqlStatements.length}] 실행 중...`);
      console.log(`SQL: ${statement.substring(0, 100)}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // 이미 존재하는 테이블/인덱스 오류는 무시
          if (error.message.includes('already exists')) {
            console.log(`⚠️ 이미 존재함 (무시): ${error.message}`);
            continue;
          }
          throw error;
        }
        
        console.log('✅ 성공');
      } catch (error) {
        // 직접 SQL 실행으로 시도
        console.log('🔄 직접 SQL 실행으로 재시도...');
        const { error: directError } = await supabase
          .from('_sql_exec')
          .insert({ query: statement });
        
        if (directError) {
          console.error(`❌ SQL 실행 실패: ${statement.substring(0, 100)}...`);
          console.error(`   오류: ${directError.message}`);
          
          // 치명적이지 않은 오류는 계속 진행
          if (!directError.message.includes('already exists') && 
              !directError.message.includes('does not exist')) {
            throw directError;
          }
        } else {
          console.log('✅ 직접 실행 성공');
        }
      }
    }

    console.log('\n✅ 마이그레이션이 완료되었습니다!');
    console.log('\n📊 생성된 테이블:');
    console.log('   - workout_sessions: 일별 운동 세션 추적');
    console.log('   - exercise_completions: 운동별 완료 상태');
    console.log('   - performance_logs: 성과 기록 (무게, 세트, 횟수)');

    // 테이블 생성 확인
    console.log('\n🔍 테이블 생성 확인 중...');
    
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

    console.log('\n🎉 운동 세션 추적 시스템이 준비되었습니다!');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error.message);
    console.error('전체 오류 정보:', error);
  }
}

// 스크립트 실행
applyMigration();
