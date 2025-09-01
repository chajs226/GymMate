import React from 'react';
import { View } from 'react-native';

const insets = {
  top: 20,
  bottom: 0,
  left: 0,
  right: 0,
};

export const SafeAreaProvider = ({ children }) => React.createElement(View, {}, children);
export const SafeAreaView = (props) => React.createElement(View, props);
export const useSafeAreaInsets = () => insets;
export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 375, height: 812 });

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
};
