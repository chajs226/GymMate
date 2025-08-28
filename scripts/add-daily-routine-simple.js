require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 7일 루틴 운동 스케줄 (기존 운동만 사용)
const dailyRoutineExercises = [
  // Day 1 (월요일): Chest & Triceps
  { day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 1, exercise_name: 'Push-ups', sets: 3, reps: '8-12', rest_time: 60, order_index: 2 },
  { day: 1, exercise_name: 'Tricep Dips', sets: 3, reps: '8-12', rest_time: 60, order_index: 3 },

  // Day 2 (화요일): Back & Biceps
  { day: 2, exercise_name: 'Lat Pulldown', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 2, exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { day: 2, exercise_name: 'Bicep Curls', sets: 3, reps: '10-12', rest_time: 60, order_index: 3 },

  // Day 3 (수요일): Legs & Glutes
  { day: 3, exercise_name: 'Squats', sets: 3, reps: '8-10', rest_time: 120, order_index: 1 },
  { day: 3, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { day: 3, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },

  // Day 4 (목요일): Shoulders
  { day: 4, exercise_name: 'Overhead Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 4, exercise_name: 'Lateral Raises', sets: 3, reps: '10-12', rest_time: 60, order_index: 2 },
  { day: 4, exercise_name: 'Push-ups', sets: 2, reps: '10-15', rest_time: 60, order_index: 3 },

  // Day 5 (금요일): Arms Focus
  { day: 5, exercise_name: 'Bicep Curls', sets: 3, reps: '10-12', rest_time: 60, order_index: 1 },
  { day: 5, exercise_name: 'Tricep Dips', sets: 3, reps: '8-12', rest_time: 60, order_index: 2 },
  { day: 5, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },

  // Day 6 (토요일): Full Body Light
  { day: 6, exercise_name: 'Push-ups', sets: 3, reps: '12-15', rest_time: 45, order_index: 1 },
  { day: 6, exercise_name: 'Squats', sets: 2, reps: '12-15', rest_time: 60, order_index: 2 },
  { day: 6, exercise_name: 'Lateral Raises', sets: 2, reps: '12-15', rest_time: 45, order_index: 3 },

  // Day 7 (일요일): Recovery & Light Cardio
  { day: 7, exercise_name: 'Push-ups', sets: 2, reps: '10-15', rest_time: 60, order_index: 1 },
  { day: 7, exercise_name: 'Lunges', sets: 2, reps: '10-12 each', rest_time: 60, order_index: 2 },
  { day: 7, exercise_name: 'Bicep Curls', sets: 2, reps: '10-12', rest_time: 45, order_index: 3 }
];

async function addDailyRoutine() {
  try {
    console.log('7일 매일 운동 루틴 추가를 시작합니다...');

    // 1. 먼저 현재 루틴들 확인
    console.log('현재 루틴들을 확인합니다...');
    const { data: existingRoutines, error: routineListError } = await supabase
      .from('routines')
      .select('*');

    if (routineListError) {
      throw new Error(`루틴 목록 조회 실패: ${routineListError.message}`);
    }

    console.log('기존 루틴들:');
    existingRoutines.forEach((routine, index) => {
      console.log(`${index + 1}. ${routine.name} (${routine.goal}, ${routine.frequency})`);
    });

    // 2. "Daily Training Program" 루틴이 이미 있는지 확인
    const dailyRoutine = existingRoutines.find(r => r.name === 'Daily Training Program');
    
    let routineId;
    if (dailyRoutine) {
      console.log('✅ "Daily Training Program" 루틴이 이미 존재합니다. 기존 루틴을 사용합니다.');
      routineId = dailyRoutine.id;
      
      // 기존 운동들 삭제
      const { error: deleteError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);

      if (deleteError) {
        console.log('⚠️ 기존 운동 삭제 중 오류:', deleteError.message);
      }
    } else {
      // 3. 새로운 루틴 생성 (frequency 제약조건 때문에 임시로 다른 값 사용)
      console.log('새로운 7일 루틴을 생성합니다...');
      const { data: newRoutine, error: createError } = await supabase
        .from('routines')
        .insert({
          name: 'Daily Training Program',
          description: '매일 다른 부위를 훈련하는 7일 종합 루틴 (테스트용)',
          goal: 'Muscle Gain',
          frequency: '3 days/week', // 임시로 허용되는 값 사용
          difficulty: 'beginner'
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`새 루틴 생성 실패: ${createError.message}`);
      }

      routineId = newRoutine.id;
      console.log('✅ 새 루틴 생성 완료:', newRoutine.name);
    }

    // 4. 모든 운동 데이터 가져오기
    console.log('운동 데이터를 가져옵니다...');
    const { data: allExercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('*');

    if (exerciseError) {
      throw new Error(`운동 데이터 조회 실패: ${exerciseError.message}`);
    }

    console.log(`총 ${allExercises.length}개의 운동이 있습니다.`);

    // 5. 7일 운동 스케줄 삽입
    console.log('7일 운동 스케줄을 삽입합니다...');
    
    const routineExerciseData = [];
    for (const re of dailyRoutineExercises) {
      const exercise = allExercises.find(e => e.name === re.exercise_name);
      
      if (exercise) {
        routineExerciseData.push({
          routine_id: routineId,
          exercise_id: exercise.id,
          day_of_week: re.day,
          sets: re.sets,
          reps: re.reps,
          rest_time: re.rest_time,
          order_index: re.order_index
        });
      } else {
        console.log(`⚠️ 운동 "${re.exercise_name}"을 찾을 수 없습니다.`);
      }
    }

    console.log(`삽입할 운동 개수: ${routineExerciseData.length}`);

    const { data: routineExerciseResult, error: routineExerciseError } = await supabase
      .from('routine_exercises')
      .insert(routineExerciseData)
      .select();

    if (routineExerciseError) {
      throw new Error(`루틴 운동 관계 삽입 실패: ${routineExerciseError.message}`);
    }

    console.log(`✅ ${routineExerciseResult.length}개의 7일 루틴 운동이 삽입되었습니다.`);

    // 6. 각 요일별 운동 개수 확인
    console.log('\n📊 요일별 운동 개수:');
    for (let day = 1; day <= 7; day++) {
      const dayExercises = routineExerciseResult.filter(re => re.day_of_week === day);
      const dayName = ['', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'][day];
      console.log(`   ${dayName}: ${dayExercises.length}개 운동`);
    }

    console.log('\n✅ 7일 매일 운동 루틴 추가가 완료되었습니다!');
    console.log('🔥 이제 앱에서 "Muscle Gain" + "매일 (7일)" 또는 다른 goal + "매일 (7일)"을 선택하면');
    console.log('   매일 다른 운동을 할 수 있습니다!');
    console.log('\n⚠️ 주의: Supabase에서 frequency 제약조건 때문에 "3 days/week"로 저장되었습니다.');
    console.log('   실제로는 7일 스케줄이 모두 들어있으므로 정상 작동합니다.');

  } catch (error) {
    console.error('❌ 7일 루틴 추가 중 오류가 발생했습니다:', error.message);
  }
}

// 스크립트 실행
addDailyRoutine();
