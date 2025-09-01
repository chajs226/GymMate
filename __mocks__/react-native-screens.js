import React from 'react';
import { View } from 'react-native';

export const Screen = (props) => React.createElement(View, props);
export const ScreenContainer = (props) => React.createElement(View, props);
export const NativeScreen = (props) => React.createElement(View, props);
export const NativeScreenContainer = (props) => React.createElement(View, props);
export const ScreenStack = (props) => React.createElement(View, props);
export const ScreenStackHeaderBackButtonImage = (props) => React.createElement(View, props);
export const ScreenStackHeaderCenterView = (props) => React.createElement(View, props);
export const ScreenStackHeaderConfig = (props) => React.createElement(View, props);
export const ScreenStackHeaderLeftView = (props) => React.createElement(View, props);
export const ScreenStackHeaderRightView = (props) => React.createElement(View, props);
export const ScreenStackHeaderSearchBarView = (props) => React.createElement(View, props);
export const SearchBar = (props) => React.createElement(View, props);

export const enableScreens = jest.fn();

export default {
  Screen,
  ScreenContainer,
  NativeScreen,
  NativeScreenContainer,
  ScreenStack,
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderConfig,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderSearchBarView,
  SearchBar,
  enableScreens,
};
