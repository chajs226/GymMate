import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { DatabaseService } from '../services/database';
import { Exercise } from '../types/database';

interface ExerciseDetailScreenProps {
  route: {
    params: {
      exerciseId: string;
      exerciseName?: string;
    };
  };
}

const ExerciseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId, exerciseName } = (route.params as any) || {};

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [alternativeModalVisible, setAlternativeModalVisible] = useState(false);
  const [alternativeExercise, setAlternativeExercise] = useState<Exercise | null>(null);
  const [alternativeLoading, setAlternativeLoading] = useState(false);

  useEffect(() => {
    loadExerciseDetails();
  }, [exerciseId]);

  const loadExerciseDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 운동 상세 정보 조회 중...', exerciseId);
      
      const exerciseData = await DatabaseService.getExerciseById(exerciseId);
      setExercise(exerciseData);
      
      console.log('✅ 운동 상세 정보 로드 완료:', exerciseData);
    } catch (error) {
      console.error('❌ 운동 상세 정보 로드 실패:', error);
      Alert.alert('오류', '운동 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestAlternative = async () => {
    try {
      setAlternativeLoading(true);
      setAlternativeModalVisible(true);
      
      console.log('🔍 대체 운동 조회 중...');
      const alternative = await DatabaseService.getRandomAlternativeExercise(exerciseId);
      
      if (alternative) {
        console.log('✅ 대체 운동 발견:', alternative);
        setAlternativeExercise(alternative);
      } else {
        console.log('⚠️ 대체 운동이 없습니다.');
        setAlternativeExercise(null);
      }
    } catch (error) {
      console.error('❌ 대체 운동 조회 실패:', error);
      Alert.alert('오류', '대체 운동을 찾는데 실패했습니다.');
      setAlternativeModalVisible(false);
    } finally {
      setAlternativeLoading(false);
    }
  };

  const handleAlternativeModalClose = () => {
    setAlternativeModalVisible(false);
    setAlternativeExercise(null);
  };

  const handleAlternativeExerciseSelect = () => {
    if (alternativeExercise) {
      setAlternativeModalVisible(false);
      navigation.navigate('ExerciseDetail', {
        exerciseId: alternativeExercise.id,
        exerciseName: alternativeExercise.name,
      });
    }
  };

  const handleLogWorkout = () => {
    if (!weight || !sets || !reps) {
      Alert.alert('입력 확인', '모든 필드를 입력해주세요.');
      return;
    }

    const weightNum = parseFloat(weight);
    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);

    if (isNaN(weightNum) || isNaN(setsNum) || isNaN(repsNum)) {
      Alert.alert('입력 오류', '올바른 숫자를 입력해주세요.');
      return;
    }

    Alert.alert(
      '운동 기록',
      `${exercise?.name}\n중량: ${weight}kg\n세트: ${sets}세트\n회수: ${reps}회\n\n기록을 저장하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '저장',
          onPress: () => {
            // TODO: 실제 로깅 로직 구현
            console.log('💾 운동 기록 저장:', {
              exerciseId,
              weight: weightNum,
              sets: setsNum,
              reps: repsNum,
            });
            Alert.alert('완료', '운동 기록이 저장되었습니다!');
            // 입력 필드 초기화
            setWeight('');
            setSets('');
            setReps('');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const onVideoError = (error: any) => {
    console.error('비디오 로드 오류:', error);
    setVideoError(true);
  };

  const formatTips = (tips: any): string[] => {
    if (!tips) return [];
    
    if (Array.isArray(tips)) {
      return tips;
    }
    
    if (typeof tips === 'string') {
      try {
        const parsed = JSON.parse(tips);
        return Array.isArray(parsed) ? parsed : [tips];
      } catch {
        return [tips];
      }
    }
    
    return [];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>운동 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>운동 정보를 찾을 수 없습니다.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExerciseDetails}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tips = formatTips(exercise.tips);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 운동 이름 */}
        <Text style={styles.exerciseTitle}>{exercise.name}</Text>

        {/* 비디오 섹션 */}
        <View style={styles.videoContainer}>
          {exercise.video_url && !videoError ? (
            <Video
              source={{ uri: exercise.video_url }}
              style={styles.video}
              resizeMode="contain"
              repeat={true}
              muted={true}
              paused={false}
              onError={onVideoError}
              controls={false}
              poster={undefined}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderIcon}>🎥</Text>
              <Text style={styles.videoPlaceholderText}>
                {videoError ? '비디오를 불러올 수 없습니다' : '비디오 준비 중'}
              </Text>
            </View>
          )}
        </View>

        {/* 운동 설명 */}
        {exercise.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>운동 설명</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>
        )}

        {/* 운동 팁 */}
        {tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>핵심 포인트</Text>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 운동 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운동 정보</Text>
          <View style={styles.infoGrid}>
            {exercise.equipment && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>장비</Text>
                <Text style={styles.infoValue}>{exercise.equipment}</Text>
              </View>
            )}
            {exercise.difficulty && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>난이도</Text>
                <Text style={styles.infoValue}>
                  {exercise.difficulty === 'beginner' ? '초급' :
                   exercise.difficulty === 'intermediate' ? '중급' : '고급'}
                </Text>
              </View>
            )}
            {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>타겟 근육</Text>
                <Text style={styles.infoValue}>{exercise.muscle_groups.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 대체 운동 제안 버튼 */}
        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={handleSuggestAlternative}
          activeOpacity={0.7}>
          <Text style={styles.alternativeButtonText}>🔄 대체 운동 제안</Text>
        </TouchableOpacity>

        {/* 운동 기록 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운동 기록</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>중량 (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>세트</Text>
              <TextInput
                style={styles.input}
                value={sets}
                onChangeText={setSets}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>회수</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.logButton}
            onPress={handleLogWorkout}
            activeOpacity={0.7}>
            <Text style={styles.logButtonText}>운동 기록 저장</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 대체 운동 제안 Modal */}
      <Modal
        visible={alternativeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleAlternativeModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>대체 운동 제안</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleAlternativeModalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {alternativeLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.modalLoadingText}>대체 운동을 찾는 중...</Text>
              </View>
            ) : alternativeExercise ? (
              <View style={styles.modalBody}>
                {/* 대체 운동 썸네일 */}
                <View style={styles.modalThumbnailContainer}>
                  {alternativeExercise.video_url ? (
                    <Video
                      source={{ uri: alternativeExercise.video_url }}
                      style={styles.modalThumbnail}
                      resizeMode="cover"
                      repeat={true}
                      muted={true}
                      paused={false}
                      controls={false}
                    />
                  ) : (
                    <View style={styles.modalThumbnailPlaceholder}>
                      <Text style={styles.modalThumbnailIcon}>💪</Text>
                    </View>
                  )}
                </View>

                {/* 대체 운동 정보 */}
                <Text style={styles.modalExerciseName}>{alternativeExercise.name}</Text>
                
                {alternativeExercise.description && (
                  <Text style={styles.modalExerciseDescription}>
                    {alternativeExercise.description}
                  </Text>
                )}

                {/* 대체 운동 상세 정보 */}
                <View style={styles.modalExerciseInfo}>
                  {alternativeExercise.equipment && (
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>장비:</Text>
                      <Text style={styles.modalInfoValue}>{alternativeExercise.equipment}</Text>
                    </View>
                  )}
                  {alternativeExercise.difficulty && (
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>난이도:</Text>
                      <Text style={styles.modalInfoValue}>
                        {alternativeExercise.difficulty === 'beginner' ? '초급' :
                         alternativeExercise.difficulty === 'intermediate' ? '중급' : '고급'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 액션 버튼들 */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleAlternativeModalClose}>
                    <Text style={styles.modalCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSelectButton}
                    onPress={handleAlternativeExerciseSelect}>
                    <Text style={styles.modalSelectText}>상세보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <View style={styles.modalNoAlternativeContainer}>
                  <Text style={styles.modalNoAlternativeIcon}>😔</Text>
                  <Text style={styles.modalNoAlternativeTitle}>대체 운동이 없습니다</Text>
                  <Text style={styles.modalNoAlternativeText}>
                    현재 이 운동에 대한 대체 운동이 준비되지 않았습니다.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseOnlyButton}
                  onPress={handleAlternativeModalClose}>
                  <Text style={styles.modalCloseOnlyText}>확인</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 50,
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
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  videoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  videoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
    flex: 1,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  alternativeButton: {
    backgroundColor: '#FF9500',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  alternativeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
    textAlign: 'center',
  },
  logButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: '300',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  modalBody: {
    padding: 20,
  },
  modalThumbnailContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  modalThumbnail: {
    width: '100%',
    height: '100%',
  },
  modalThumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  modalThumbnailIcon: {
    fontSize: 40,
  },
  modalExerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalExerciseDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalExerciseInfo: {
    marginBottom: 20,
  },
  modalInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modalSelectButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSelectText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalNoAlternativeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalNoAlternativeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalNoAlternativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  modalNoAlternativeText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalCloseOnlyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseOnlyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ExerciseDetailScreen;
