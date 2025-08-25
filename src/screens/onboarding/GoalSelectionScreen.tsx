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
import { GOALS } from '../../types/database';

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
