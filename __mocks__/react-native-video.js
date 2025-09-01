import React from 'react';
import { View } from 'react-native';

const Video = (props) => {
  React.useEffect(() => {
    // Simulate video load after a brief delay
    setTimeout(() => {
      if (props.onLoad) {
        props.onLoad({
          duration: 15,
          naturalSize: { width: 1920, height: 1080 },
        });
      }
    }, 100);
  }, [props.source]);

  return React.createElement(View, {
    ...props,
    testID: props.testID || 'mock-video',
  });
};

export default Video;
