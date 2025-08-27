// 프로필 생성 테스트 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://raicdihqaxzpmqmpjtsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaWNkaWhxYXh6cG1xbXBqdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzYyMTksImV4cCI6MjA3MTYxMjIxOX0.8-E7z7e-dJ5wQgXUkTo5C-itBZU7fVPWuxbb33altKY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 임시 UUID 생성
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

async function testProfileCreation() {
  try {
    console.log('🧪 프로필 생성 테스트 시작...');
    
    const testProfile = {
      user_id: generateUUID(),
      goal: 'Muscle Gain',
      frequency: '3 days/week'
    };
    
    console.log('   테스트 프로필:', testProfile);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select();

    if (error) {
      console.error('❌ 테스트 실패:', error);
      if (error.code === '23503') {
        console.error('   → FK 제약조건이 아직 제거되지 않았습니다!');
        console.error('   → Supabase 대시보드에서 FK 제약조건을 제거해주세요.');
      }
      return;
    }

    console.log('✅ 테스트 성공! 프로필이 생성되었습니다:', data[0]);
    
    // 생성된 테스트 데이터 정리
    await supabase.from('user_profiles').delete().eq('id', data[0].id);
    console.log('🧹 테스트 데이터 정리 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 예외 발생:', error);
  }
}

testProfileCreation();
