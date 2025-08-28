require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 대체 운동 관계 데이터
const alternativeExerciseRelations = [
  // 가슴 운동 대체 관계
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Dumbbell Bench Press' },
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Machine Chest Press' },
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Push-ups' },

  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Machine Chest Press' },
  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Push-ups' },

  { exercise_name: 'Machine Chest Press', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Machine Chest Press', alternative_name: 'Dumbbell Bench Press' },
  { exercise_name: 'Machine Chest Press', alternative_name: 'Push-ups' },

  { exercise_name: 'Push-ups', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Push-ups', alternative_name: 'Dumbbell Bench Press' },
  { exercise_name: 'Push-ups', alternative_name: 'Machine Chest Press' },

  // 등 운동 대체 관계
  { exercise_name: 'Lat Pulldown', alternative_name: 'Seated Cable Row' },
  { exercise_name: 'Lat Pulldown', alternative_name: 'Dumbbell Row' },

  { exercise_name: 'Seated Cable Row', alternative_name: 'Lat Pulldown' },
  { exercise_name: 'Seated Cable Row', alternative_name: 'Dumbbell Row' },

  { exercise_name: 'Dumbbell Row', alternative_name: 'Lat Pulldown' },
  { exercise_name: 'Dumbbell Row', alternative_name: 'Seated Cable Row' },

  // 하체 운동 대체 관계
  { exercise_name: 'Squats', alternative_name: 'Leg Press' },
  { exercise_name: 'Squats', alternative_name: 'Lunges' },

  { exercise_name: 'Leg Press', alternative_name: 'Squats' },
  { exercise_name: 'Leg Press', alternative_name: 'Lunges' },

  { exercise_name: 'Lunges', alternative_name: 'Squats' },
  { exercise_name: 'Lunges', alternative_name: 'Leg Press' },

  // 어깨 운동 대체 관계
  { exercise_name: 'Overhead Press', alternative_name: 'Lateral Raises' },
  { exercise_name: 'Overhead Press', alternative_name: 'Push-ups' },

  { exercise_name: 'Lateral Raises', alternative_name: 'Overhead Press' },
  { exercise_name: 'Lateral Raises', alternative_name: 'Push-ups' },

  // 팔 운동 대체 관계
  { exercise_name: 'Bicep Curls', alternative_name: 'Dumbbell Row' },
  { exercise_name: 'Bicep Curls', alternative_name: 'Lat Pulldown' },

  { exercise_name: 'Tricep Dips', alternative_name: 'Push-ups' },
  { exercise_name: 'Tricep Dips', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Tricep Dips', alternative_name: 'Dumbbell Bench Press' }
];

async function updateAlternativeExercises() {
  try {
    console.log('대체 운동 관계 업데이트를 시작합니다...');

    // 1. 기존 대체 운동 관계 삭제
    console.log('기존 대체 운동 관계를 삭제합니다...');
    const { error: deleteError } = await supabase
      .from('alternative_exercises')
      .delete()
      .neq('exercise_id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제

    if (deleteError) {
      console.log('⚠️ 기존 데이터 삭제 중 오류 (무시됨):', deleteError.message);
    } else {
      console.log('✅ 기존 대체 운동 관계 삭제 완료');
    }

    // 2. 모든 운동 데이터 가져오기
    console.log('운동 데이터를 가져옵니다...');
    const { data: allExercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('*');

    if (exerciseError) {
      throw new Error(`운동 데이터 조회 실패: ${exerciseError.message}`);
    }

    console.log(`총 ${allExercises.length}개의 운동이 있습니다.`);

    // 3. 대체 운동 관계 데이터 생성
    console.log('대체 운동 관계를 생성합니다...');
    const alternativeExerciseData = [];
    
    for (const relation of alternativeExerciseRelations) {
      const exercise = allExercises.find(e => e.name === relation.exercise_name);
      const alternative = allExercises.find(e => e.name === relation.alternative_name);
      
      if (exercise && alternative) {
        alternativeExerciseData.push({
          exercise_id: exercise.id,
          alternative_exercise_id: alternative.id
        });
        console.log(`✅ ${relation.exercise_name} → ${relation.alternative_name}`);
      } else {
        console.log(`⚠️ 운동을 찾을 수 없음: ${relation.exercise_name} 또는 ${relation.alternative_name}`);
      }
    }

    console.log(`삽입할 대체 운동 관계: ${alternativeExerciseData.length}개`);

    // 4. 새로운 대체 운동 관계 삽입
    if (alternativeExerciseData.length > 0) {
      const { data: result, error: insertError } = await supabase
        .from('alternative_exercises')
        .insert(alternativeExerciseData)
        .select();

      if (insertError) {
        throw new Error(`대체 운동 관계 삽입 실패: ${insertError.message}`);
      }

      console.log(`✅ ${result.length}개의 대체 운동 관계가 삽입되었습니다.`);
    }

    // 5. 결과 확인
    console.log('\n📊 대체 운동 관계 요약:');
    const exerciseGroups = {};
    
    for (const relation of alternativeExerciseRelations) {
      if (!exerciseGroups[relation.exercise_name]) {
        exerciseGroups[relation.exercise_name] = [];
      }
      exerciseGroups[relation.exercise_name].push(relation.alternative_name);
    }

    Object.entries(exerciseGroups).forEach(([exercise, alternatives]) => {
      console.log(`   ${exercise}: ${alternatives.length}개 대체 운동`);
      alternatives.forEach(alt => console.log(`     - ${alt}`));
    });

    console.log('\n✅ 대체 운동 관계 업데이트가 완료되었습니다!');
    console.log('🔥 이제 ExerciseDetailScreen에서 "대체 운동 제안" 버튼을 클릭하면');
    console.log('   적절한 대체 운동이 Modal로 표시됩니다!');

  } catch (error) {
    console.error('❌ 대체 운동 관계 업데이트 중 오류가 발생했습니다:', error.message);
  }
}

// 스크립트 실행
updateAlternativeExercises();
