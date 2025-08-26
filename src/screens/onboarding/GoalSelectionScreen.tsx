import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { GOALS } from '../../types/database';
import { supabase } from '../../config/supabase';

interface GoalSelectionScreenProps {
  route: {
    params: {
      onGoalSelect: (goal: string) => void;
    };
  };
}

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { updateGoal, onboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = React.useState<string>(
    onboardingData.goal || '',
  );

  const goalOptions = [
    {
      id: 'Muscle Gain',
      title: '근육 증가',
      description: '근육량을 늘리고 힘을 키우고 싶어요',
      icon: '💪',
    },
    {
      id: 'Fat Loss',
      title: '지방 감소',
      description: '체지방을 줄이고 몸을 탄탄하게 만들고 싶어요',
      icon: '🔥',
    },
    {
      id: 'General Fitness',
      title: '전신 건강',
      description: '전반적인 건강과 체력을 향상시키고 싶어요',
      icon: '❤️',
    },
  ];

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    updateGoal(goal);
    route.params.onGoalSelect(goal);
  };

  const handleNext = () => {
    if (selectedGoal) {
      navigation.navigate('FrequencySelection', {
        goal: selectedGoal,
        onFrequencySelect: route.params.onGoalSelect, // 임시로 같은 함수 사용
      });
    }
  };

  // 디버깅용: Supabase 연결 테스트
  const debugTestConnection = async () => {
    try {
      console.log('🔍 Supabase 연결 테스트 중...');
      
      // 간단한 쿼리로 연결 상태 확인
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Supabase 연결 실패:', error);
        Alert.alert('연결 실패', `Supabase 연결 실패: ${error.message}`);
        return;
      }

      console.log('✅ Supabase 연결 성공');
      Alert.alert('연결 성공', 'Supabase 연결이 정상입니다!');
    } catch (error) {
      console.error('❌ 연결 테스트 중 오류:', error);
      Alert.alert('연결 오류', `연결 테스트 중 오류: ${error}`);
    }
  };

  // 디버깅용: 전체 루틴 데이터 조회
  const debugViewAllRoutines = async () => {
    try {
      console.log('🔍 디버깅: 전체 루틴 데이터 조회 중...');
      const { data: allRoutines, error } = await supabase
        .from('routines')
        .select('*');

      if (error) {
        console.error('❌ 전체 루틴 조회 실패:', error);
        Alert.alert('디버깅 오류', `전체 루틴 조회 실패: ${error.message}`);
        return;
      }

      console.log('📊 전체 루틴 데이터:', allRoutines);
      console.log('📊 루틴 개수:', allRoutines?.length || 0);
      
      // 각 루틴의 상세 정보를 Alert로 표시
      const routineInfo = allRoutines?.map((r: any, index: number) => 
        `${index + 1}. ${r.name}\n   목표: ${r.goal}\n   빈도: ${r.frequency}\n   난이도: ${r.difficulty}`
      ).join('\n\n') || '데이터 없음';

      Alert.alert(
        '전체 루틴 데이터',
        `총 ${allRoutines?.length || 0}개의 루틴이 있습니다:\n\n${routineInfo}`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('❌ 디버깅 중 오류:', error);
      Alert.alert('디버깅 오류', `디버깅 중 오류가 발생했습니다: ${error}`);
    }
  };

  // 디버깅용: 특정 조건으로 루틴 조회 테스트
  const debugTestSpecificQuery = async () => {
    try {
      console.log('🔍 디버깅: 특정 조건으로 루틴 조회 테스트...');
      
      // 테스트할 조건들
      const testConditions = [
        { goal: 'Muscle Gain', frequency: '2 days/week', difficulty: 'beginner' },
        { goal: 'Muscle Gain', frequency: '3 days/week', difficulty: 'beginner' },
        { goal: 'Fat Loss', frequency: '3 days/week', difficulty: 'beginner' },
        { goal: 'Fat Loss', frequency: '4 days/week', difficulty: 'beginner' },
        { goal: 'General Fitness', frequency: '2 days/week', difficulty: 'beginner' },
        { goal: 'General Fitness', frequency: '3 days/week', difficulty: 'beginner' },
      ];

      let results = '';
      
      for (const condition of testConditions) {
        console.log(`🔍 조건 테스트:`, condition);
        
        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .eq('goal', condition.goal)
          .eq('frequency', condition.frequency)
          .eq('difficulty', condition.difficulty);

        if (error) {
          console.error(`❌ 조건 ${JSON.stringify(condition)} 조회 실패:`, error);
          results += `❌ ${condition.goal} + ${condition.frequency} + ${condition.difficulty}: 실패\n`;
        } else {
          console.log(`✅ 조건 ${JSON.stringify(condition)} 조회 성공:`, data);
          results += `✅ ${condition.goal} + ${condition.frequency} + ${condition.difficulty}: ${data?.length || 0}개\n`;
        }
      }

      Alert.alert(
        '조건별 루틴 조회 테스트',
        results,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('❌ 조건 테스트 중 오류:', error);
      Alert.alert('디버깅 오류', `조건 테스트 중 오류가 발생했습니다: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>당신의 목표는 무엇인가요?</Text>
          <Text style={styles.subtitle}>
            목표에 맞는 맞춤형 운동 루틴을 제공해드릴게요
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {goalOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedGoal === option.id && styles.selectedCard,
              ]}
              onPress={() => handleGoalSelect(option.id)}
              activeOpacity={0.7}>
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                {selectedGoal === option.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          {/* 디버깅 버튼들 (개발 모드에서만 표시) */}
          {__DEV__ && (
            <>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={debugTestConnection}
                activeOpacity={0.7}>
                <Text style={styles.debugButtonText}>🔌 Supabase 연결 테스트</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.debugButton}
                onPress={debugViewAllRoutines}
                activeOpacity={0.7}>
                <Text style={styles.debugButtonText}>🔍 전체 루틴 데이터 확인</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.debugButton}
                onPress={debugTestSpecificQuery}
                activeOpacity={0.7}>
                <Text style={styles.debugButtonText}>🧪 조건별 루틴 조회 테스트</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedGoal && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!selectedGoal}
            activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 20,
  },
  debugButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GoalSelectionScreen;
