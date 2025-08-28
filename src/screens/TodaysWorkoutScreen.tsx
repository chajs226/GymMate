import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService } from '../services/database';
import { UserService } from '../services/UserService';
import { WorkoutStateService, WorkoutSession } from '../services/WorkoutStateService';
import { SyncService } from '../services/SyncService';
import { RoutineExercise, Exercise } from '../types/database';

interface ExerciseCardProps {
  exercise: RoutineExercise & { exercises: Exercise };
  isCompleted: boolean;
  onToggleComplete: () => void;
  onExercisePress: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isCompleted,
  onToggleComplete,
  onExercisePress,
}) => {
  return (
    <View style={styles.exerciseCard}>
      <TouchableOpacity 
        style={styles.exerciseContent}
        onPress={onExercisePress}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.exercises.name}</Text>
          <Text style={styles.exerciseDetails}>
            {exercise.sets}세트 × {exercise.reps}회
          </Text>
          {exercise.rest_time && (
            <Text style={styles.restTime}>휴식: {exercise.rest_time}초</Text>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        {isCompleted && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const TodaysWorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<(RoutineExercise & { exercises: Exercise })[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [userRoutineId, setUserRoutineId] = useState<string | null>(null);

  // 현재 요일 계산 (1: 월요일, 7: 일요일)
  const getCurrentDayOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 7 : day; // 일요일을 7로 변경
  };

  const loadTodaysWorkout = async () => {
    try {
      setLoading(true);
      
      // 자동 동기화 실행 (백그라운드)
      SyncService.setupAutoSync().catch(error => {
        console.warn('⚠️ 자동 동기화 실패 (무시됨):', error);
      });
      
      // 사용자 ID 가져오기
      const userId = await UserService.getCurrentUserId();
      const currentDay = getCurrentDayOfWeek();
      
      console.log('🔍 오늘의 운동 조회 중...');
      console.log(`   사용자 ID: ${userId}`);
      console.log(`   요일: ${currentDay}`);
      
      // 사용자의 할당된 루틴 조회
      const userRoutine = await DatabaseService.getUserRoutine(userId);
      
      if (!userRoutine) {
        // 사용자에게 할당된 루틴이 없는 경우, 임시로 첫 번째 루틴 사용
        console.log('⚠️ 사용자 루틴이 없음, 기본 루틴 사용');
        const routines = await DatabaseService.getRoutines();
        if (routines && routines.length > 0) {
          setUserRoutineId(routines[0].id);
          setWorkoutTitle(`${getDayName(currentDay)}: 기본 운동`);
          
          // 해당 요일의 운동 조회
          const routineExercises = await DatabaseService.getRoutineExercises(
            routines[0].id,
            currentDay
          );
          
          setExercises(routineExercises);
          
          // 운동 세션 로드/생성
          const session = await WorkoutStateService.getCurrentSession(
            userId,
            routines[0].id,
            currentDay
          );
          setCurrentSession(session);
        } else {
          Alert.alert('오류', '사용 가능한 루틴이 없습니다.');
        }
      } else {
        setUserRoutineId(userRoutine.routine_id);
        setWorkoutTitle(`${getDayName(currentDay)}: ${userRoutine.routines?.name || '운동'}`);
        
        // 해당 요일의 운동 조회
        const routineExercises = await DatabaseService.getRoutineExercises(
          userRoutine.routine_id,
          currentDay
        );
        
        setExercises(routineExercises);
        
        // 운동 세션 로드/생성
        const session = await WorkoutStateService.getCurrentSession(
          userId,
          userRoutine.routine_id,
          currentDay
        );
        setCurrentSession(session);
      }
      
      console.log('✅ 오늘의 운동 로드 완료');
    } catch (error) {
      console.error('❌ 오늘의 운동 로드 실패:', error);
      Alert.alert('오류', '운동 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    return days[dayOfWeek - 1];
  };

  const toggleExerciseComplete = async (exerciseId: string) => {
    if (!currentSession) {
      console.warn('⚠️ 현재 세션이 없어서 운동 완료 상태를 변경할 수 없습니다.');
      return;
    }

    try {
      // 운동 완료 상태 토글
      const updatedSession = await WorkoutStateService.toggleExerciseCompletion(
        currentSession,
        exerciseId
      );
      
      setCurrentSession(updatedSession);
      
      // 모든 운동이 완료되었는지 확인
      const completedSession = await WorkoutStateService.completeSessionIfAllDone(
        updatedSession,
        exercises.length
      );
      
      if (completedSession.isCompleted && !currentSession.isCompleted) {
        setCurrentSession(completedSession);
        
        // 완료 축하 메시지 표시
        setTimeout(() => {
          Alert.alert(
            '운동 완료! 🎉',
            '오늘의 모든 운동을 완료했습니다!\n훌륭한 운동이었어요!',
            [{ text: '확인', style: 'default' }]
          );
        }, 100);
      }
    } catch (error) {
      console.error('❌ 운동 완료 상태 변경 실패:', error);
      Alert.alert('오류', '운동 완료 상태를 변경하는데 실패했습니다.');
    }
  };

  const handleExercisePress = (exercise: RoutineExercise & { exercises: Exercise }) => {
    console.log('운동 상세 화면으로 이동:', exercise.exercises.name);
    navigation.navigate('ExerciseDetail', {
      exerciseId: exercise.exercise_id,
      exerciseName: exercise.exercises.name,
    });
  };

  const getCompletionProgress = () => {
    const total = exercises.length;
    const completed = currentSession ? currentSession.completedExercises.size : 0;
    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  useEffect(() => {
    loadTodaysWorkout();
  }, []);

  // 세션 완료 상태 모니터링 (중복 Alert 방지를 위해 제거)
  // toggleExerciseComplete에서 직접 처리함

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>오늘의 운동을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { total, completed, percentage } = getCompletionProgress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{workoutTitle}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${percentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {completed}/{total} 완료
          </Text>
        </View>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>오늘은 휴식일입니다! 🏖️</Text>
          <Text style={styles.emptySubtext}>내일 다시 만나요!</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              isCompleted={currentSession ? currentSession.completedExercises.has(item.exercise_id) : false}
              onToggleComplete={() => toggleExerciseComplete(item.exercise_id)}
              onExercisePress={() => handleExercisePress(item)}
            />
          )}
          contentContainerStyle={styles.exercisesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 디버깅 버튼 (개발 모드에서만 표시) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={loadTodaysWorkout}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>🔄 운동 데이터 새로고침</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => WorkoutStateService.debugPrintStorageState()}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>📱 스토리지 상태 출력</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              const result = await SyncService.performFullSync();
              Alert.alert(
                result.success ? '동기화 완료' : '동기화 실패',
                result.message
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>☁️ 수동 동기화</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              const status = await SyncService.getSyncStatus();
              Alert.alert(
                '동기화 상태',
                `온라인: ${status.isOnline ? '✅' : '❌'}\n` +
                `마지막 동기화: ${status.lastSync ? new Date(status.lastSync).toLocaleString('ko-KR') : '없음'}\n` +
                `대기 중인 업로드: ${status.pendingUploads}개`
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>📊 동기화 상태</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.debugButton, styles.dangerButton]}
            onPress={async () => {
              await WorkoutStateService.clearAllData();
              await SyncService.clearSyncData();
              Alert.alert('초기화 완료', '모든 운동 데이터가 삭제되었습니다.');
              loadTodaysWorkout();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.debugButtonText, styles.dangerText]}>🗑️ 데이터 초기화</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  exercisesList: {
    padding: 20,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  restTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  debugContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

export default TodaysWorkoutScreen;
