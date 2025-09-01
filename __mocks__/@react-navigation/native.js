import React from 'react';
import { View } from 'react-native';

export const NavigationContainer = ({ children }) => React.createElement(View, {}, children);

export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

export const useRoute = () => ({
  key: 'test-route',
  name: 'TestScreen',
  params: {},
});

export const useFocusEffect = (callback) => {
  React.useEffect(callback, []);
};

export const useIsFocused = () => true;

export default {
  NavigationContainer,
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
};
