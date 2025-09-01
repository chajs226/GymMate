import React from 'react';
import { View } from 'react-native';

export const createBottomTabNavigator = () => ({
  Navigator: ({ children }) => React.createElement(View, {}, children),
  Screen: (props) => React.createElement(View, props),
});

export default {
  createBottomTabNavigator,
};
