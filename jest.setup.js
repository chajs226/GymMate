// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  const Text = require('react-native/Libraries/Text/Text');
  const TouchableOpacity = require('react-native/Libraries/Components/Touchable/TouchableOpacity');
  
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    State: {},
    Directions: {},
    gestureHandlerRootHOC: jest.fn((component) => component),
    Swipeable: View,
    DrawerLayout: View,
    TouchableHighlight: TouchableOpacity,
    TouchableNativeFeedback: TouchableOpacity,
    TouchableOpacity: TouchableOpacity,
    TouchableWithoutFeedback: TouchableOpacity,
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    enableScreens: jest.fn(),
    Screen: View,
    ScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    SafeAreaProvider: View,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    NavigationContainer: View,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({}),
  };
});

// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    createStackNavigator: () => ({
      Navigator: View,
      Screen: View,
    }),
  };
});

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    createBottomTabNavigator: () => ({
      Navigator: View,
      Screen: View,
    }),
  };
}); 