import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// 임시 화면 컴포넌트들
import {View, Text, StyleSheet} from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 탭 아이콘 컴포넌트들
const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{color, fontSize: size}}>🏠</Text>
);

const WorkoutIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{color, fontSize: size}}>💪</Text>
);

const ProgressIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{color, fontSize: size}}>📊</Text>
);

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{color, fontSize: size}}>👤</Text>
);

// 임시 홈 화면
const HomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>오늘의 운동</Text>
    <Text style={styles.subtitle}>GymMate에 오신 것을 환영합니다!</Text>
  </View>
);

// 임시 운동 화면
const WorkoutScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>운동</Text>
    <Text style={styles.subtitle}>운동 화면이 여기에 표시됩니다.</Text>
  </View>
);

// 임시 진행상황 화면
const ProgressScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>진행상황</Text>
    <Text style={styles.subtitle}>진행상황 화면이 여기에 표시됩니다.</Text>
  </View>
);

// 임시 프로필 화면
const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>프로필</Text>
    <Text style={styles.subtitle}>프로필 화면이 여기에 표시됩니다.</Text>
  </View>
);

// 탭 네비게이터
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      headerShown: false,
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: '홈',
        tabBarIcon: HomeIcon,
      }}
    />
    <Tab.Screen
      name="Workout"
      component={WorkoutScreen}
      options={{
        tabBarLabel: '운동',
        tabBarIcon: WorkoutIcon,
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        tabBarLabel: '진행상황',
        tabBarIcon: ProgressIcon,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: '프로필',
        tabBarIcon: ProfileIcon,
      }}
    />
  </Tab.Navigator>
);

// 메인 앱 컴포넌트
const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
