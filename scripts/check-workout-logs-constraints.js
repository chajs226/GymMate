require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (환경변수가 없을 때 기본값 사용)
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key 길이:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkoutLogsConstraints() {
  try {
    console.log('🔍 workout_logs 테이블 제약조건 확인 중...');

    // 1. 현재 workout_logs 데이터 확인
    const { data: workoutLogs, error: logsError, count } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact' })
      .limit(5);

    if (logsError) {
      console.error('❌ workout_logs 조회 실패:', logsError);
    } else {
      console.log(`\n� 현재 workout_logs 데이터: ${count}개`);
      if (workoutLogs.length > 0) {
        console.log('샘플 데이터:', workoutLogs[0]);
      } else {
        console.log('🚫 workout_logs 테이블이 비어있습니다.');
      }
    }

    // 2. 사용자 루틴 확인
    const { data: userRoutines, error: routineError } = await supabase
      .from('user_routines')
      .select('*')
      .limit(5);

    if (routineError) {
      console.error('❌ user_routines 조회 실패:', routineError);
    } else {
      console.log(`\n� 사용자 루틴: ${userRoutines.length}개`);
      if (userRoutines.length > 0) {
        console.log('샘플 루틴:', userRoutines[0]);
      }
    }

    // 3. 기본 루틴 확인
    const { data: defaultRoutines, error: defaultError } = await supabase
      .from('routines')
      .select('id, name')
      .limit(3);

    if (defaultError) {
      console.error('❌ 기본 루틴 조회 실패:', defaultError);
    } else {
      console.log(`\n🏋️‍♂️ 사용 가능한 루틴: ${defaultRoutines.length}개`);
      defaultRoutines.forEach(routine => {
        console.log(`  - ${routine.name} (${routine.id})`);
      });
    }

    // 4. 실제 exercise ID 가져오기
    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(1);

    if (exerciseError) {
      console.error('❌ 운동 데이터 조회 실패:', exerciseError);
      return;
    }

    console.log(`\n💪 사용 가능한 운동: ${exercises.length}개`);
    if (exercises.length > 0) {
      console.log(`  - ${exercises[0].name} (${exercises[0].id})`);
    }

    // 5. 테스트 로그 삽입 시도 (실제 exercise_id 사용)
    console.log('\n🧪 테스트 로그 삽입 시도...');
    if (defaultRoutines.length > 0 && exercises.length > 0) {
      const testLog = {
        user_id: '98c84672-0e6c-4f10-b255-056b59c310f1', // 실제 사용자 ID 사용
        exercise_id: exercises[0].id, // 실제 운동 ID 사용
        routine_id: defaultRoutines[0].id,
        sets_completed: 3,
        reps_completed: '10',
        weight_used: 50.0,
        completed_at: new Date().toISOString()
      };

      console.log('테스트 데이터:', testLog);

      const { data: testResult, error: testError } = await supabase
        .from('workout_logs')
        .insert(testLog)
        .select();

      if (testError) {
        console.error('❌ 테스트 삽입 실패:', {
          message: testError.message,
          code: testError.code,
          details: testError.details,
          hint: testError.hint
        });
      } else {
        console.log('✅ 테스트 삽입 성공:', testResult);
        
        // 테스트 데이터 삭제
        await supabase
          .from('workout_logs')
          .delete()
          .eq('id', testResult[0].id);
        console.log('🗑️ 테스트 데이터 삭제 완료');
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
checkWorkoutLogsConstraints()
  .then(() => {
    console.log('\n✅ 제약조건 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 중 오류:', error);
    process.exit(1);
  });
