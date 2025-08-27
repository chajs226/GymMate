require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (환경변수가 없을 때 기본값 사용)
const supabaseUrl = process.env.SUPABASE_URL || 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 설정이 없습니다.');
  process.exit(1);
}

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key 길이:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 기본 운동 데이터
const exercises = [
  // 가슴 운동
  {
    name: 'Barbell Bench Press',
    description: '바벨을 사용한 벤치프레스로 가슴 근육을 발달시키는 기본 운동',
    video_url: 'https://example.com/videos/barbell-bench-press.mp4',
    tips: ['벤치에 등을 완전히 붙이세요', '바를 가슴 중앙에 내리세요', '어깨를 고정하고 가슴으로 밀어내세요'],
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'barbell',
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Bench Press',
    description: '덤벨을 사용한 벤치프레스로 더 넓은 운동 범위를 제공',
    video_url: 'https://example.com/videos/dumbbell-bench-press.mp4',
    tips: ['덤벨을 균형있게 잡으세요', '가슴 높이에서 시작하세요', '통제된 움직임으로 수행하세요'],
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'dumbbell',
    difficulty: 'beginner'
  },
  {
    name: 'Machine Chest Press',
    description: '머신을 사용한 가슴 프레스로 안정적인 자세로 운동 가능',
    video_url: 'https://example.com/videos/machine-chest-press.mp4',
    tips: ['등받이에 등을 완전히 붙이세요', '가슴 높이에서 시작하세요', '가슴 근육에 집중하세요'],
    muscle_groups: ['chest', 'triceps'],
    equipment: 'machine',
    difficulty: 'beginner'
  },
  {
    name: 'Push-ups',
    description: '체중을 이용한 가슴 운동으로 어디서나 할 수 있는 운동',
    video_url: 'https://example.com/videos/push-ups.mp4',
    tips: ['몸을 일직선으로 유지하세요', '가슴이 바닥에 닿을 때까지 내려가세요', '코어를 긴장시키세요'],
    muscle_groups: ['chest', 'triceps', 'shoulders', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  },

  // 등 운동
  {
    name: 'Lat Pulldown',
    description: '광배근을 발달시키는 효과적인 등 운동',
    video_url: 'https://example.com/videos/lat-pulldown.mp4',
    tips: ['어깨를 내리고 시작하세요', '가슴을 바에 가깝게 당기세요', '등 근육에 집중하세요'],
    muscle_groups: ['back', 'biceps'],
    equipment: 'machine',
    difficulty: 'beginner'
  },
  {
    name: 'Seated Cable Row',
    description: '케이블을 이용한 등 운동으로 등 두께를 발달시킴',
    video_url: 'https://example.com/videos/seated-cable-row.mp4',
    tips: ['등을 곧게 유지하세요', '어깨뼈를 모으면서 당기세요', '팔꿈치를 몸통에 가깝게 유지하세요'],
    muscle_groups: ['back', 'biceps'],
    equipment: 'cable',
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Row',
    description: '덤벨을 이용한 등 운동으로 한쪽씩 집중적으로 운동',
    video_url: 'https://example.com/videos/dumbbell-row.mp4',
    tips: ['무릎을 구부리고 등을 곧게 유지하세요', '어깨뼈를 모으면서 당기세요', '등 근육에 집중하세요'],
    muscle_groups: ['back', 'biceps'],
    equipment: 'dumbbell',
    difficulty: 'beginner'
  },

  // 하체 운동
  {
    name: 'Squats',
    description: '하체 전체를 발달시키는 기본 운동',
    video_url: 'https://example.com/videos/squats.mp4',
    tips: ['발을 어깨 너비로 벌리세요', '무릎이 발끝을 넘지 않도록 하세요', '가슴을 들어올리세요'],
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  },
  {
    name: 'Leg Press',
    description: '머신을 이용한 하체 운동으로 안전하게 고중량 운동 가능',
    video_url: 'https://example.com/videos/leg-press.mp4',
    tips: ['발을 어깨 너비로 벌리세요', '무릎을 완전히 펴지 마세요', '통제된 움직임으로 수행하세요'],
    muscle_groups: ['legs', 'glutes'],
    equipment: 'machine',
    difficulty: 'beginner'
  },
  {
    name: 'Lunges',
    description: '한쪽씩 집중적으로 하체를 발달시키는 운동',
    video_url: 'https://example.com/videos/lunges.mp4',
    tips: ['앞무릎이 발끝을 넘지 않도록 하세요', '상체를 곧게 유지하세요', '균형을 유지하세요'],
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  },

  // 어깨 운동
  {
    name: 'Overhead Press',
    description: '어깨 근육을 발달시키는 기본 운동',
    video_url: 'https://example.com/videos/overhead-press.mp4',
    tips: ['코어를 긴장시키세요', '어깨를 내리고 시작하세요', '통제된 움직임으로 수행하세요'],
    muscle_groups: ['shoulders', 'triceps'],
    equipment: 'barbell',
    difficulty: 'beginner'
  },
  {
    name: 'Lateral Raises',
    description: '어깨 측면을 발달시키는 운동',
    video_url: 'https://example.com/videos/lateral-raises.mp4',
    tips: ['어깨 높이까지만 올리세요', '팔을 살짝 구부리세요', '어깨 근육에 집중하세요'],
    muscle_groups: ['shoulders'],
    equipment: 'dumbbell',
    difficulty: 'beginner'
  },

  // 팔 운동
  {
    name: 'Bicep Curls',
    description: '이두근을 발달시키는 기본 운동',
    video_url: 'https://example.com/videos/bicep-curls.mp4',
    tips: ['팔꿈치를 고정하세요', '어깨를 움직이지 마세요', '이두근에 집중하세요'],
    muscle_groups: ['biceps'],
    equipment: 'dumbbell',
    difficulty: 'beginner'
  },
  {
    name: 'Tricep Dips',
    description: '삼두근을 발달시키는 체중 운동',
    video_url: 'https://example.com/videos/tricep-dips.mp4',
    tips: ['팔꿈치를 뒤로 향하게 하세요', '어깨를 내리세요', '삼두근에 집중하세요'],
    muscle_groups: ['triceps', 'chest'],
    equipment: 'bodyweight',
    difficulty: 'beginner'
  }
];

// 루틴 데이터
const routines = [
  {
    name: 'Beginner Strength 3-Day Split A',
    description: '초보자를 위한 3일 분할 근력 운동 루틴',
    goal: 'Muscle Gain',
    frequency: '3 days/week',
    difficulty: 'beginner'
  },
  {
    name: 'Beginner Strength 2-Day Split',
    description: '초보자를 위한 2일 분할 근력 운동 루틴',
    goal: 'Muscle Gain',
    frequency: '2 days/week',
    difficulty: 'beginner'
  },
  {
    name: 'Beginner Fat Loss 4-Day Split',
    description: '초보자를 위한 4일 분할 지방 감소 루틴',
    goal: 'Fat Loss',
    frequency: '4 days/week',
    difficulty: 'beginner'
  },
  {
    name: 'Beginner Fat Loss 3-Day Split',
    description: '초보자를 위한 3일 분할 지방 감소 루틴',
    goal: 'Fat Loss',
    frequency: '3 days/week',
    difficulty: 'beginner'
  },
  {
    name: 'Beginner General Fitness 2-Day Split',
    description: '초보자를 위한 2일 분할 전신 운동 루틴',
    goal: 'General Fitness',
    frequency: '2 days/week',
    difficulty: 'beginner'
  },
  {
    name: 'Beginner General Fitness 3-Day Split',
    description: '초보자를 위한 3일 분할 전신 운동 루틴',
    goal: 'General Fitness',
    frequency: '3 days/week',
    difficulty: 'beginner'
  }
];

// 루틴 운동 매핑
const routineExercises = [
  // Beginner Strength 3-Day Split A
  // Day 1: Chest & Triceps
  { routine_name: 'Beginner Strength 3-Day Split A', day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 1, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 1, exercise_name: 'Push-ups', sets: 3, reps: '8-12', rest_time: 60, order_index: 3 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 1, exercise_name: 'Tricep Dips', sets: 3, reps: '8-12', rest_time: 60, order_index: 4 },

  // Day 2: Back & Biceps
  { routine_name: 'Beginner Strength 3-Day Split A', day: 2, exercise_name: 'Lat Pulldown', sets: 3, reps: '8-10', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 2, exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 2, exercise_name: 'Dumbbell Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 2, exercise_name: 'Bicep Curls', sets: 3, reps: '10-12', rest_time: 60, order_index: 4 },

  // Day 3: Legs & Shoulders
  { routine_name: 'Beginner Strength 3-Day Split A', day: 3, exercise_name: 'Squats', sets: 3, reps: '8-10', rest_time: 120, order_index: 1 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 3, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 3, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 3, exercise_name: 'Overhead Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 4 },
  { routine_name: 'Beginner Strength 3-Day Split A', day: 3, exercise_name: 'Lateral Raises', sets: 3, reps: '10-12', rest_time: 60, order_index: 5 },

  // Beginner Fat Loss 4-Day Split
  // Day 1: Upper Body
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 1, exercise_name: 'Lat Pulldown', sets: 3, reps: '12-15', rest_time: 60, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 1, exercise_name: 'Overhead Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 3 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 1, exercise_name: 'Bicep Curls', sets: 3, reps: '12-15', rest_time: 45, order_index: 4 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 1, exercise_name: 'Tricep Dips', sets: 3, reps: '12-15', rest_time: 45, order_index: 5 },

  // Day 2: Lower Body
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 2, exercise_name: 'Squats', sets: 3, reps: '12-15', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 2, exercise_name: 'Leg Press', sets: 3, reps: '12-15', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 2, exercise_name: 'Lunges', sets: 3, reps: '12-15 each', rest_time: 60, order_index: 3 },

  // Day 3: Cardio & Core
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 3, exercise_name: 'Push-ups', sets: 3, reps: '15-20', rest_time: 45, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 3, exercise_name: 'Squats', sets: 3, reps: '15-20', rest_time: 45, order_index: 2 },

  // Day 4: Full Body
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 4, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 4, exercise_name: 'Seated Cable Row', sets: 3, reps: '12-15', rest_time: 60, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 4-Day Split', day: 4, exercise_name: 'Lateral Raises', sets: 3, reps: '12-15', rest_time: 45, order_index: 3 },

  // Beginner General Fitness 2-Day Split
  // Day 1: Upper Body
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 1, exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 1, exercise_name: 'Overhead Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 1, exercise_name: 'Bicep Curls', sets: 2, reps: '10-12', rest_time: 60, order_index: 4 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 1, exercise_name: 'Tricep Dips', sets: 2, reps: '10-12', rest_time: 60, order_index: 5 },

  // Day 2: Lower Body
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 2, exercise_name: 'Squats', sets: 3, reps: '10-12', rest_time: 120, order_index: 1 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 2, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 2, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner General Fitness 2-Day Split', day: 2, exercise_name: 'Lateral Raises', sets: 2, reps: '10-12', rest_time: 60, order_index: 4 },

  // Beginner Strength 2-Day Split
  // Day 1: Upper Body
  { routine_name: 'Beginner Strength 2-Day Split', day: 1, exercise_name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest_time: 120, order_index: 1 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 1, exercise_name: 'Lat Pulldown', sets: 4, reps: '8-10', rest_time: 120, order_index: 2 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 1, exercise_name: 'Overhead Press', sets: 3, reps: '8-10', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 1, exercise_name: 'Bicep Curls', sets: 3, reps: '10-12', rest_time: 60, order_index: 4 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 1, exercise_name: 'Tricep Dips', sets: 3, reps: '8-12', rest_time: 60, order_index: 5 },

  // Day 2: Lower Body
  { routine_name: 'Beginner Strength 2-Day Split', day: 2, exercise_name: 'Squats', sets: 4, reps: '8-10', rest_time: 150, order_index: 1 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 2, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 2, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner Strength 2-Day Split', day: 2, exercise_name: 'Lateral Raises', sets: 3, reps: '10-12', rest_time: 60, order_index: 4 },

  // Beginner Fat Loss 3-Day Split
  // Day 1: Upper Body
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 1, exercise_name: 'Lat Pulldown', sets: 3, reps: '12-15', rest_time: 60, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 1, exercise_name: 'Overhead Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 3 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 1, exercise_name: 'Bicep Curls', sets: 3, reps: '12-15', rest_time: 45, order_index: 4 },

  // Day 2: Lower Body
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 2, exercise_name: 'Squats', sets: 3, reps: '12-15', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 2, exercise_name: 'Leg Press', sets: 3, reps: '12-15', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 2, exercise_name: 'Lunges', sets: 3, reps: '12-15 each', rest_time: 60, order_index: 3 },

  // Day 3: Full Body
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 3, exercise_name: 'Push-ups', sets: 3, reps: '15-20', rest_time: 45, order_index: 1 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 3, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '12-15', rest_time: 60, order_index: 2 },
  { routine_name: 'Beginner Fat Loss 3-Day Split', day: 3, exercise_name: 'Seated Cable Row', sets: 3, reps: '12-15', rest_time: 60, order_index: 3 },

  // Beginner General Fitness 3-Day Split
  // Day 1: Upper Body
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 1, exercise_name: 'Barbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 1, exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 1, exercise_name: 'Overhead Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 3 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 1, exercise_name: 'Bicep Curls', sets: 2, reps: '10-12', rest_time: 60, order_index: 4 },

  // Day 2: Lower Body
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 2, exercise_name: 'Squats', sets: 3, reps: '10-12', rest_time: 120, order_index: 1 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 2, exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_time: 120, order_index: 2 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 2, exercise_name: 'Lunges', sets: 3, reps: '10-12 each', rest_time: 90, order_index: 3 },

  // Day 3: Full Body
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 3, exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_time: 90, order_index: 1 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 3, exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest_time: 90, order_index: 2 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 3, exercise_name: 'Lateral Raises', sets: 3, reps: '10-12', rest_time: 60, order_index: 3 },
  { routine_name: 'Beginner General Fitness 3-Day Split', day: 3, exercise_name: 'Tricep Dips', sets: 2, reps: '10-12', rest_time: 60, order_index: 4 }
];

// 대체 운동 관계
const alternativeExerciseRelations = [
  // Barbell Bench Press 대체 운동들
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Dumbbell Bench Press' },
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Machine Chest Press' },
  { exercise_name: 'Barbell Bench Press', alternative_name: 'Push-ups' },

  // Dumbbell Bench Press 대체 운동들
  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Machine Chest Press' },
  { exercise_name: 'Dumbbell Bench Press', alternative_name: 'Push-ups' },

  // Machine Chest Press 대체 운동들
  { exercise_name: 'Machine Chest Press', alternative_name: 'Barbell Bench Press' },
  { exercise_name: 'Machine Chest Press', alternative_name: 'Dumbbell Bench Press' },
  { exercise_name: 'Machine Chest Press', alternative_name: 'Push-ups' },

  // Lat Pulldown 대체 운동들
  { exercise_name: 'Lat Pulldown', alternative_name: 'Seated Cable Row' },
  { exercise_name: 'Lat Pulldown', alternative_name: 'Dumbbell Row' },

  // Seated Cable Row 대체 운동들
  { exercise_name: 'Seated Cable Row', alternative_name: 'Lat Pulldown' },
  { exercise_name: 'Seated Cable Row', alternative_name: 'Dumbbell Row' },

  // Squats 대체 운동들
  { exercise_name: 'Squats', alternative_name: 'Leg Press' },
  { exercise_name: 'Squats', alternative_name: 'Lunges' },

  // Leg Press 대체 운동들
  { exercise_name: 'Leg Press', alternative_name: 'Squats' },
  { exercise_name: 'Leg Press', alternative_name: 'Lunges' }
];

async function seedData() {
  try {
    console.log('데이터 시딩을 시작합니다...');

    // 1. 운동 데이터 삽입
    console.log('운동 데이터를 삽입합니다...');
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .insert(exercises)
      .select();

    if (exerciseError) {
      throw new Error(`운동 데이터 삽입 실패: ${exerciseError.message}`);
    }

    console.log(`${exerciseData.length}개의 운동이 삽입되었습니다.`);

    // 2. 루틴 데이터 삽입
    console.log('루틴 데이터를 삽입합니다...');
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert(routines)
      .select();

    if (routineError) {
      throw new Error(`루틴 데이터 삽입 실패: ${routineError.message}`);
    }

    console.log(`${routineData.length}개의 루틴이 삽입되었습니다.`);

    // 3. 루틴 운동 관계 삽입
    console.log('루틴 운동 관계를 삽입합니다...');
    const routineExerciseData = [];
    
    for (const re of routineExercises) {
      const routine = routineData.find(r => r.name === re.routine_name);
      const exercise = exerciseData.find(e => e.name === re.exercise_name);
      
      if (routine && exercise) {
        routineExerciseData.push({
          routine_id: routine.id,
          exercise_id: exercise.id,
          day_of_week: re.day,
          sets: re.sets,
          reps: re.reps,
          rest_time: re.rest_time,
          order_index: re.order_index
        });
      }
    }

    const { data: routineExerciseResult, error: routineExerciseError } = await supabase
      .from('routine_exercises')
      .insert(routineExerciseData)
      .select();

    if (routineExerciseError) {
      throw new Error(`루틴 운동 관계 삽입 실패: ${routineExerciseError.message}`);
    }

    console.log(`${routineExerciseResult.length}개의 루틴 운동 관계가 삽입되었습니다.`);

    // 4. 대체 운동 관계 삽입
    console.log('대체 운동 관계를 삽입합니다...');
    const alternativeExerciseData = [];
    
    for (const relation of alternativeExerciseRelations) {
      const exercise = exerciseData.find(e => e.name === relation.exercise_name);
      const alternative = exerciseData.find(e => e.name === relation.alternative_name);
      
      if (exercise && alternative) {
        alternativeExerciseData.push({
          exercise_id: exercise.id,
          alternative_exercise_id: alternative.id
        });
      }
    }

    const { data: alternativeExerciseResult, error: alternativeExerciseError } = await supabase
      .from('alternative_exercises')
      .insert(alternativeExerciseData)
      .select();

    if (alternativeExerciseError) {
      throw new Error(`대체 운동 관계 삽입 실패: ${alternativeExerciseError.message}`);
    }

    console.log(`${alternativeExerciseResult.length}개의 대체 운동 관계가 삽입되었습니다.`);

    console.log('✅ 모든 데이터 시딩이 완료되었습니다!');

  } catch (error) {
    console.error('❌ 데이터 시딩 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
seedData();
