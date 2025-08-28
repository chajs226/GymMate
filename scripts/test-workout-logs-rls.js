require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (환경변수가 없을 때 기본값 사용)
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key 길이:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 간단한 UUID 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testWorkoutLogsRLS() {
  try {
    console.log('🧪 workout_logs RLS 테스트 시작...');

    // 1. 실제 exercise와 routine 데이터 가져오기
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(1);

    const { data: routines } = await supabase
      .from('routines')
      .select('id, name')
      .limit(1);

    if (!exercises?.length || !routines?.length) {
      console.error('❌ 테스트에 필요한 exercise 또는 routine 데이터가 없습니다.');
      return;
    }

    console.log('✅ 테스트 데이터 준비 완료');
    console.log(`  - Exercise: ${exercises[0].name} (${exercises[0].id})`);
    console.log(`  - Routine: ${routines[0].name} (${routines[0].id})`);

    // 2. 임시 UUID로 테스트 삽입 (실제 앱에서 사용하는 것과 동일)
    const testUserId = generateUUID(); // 실제 UUID 형식
    const testLog = {
      user_id: testUserId,
      exercise_id: exercises[0].id,
      routine_id: routines[0].id,
      sets_completed: 3,
      reps_completed: '10',
      weight_used: 50.0,
      completed_at: new Date().toISOString()
    };

    console.log('\n🔍 임시 UUID 사용자로 삽입 테스트...');
    console.log('테스트 데이터:', testLog);

    const { data: insertResult, error: insertError } = await supabase
      .from('workout_logs')
      .insert(testLog)
      .select();

    if (insertError) {
      console.error('❌ 삽입 실패:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      
      if (insertError.code === '42501') {
        console.log('\n🚨 RLS 정책 위반 감지!');
        console.log('해결 방법:');
        console.log('1. Supabase 대시보드 > SQL 편집기에서 다음 명령 실행:');
        console.log('   ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;');
        console.log('2. 또는 적절한 RLS 정책을 설정하세요.');
      }
    } else {
      console.log('✅ 삽입 성공!', insertResult);
      
      // 테스트 데이터 정리
      const { error: deleteError } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', insertResult[0].id);

      if (deleteError) {
        console.warn('⚠️ 테스트 데이터 삭제 실패:', deleteError);
      } else {
        console.log('🗑️ 테스트 데이터 정리 완료');
      }
    }

    // 3. RLS 상태 확인
    console.log('\n📊 현재 RLS 상태 확인...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_status', {
      table_name: 'workout_logs'
    });

    if (rlsError) {
      console.log('⚠️ RLS 상태 확인 실패 (정상):', rlsError.message);
    } else {
      console.log('RLS 상태:', rlsStatus);
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  }
}

// 스크립트 실행
testWorkoutLogsRLS()
  .then(() => {
    console.log('\n✅ RLS 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 중 오류:', error);
    process.exit(1);
  });
