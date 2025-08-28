require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 추가 운동 데이터 (기존에 없던 운동들)
const additionalExercises = [
  {
    name: 'Plank',
    description: '코어 근력을 기르는 기본 운동',
    video_url: 'https://example.com/videos/plank.mp4',
    tips: ['몸을 일직선으로 유지하세요', '호흡을 규칙적으로 하세요', '코어에 집중하세요'],
    muscle_groups: ['core'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  },
  {
    name: 'Calf Raises',
    description: '종아리 근육을 발달시키는 운동',
    video_url: 'https://example.com/videos/calf-raises.mp4',
    tips: ['발끝으로 최대한 높이 올라가세요', '천천히 내려가세요', '종아리에 집중하세요'],
    muscle_groups: ['legs'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  }
];

// 7일 루틴 운동 스케줄
const dailyRoutineExercises = [
  // Day 1 (월요일): Chest & Triceps
  { day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 1, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { day: 1, exercise_name: 'Push-ups', sets: 3, reps: '8-12', rest_time: 60, order_index: 3 },
  { day: 1, exercise_name: 'Tricep Dips', sets: 3, reps: '8-12', rest_time: 60, order_index: 4 },

  // Day 2 (화요일): Back & Biceps
  { day: 2, exercise_name: 'Lat Pulldown', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 2, exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { day: 2, exercise_name: 'Dumbbell Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },
  { day: 2, exercise_name: 'Bicep Curls', sets: 3, reps: '10-12', rest_time: 60, order_index: 4 },

  // Day 3 (수요일): Legs & Glutes
  { day: 3, exercise_name: 'Squats', sets: 3, reps: '8-10', rest_time: 120, order_index: 1 },
  { day: 3, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { day: 3, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },
  { day: 3, exercise_name: 'Calf Raises', sets: 3, reps: '15-20', rest_time: 60, order_index: 4 },

  // Day 4 (목요일): Shoulders
  { day: 4, exercise_name: 'Overhead Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { day: 4, exercise_name: 'Lateral Raises', sets: 3, reps: '10-12', rest_time: 60, order_index: 2 },
  { day: 4, exercise_name: 'Push-ups', sets: 3, reps: '10-15', rest_time: 60, order_index: 3 },

  // Day 5 (금요일): Arms Focus
  { day: 5, exercise_name: 'Bicep Curls', sets: 4, reps: '10-12', rest_time: 60, order_index: 1 },
  { day: 5, exercise_name: 'Tricep Dips', sets: 4, reps: '8-12', rest_time: 60, order_index: 2 },
  { day: 5, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },

  // Day 6 (토요일): Full Body Light
  { day: 6, exercise_name: 'Push-ups', sets: 3, reps: '12-15', rest_time: 45, order_index: 1 },
  { day: 6, exercise_name: 'Squats', sets: 3, reps: '12-15', rest_time: 60, order_index: 2 },
  { day: 6, exercise_name: 'Lateral Raises', sets: 3, reps: '12-15', rest_time: 45, order_index: 3 },
  { day: 6, exercise_name: 'Plank', sets: 3, reps: '30-60 sec', rest_time: 60, order_index: 4 },

  // Day 7 (일요일): Recovery & Core
  { day: 7, exercise_name: 'Push-ups', sets: 2, reps: '10-15', rest_time: 60, order_index: 1 },
  { day: 7, exercise_name: 'Lunges', sets: 2, reps: '10-12 each', rest_time: 60, order_index: 2 },
  { day: 7, exercise_name: 'Plank', sets: 3, reps: '30-45 sec', rest_time: 45, order_index: 3 },
  { day: 7, exercise_name: 'Calf Raises', sets: 2, reps: '15-20', rest_time: 45, order_index: 4 }
];

async function updateForDailyRoutine() {
  try {
    console.log('매일 운동 루틴 업데이트를 시작합니다...');

    // 1. 추가 운동 삽입
    console.log('추가 운동 데이터를 삽입합니다...');
    for (const exercise of additionalExercises) {
      const { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', exercise.name)
        .single();

      if (!existingExercise) {
        const { error } = await supabase
          .from('exercises')
          .insert(exercise);

        if (error) {
          console.log(`운동 "${exercise.name}" 삽입 중 오류 (무시됨):`, error.message);
        } else {
          console.log(`✅ 운동 "${exercise.name}" 삽입 완료`);
        }
      } else {
        console.log(`운동 "${exercise.name}"는 이미 존재합니다.`);
      }
    }

    // 2. 기존 루틴 중 하나를 7일 루틴으로 변경
    console.log('기존 루틴을 7일 루틴으로 변경합니다...');
    
    // 먼저 "Beginner Strength 3-Day Split A" 루틴을 찾기
    const { data: existingRoutine, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('name', 'Beginner Strength 3-Day Split A')
      .single();

    if (routineError) {
      throw new Error(`기존 루틴 조회 실패: ${routineError.message}`);
    }

    // 기존 루틴의 운동들 삭제
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', existingRoutine.id);

    if (deleteError) {
      throw new Error(`기존 루틴 운동 삭제 실패: ${deleteError.message}`);
    }

    // 루틴 정보 업데이트
    const { error: updateError } = await supabase
      .from('routines')
      .update({
        name: 'Daily Training Program',
        description: '매일 다른 부위를 훈련하는 7일 종합 루틴 (테스트용)',
        frequency: '7 days/week'
      })
      .eq('id', existingRoutine.id);

    if (updateError) {
      console.log('⚠️ 루틴 업데이트 중 오류 (제약조건 때문일 수 있음):', updateError.message);
      console.log('수동으로 frequency를 7 days/week로 변경해주세요.');
    } else {
      console.log('✅ 루틴 정보 업데이트 완료');
    }

    // 3. 새로운 7일 운동 스케줄 삽입
    console.log('7일 운동 스케줄을 삽입합니다...');
    
    // 모든 운동 데이터 가져오기
    const { data: allExercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('*');

    if (exerciseError) {
      throw new Error(`운동 데이터 조회 실패: ${exerciseError.message}`);
    }

    const routineExerciseData = [];
    for (const re of dailyRoutineExercises) {
      const exercise = allExercises.find(e => e.name === re.exercise_name);
      
      if (exercise) {
        routineExerciseData.push({
          routine_id: existingRoutine.id,
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

    const { data: routineExerciseResult, error: routineExerciseError } = await supabase
      .from('routine_exercises')
      .insert(routineExerciseData)
      .select();

    if (routineExerciseError) {
      throw new Error(`루틴 운동 관계 삽입 실패: ${routineExerciseError.message}`);
    }

    console.log(`${routineExerciseResult.length}개의 7일 루틴 운동이 삽입되었습니다.`);
    console.log('✅ 매일 운동 루틴 업데이트가 완료되었습니다!');
    console.log('이제 온보딩에서 "Muscle Gain" + "7 days/week"를 선택하면 매일 운동 루틴을 받을 수 있습니다.');

  } catch (error) {
    console.error('❌ 업데이트 중 오류가 발생했습니다:', error.message);
  }
}

// 스크립트 실행
updateForDailyRoutine();
