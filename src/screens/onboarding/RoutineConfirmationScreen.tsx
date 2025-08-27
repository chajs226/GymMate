import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { DatabaseService } from '../../services/database';
import { UserService } from '../../services/UserService';
import { Routine } from '../../types/database';
import { supabase } from '../../config/supabase';

interface RoutineConfirmationScreenProps {
  route: {
    params: {
      goal: string;
      frequency: string;
    };
  };
}

const RoutineConfirmationScreen: React.FC<RoutineConfirmationScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation();
  const { setOnboardingComplete } = useOnboarding();
  const { goal, frequency } = route.params;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      
      // 먼저 Supabase 연결 상태 확인
      console.log('🔍 Supabase 연결 상태 확인 중...');
      const connectionTest = await DatabaseService.testConnection();
      
      if (!connectionTest.connected) {
        console.error('❌ Supabase 연결 실패:', connectionTest.error);
        Alert.alert('연결 오류', 'Supabase 연결에 실패했습니다. 데이터베이스 설정을 확인해주세요.');
        return;
      }
      
      console.log('✅ Supabase 연결 성공, 루틴 조회 시작');
      const assignedRoutine = await DatabaseService.getRoutineByUserPreferences(
        goal,
        frequency,
      );
      setRoutine(assignedRoutine);
    } catch (error) {
      console.error('루틴 로드 실패:', error);
      Alert.alert('오류', '루틴을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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

  const handleComplete = async () => {
    if (!routine) return;

    try {
      setSaving(true);
      
      // 사용자 ID 가져오기 (없으면 새로 생성)
      const userId = await UserService.getCurrentUserId();
      
      // 사용자 프로필 생성
      await DatabaseService.createUserProfile({
        user_id: userId,
        goal: goal as any,
        frequency: frequency as any,
      });

      // 루틴 할당
      await DatabaseService.assignRoutineToUser(userId, routine.id);

      // 온보딩 완료 처리
      setOnboardingComplete(true);
      
      Alert.alert(
        '환영합니다!',
        '맞춤형 운동 루틴이 준비되었습니다.',
        [
          {
            text: '시작하기',
            onPress: () => {
              // 메인 앱으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ],
      );
    } catch (error) {
      console.error('프로필 생성 실패:', error);
      Alert.alert('오류', '프로필 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getGoalTitle = (goal: string) => {
    switch (goal) {
      case 'Muscle Gain':
        return '근육 증가';
      case 'Fat Loss':
        return '지방 감소';
      case 'General Fitness':
        return '전신 건강';
      default:
        return '목표';
    }
  };

  const getFrequencyTitle = (frequency: string) => {
    switch (frequency) {
      case '2 days/week':
        return '주 2회';
      case '3 days/week':
        return '주 3회';
      case '4 days/week':
        return '주 4회';
      default:
        return frequency;
    }
  };

  const getRoutineDescription = (routine: Routine) => {
    const descriptions: { [key: string]: string } = {
      'Beginner Strength 3-Day Split A':
        '초보자를 위한 3일 분할 근력 운동 루틴입니다. 가슴/삼두근, 등/이두근, 하체/어깨로 나누어 체계적으로 근육을 발달시킵니다.',
      'Beginner Fat Loss 4-Day Split':
        '초보자를 위한 4일 분할 지방 감소 루틴입니다. 상체, 하체, 유산소/코어, 전신으로 구성되어 체지방을 효과적으로 줄입니다.',
      'Beginner General Fitness 2-Day Split':
        '초보자를 위한 2일 분할 전신 운동 루틴입니다. 상체와 하체를 나누어 전반적인 건강과 체력을 향상시킵니다.',
    };
    return descriptions[routine.name] || routine.description || '';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>맞춤형 루틴을 준비하고 있습니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>루틴을 찾을 수 없습니다.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRoutine}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>3/3</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>🎉</Text>
          </View>
          
          <Text style={styles.title}>맞춤형 루틴이 준비되었습니다!</Text>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>목표</Text>
              <Text style={styles.summaryValue}>{getGoalTitle(goal)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>빈도</Text>
              <Text style={styles.summaryValue}>{getFrequencyTitle(frequency)}</Text>
            </View>
          </View>

          <View style={styles.routineCard}>
            <Text style={styles.routineTitle}>{routine.name}</Text>
            <Text style={styles.routineDescription}>
              {getRoutineDescription(routine)}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>이 루틴의 특징</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>초보자에게 적합한 난이도</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>체계적인 운동 순서</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>대체 운동 제안 기능</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>운동 자세 가이드 비디오</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {/* 디버깅 버튼 (개발 모드에서만 표시) */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.debugButton}
              onPress={debugViewAllRoutines}
              activeOpacity={0.7}>
              <Text style={styles.debugButtonText}>🔍 전체 루틴 데이터 확인</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.completeButton, saving && styles.disabledButton]}
            onPress={handleComplete}
            disabled={saving}
            activeOpacity={0.7}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.completeButtonText}>운동 시작하기</Text>
            )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 30,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  featuresContainer: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1C1C1E',
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
  completeButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RoutineConfirmationScreen;
