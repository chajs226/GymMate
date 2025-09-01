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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DatabaseService } from '../services/database';
import { UserService } from '../services/UserService';
import { WorkoutStateService, WorkoutSession } from '../services/WorkoutStateService';
import { SyncService } from '../services/SyncService';
import { RoutineExercise, Exercise } from '../types/database';
import WorkoutCompletionModal from '../components/WorkoutCompletionModal';
import { useStyles } from '../styles/useStyles';
import { theme } from '../styles/theme';

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
  const commonStyles = useStyles();
  
  return (
    <View style={workoutStyles.exerciseCard}>
      <TouchableOpacity 
        style={workoutStyles.exerciseContent}
        onPress={onExercisePress}
        activeOpacity={0.7}
      >
        <View>
          <Text style={workoutStyles.exerciseName}>{exercise.exercises.name}</Text>
          <Text style={workoutStyles.exerciseDetails}>
            {exercise.sets}세트 × {exercise.reps}회
          </Text>
          {exercise.rest_time && (
            <Text style={workoutStyles.restTime}>휴식: {exercise.rest_time}초</Text>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[commonStyles.checkbox, isCompleted && commonStyles.checkboxChecked]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        {isCompleted && (
          <Text style={commonStyles.checkboxText}>✓</Text>
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userName, setUserName] = useState('GymMate 사용자');
  
  const styles = useStyles();

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
        
        // 완료 모달 표시
        setTimeout(() => {
          setShowCompletionModal(true);
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

  const getCompletedExercisesWithDetails = () => {
    if (!currentSession) return [];
    
    return exercises
      .filter(exercise => currentSession.completedExercises.has(exercise.exercise_id))
      .map(exercise => ({
        ...exercise.exercises,
        sets: exercise.sets,
        reps: exercise.reps,
      }));
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  useEffect(() => {
    loadTodaysWorkout();
  }, []);

  // 화면 포커스 시 현재 세션 상태 새로고침
  useFocusEffect(
    React.useCallback(() => {
      const refreshSession = async () => {
        if (userRoutineId && currentSession) {
          try {
            const userId = await UserService.getCurrentUserId();
            const currentDay = getCurrentDayOfWeek();
            
            // 현재 세션 상태 다시 로드
            const updatedSession = await WorkoutStateService.getCurrentSession(
              userId,
              userRoutineId,
              currentDay
            );
            
            setCurrentSession(updatedSession);
            console.log('🔄 세션 상태 새로고침 완료');
          } catch (error) {
            console.warn('⚠️ 세션 새로고침 실패:', error);
          }
        }
      };

      refreshSession();
    }, [userRoutineId, currentSession?.id])
  );

  // 세션 완료 상태 모니터링 (중복 Alert 방지를 위해 제거)
  // toggleExerciseComplete에서 직접 처리함

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>오늘의 운동을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { total, completed, percentage } = getCompletionProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={workoutStyles.header}>
        <Text style={styles.textHeading2}>{workoutTitle}</Text>
        <View style={styles.rowBetween}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressBarFill, { width: `${percentage}%` }]}
            />
          </View>
          <Text style={[styles.textBodySecondary, workoutStyles.progressText]}>
            {completed}/{total} 완료
          </Text>
        </View>
      </View>

      {exercises.length === 0 ? (
        <View style={workoutStyles.emptyContainer}>
          <Text style={workoutStyles.emptyText}>오늘은 휴식일입니다! 🏖️</Text>
          <Text style={workoutStyles.emptySubtext}>내일 다시 만나요!</Text>
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
          contentContainerStyle={workoutStyles.exercisesList}
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

      {/* 운동 완료 모달 */}
      <WorkoutCompletionModal
        visible={showCompletionModal}
        onClose={handleCloseCompletionModal}
        userName={userName}
        workoutDate={new Date().toISOString()}
        workoutTitle={workoutTitle}
        completedExercises={getCompletedExercisesWithDetails()}
      />
    </SafeAreaView>
  );
};

// 컴포넌트 전용 스타일
const workoutStyles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },

  progressText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    minWidth: 80,
    textAlign: 'right',
  },
  exercisesList: {
    padding: theme.spacing.lg,
  },
  exerciseCard: {
    ...theme.stylePresets.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.base,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    ...theme.stylePresets.text.heading3,
    marginBottom: theme.spacing.xs,
  },
  exerciseDetails: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  restTime: {
    ...theme.stylePresets.text.caption,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['3xl'],
  },
  emptyText: {
    ...theme.stylePresets.text.heading2,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.stylePresets.text.bodySecondary,
    textAlign: 'center',
  },
});

export default TodaysWorkoutScreen;
