import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';
import FrequencySelectionScreen from '../screens/onboarding/FrequencySelectionScreen';
import RoutineConfirmationScreen from '../screens/onboarding/RoutineConfirmationScreen';

export type OnboardingStackParamList = {
  GoalSelection: {
    onGoalSelect: (goal: string) => void;
  };
  FrequencySelection: {
    goal: string;
    onFrequencySelect: (frequency: string) => void;
  };
  RoutineConfirmation: {
    goal: string;
    frequency: string;
  };
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      <Stack.Screen
        name="GoalSelection"
        component={GoalSelectionScreen}
        initialParams={{
          onGoalSelect: () => {},
        }}
      />
      <Stack.Screen
        name="FrequencySelection"
        component={FrequencySelectionScreen}
        initialParams={{
          goal: '',
          onFrequencySelect: () => {},
        }}
      />
      <Stack.Screen
        name="RoutineConfirmation"
        component={RoutineConfirmationScreen}
        initialParams={{
          goal: '',
          frequency: '',
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
