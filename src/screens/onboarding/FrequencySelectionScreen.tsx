import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { FREQUENCIES } from '../../types/database';

interface FrequencySelectionScreenProps {
  route: {
    params: {
      goal: string;
      onFrequencySelect: (frequency: string) => void;
    };
  };
}

const FrequencySelectionScreen: React.FC<FrequencySelectionScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation();
  const { updateFrequency, onboardingData } = useOnboarding();
  const { goal } = route.params;
  const [selectedFrequency, setSelectedFrequency] = React.useState<string>(
    onboardingData.frequency || '',
  );

  const frequencyOptions = [
    {
      id: '2 days/week',
      title: '주 2회',
      description: '처음 시작하는 분들에게 추천',
      icon: '🌱',
      intensity: '초급',
    },
    {
      id: '3 days/week',
      title: '주 3회',
      description: '균형잡힌 운동 루틴',
      icon: '⚖️',
      intensity: '중급',
    },
    {
      id: '4 days/week',
      title: '주 4회',
      description: '빠른 결과를 원하는 분들에게 추천',
      icon: '🚀',
      intensity: '고급',
    },
    {
      id: '7 days/week',
      title: '매일 (7일)',
      description: '테스트용 - 매일 다른 부위 운동',
      icon: '🔥',
      intensity: '테스트',
    },
  ];

  const handleFrequencySelect = (frequency: string) => {
    setSelectedFrequency(frequency);
    updateFrequency(frequency);
    route.params.onFrequencySelect(frequency);
  };

  const handleNext = () => {
    if (selectedFrequency) {
      navigation.navigate('RoutineConfirmation', {
        goal,
        frequency: selectedFrequency,
      });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Text style={styles.progressText}>2/3</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>운동 빈도를 선택하세요</Text>
          <Text style={styles.subtitle}>
            {getGoalTitle(goal)} 목표에 맞는 적절한 빈도를 선택해주세요
          </Text>

          <View style={styles.optionsContainer}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedFrequency === option.id && styles.selectedCard,
                ]}
                onPress={() => handleFrequencySelect(option.id)}
                activeOpacity={0.7}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <View style={styles.optionText}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <View style={styles.intensityBadge}>
                        <Text style={styles.intensityText}>
                          {option.intensity}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {selectedFrequency === option.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedFrequency && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!selectedFrequency}
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
  mainContent: {
    flex: 1,
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
    marginBottom: 40,
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
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  intensityBadge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
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

export default FrequencySelectionScreen;
