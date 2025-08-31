import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import WorkoutSummaryImage from './WorkoutSummaryImage';
import { Exercise } from '../types/database';

interface WorkoutCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  workoutDate: string;
  workoutTitle: string;
  completedExercises: (Exercise & { sets?: number; reps?: string })[];
}

const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  visible,
  onClose,
  userName,
  workoutDate,
  workoutTitle,
  completedExercises,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      setIsCapturing(true);
      
      // 이미지 캡처
      const uri = await viewShotRef.current?.capture();
      
      if (!uri) {
        throw new Error('이미지 캡처에 실패했습니다.');
      }

      setIsCapturing(false);
      setIsSharing(true);

      // 공유 옵션 설정
      const shareOptions = {
        title: '운동 완료!',
        message: `${userName}님이 ${workoutTitle}을 완료했습니다! 🎉`,
        url: `file://${uri}`,
        type: 'image/jpeg',
        subject: 'GymMate 운동 완료', // 이메일 제목용
      };

      // 네이티브 공유 시트 열기
      await Share.open(shareOptions);
      
    } catch (error) {
      console.error('공유 실패:', error);
      
      // 사용자가 취소한 경우는 오류로 처리하지 않음
      if (error.message && error.message.includes('cancelled')) {
        console.log('사용자가 공유를 취소했습니다.');
      } else {
        Alert.alert(
          '공유 실패',
          '이미지 공유 중 오류가 발생했습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      }
    } finally {
      setIsCapturing(false);
      setIsSharing(false);
    }
  };

  const formatDate = (date: string): string => {
    const today = new Date(date);
    return today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>운동 완료!</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 콘텐츠 */}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 캡처할 이미지 영역 */}
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'jpg',
              quality: 0.9,
              result: 'tmpfile',
            }}
            style={styles.imageContainer}
          >
            <WorkoutSummaryImage
              userName={userName}
              workoutDate={formatDate(workoutDate)}
              workoutTitle={workoutTitle}
              completedExercises={completedExercises}
            />
          </ViewShot>

          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>
              축하합니다! 🎉
            </Text>
            <Text style={styles.descriptionText}>
              오늘 운동을 성공적으로 완료했습니다.{'\n'}
              친구들과 성과를 공유해보세요!
            </Text>
          </View>
        </ScrollView>

        {/* 액션 버튼들 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.shareButton, (isCapturing || isSharing) && styles.disabledButton]}
            onPress={handleShare}
            disabled={isCapturing || isSharing}
            activeOpacity={0.7}
          >
            {isCapturing || isSharing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.shareButtonText}>
                  {isCapturing ? '이미지 생성 중...' : '공유 중...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.shareButtonText}>공유하기 📤</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.laterButtonText}>나중에</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 44, // closeButton과 같은 너비로 중앙 정렬
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 24,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  laterButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WorkoutCompletionModal;
