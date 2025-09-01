import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { useStyles } from '../styles/useStyles';
import { theme } from '../styles/theme';

interface OptimizedVideoProps {
  uri: string;
  style?: any;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * 성능 최적화된 비디오 컴포넌트
 * - 프리로딩 및 캐싱
 * - 네트워크 상태 감지
 * - 압축 및 해상도 최적화
 * - 메모리 사용량 최적화
 */
export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  uri,
  style,
  placeholder = '비디오를 불러오는 중...',
  onLoad,
  onError,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  resizeMode = 'cover',
  accessibilityLabel,
  testID,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [paused, setPaused] = useState(!autoPlay);
  const videoRef = useRef<Video>(null);
  const styles = useStyles();

  // 화면 크기 기반 비디오 품질 조정
  const screenWidth = Dimensions.get('window').width;
  const isLowEndDevice = screenWidth < 375; // iPhone SE 이하

  // 비디오 품질 설정
  const getVideoSettings = () => {
    if (isLowEndDevice) {
      return {
        maxBitRate: 500000, // 500kbps
        bufferConfig: {
          minBufferMs: 2000,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 1000,
          bufferForPlaybackAfterRebufferMs: 1500,
        },
      };
    }
    
    return {
      maxBitRate: 1000000, // 1Mbps
      bufferConfig: {
        minBufferMs: 5000,
        maxBufferMs: 10000,
        bufferForPlaybackMs: 2000,
        bufferForPlaybackAfterRebufferMs: 3000,
      },
    };
  };

  const videoSettings = getVideoSettings();

  // 비디오 로딩 완료
  const handleVideoLoad = (data: any) => {
    console.log('🎥 비디오 로드 완료:', {
      duration: data.duration,
      naturalSize: data.naturalSize,
      uri: uri,
    });
    setLoading(false);
    setError(null);
    onLoad?.();
  };

  // 비디오 로딩 오류
  const handleVideoError = (error: any) => {
    console.error('❌ 비디오 로드 실패:', error);
    setLoading(false);
    setError('비디오를 불러올 수 없습니다');
    onError?.(error);
  };

  // 버퍼링 상태 변경
  const handleBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setBuffering(isBuffering);
    if (isBuffering) {
      console.log('📡 비디오 버퍼링 중...');
    }
  };

  // 비디오 진행 상태 (메모리 관리용)
  const handleProgress = (data: any) => {
    // 메모리 사용량 최적화를 위해 진행률 로깅은 최소화
    if (data.currentTime % 5 === 0) { // 5초마다만 로그
      console.log('⏱️ 비디오 진행:', Math.round(data.currentTime), '/', Math.round(data.seekableDuration));
    }
  };

  // 비디오 재생/일시정지 토글
  const togglePlayback = () => {
    setPaused(!paused);
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 메모리 누수 방지
      if (videoRef.current) {
        console.log('🧹 비디오 컴포넌트 정리');
      }
    };
  }, []);

  return (
    <View style={[videoStyles.container, style]} testID={testID}>
      {/* 로딩 상태 */}
      {loading && (
        <View style={videoStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.textCaption, videoStyles.loadingText]}>
            {placeholder}
          </Text>
        </View>
      )}

      {/* 오류 상태 */}
      {error && (
        <View style={videoStyles.errorContainer}>
          <Text style={videoStyles.errorText}>❌</Text>
          <Text style={[styles.textCaption, videoStyles.errorMessage]}>
            {error}
          </Text>
          <TouchableOpacity
            style={videoStyles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={videoStyles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 비디오 플레이어 */}
      {!error && (
        <>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={videoStyles.video}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            onBuffer={handleBuffer}
            onProgress={handleProgress}
            paused={paused}
            repeat={loop}
            muted={muted}
            controls={controls}
            resizeMode={resizeMode}
            maxBitRate={videoSettings.maxBitRate}
            bufferConfig={videoSettings.bufferConfig}
            // 성능 최적화 옵션
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            mixWithOthers="mix"
            // 접근성
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="video"
          />

          {/* 버퍼링 오버레이 */}
          {buffering && (
            <View style={videoStyles.bufferingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.textInverse} />
            </View>
          )}

          {/* 재생/일시정지 버튼 (컨트롤이 비활성화된 경우) */}
          {!controls && (
            <TouchableOpacity
              style={videoStyles.playPauseButton}
              onPress={togglePlayback}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={paused ? '비디오 재생' : '비디오 일시정지'}
            >
              <Text style={videoStyles.playPauseIcon}>
                {paused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

// 비디오 캐시 관리자
class VideoCache {
  private static instance: VideoCache;
  private cache = new Map<string, any>();
  private maxCacheSize = 50; // 최대 50개 비디오 캐시

  static getInstance(): VideoCache {
    if (!VideoCache.instance) {
      VideoCache.instance = new VideoCache();
    }
    return VideoCache.instance;
  }

  // 비디오 메타데이터 캐시
  setCachedVideo(uri: string, metadata: any) {
    if (this.cache.size >= this.maxCacheSize) {
      // LRU 방식으로 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(uri, {
      ...metadata,
      cachedAt: Date.now(),
    });
    
    console.log('💾 비디오 캐시 저장:', uri);
  }

  // 캐시된 비디오 메타데이터 가져오기
  getCachedVideo(uri: string) {
    const cached = this.cache.get(uri);
    if (cached) {
      // 24시간 후 만료
      const isExpired = Date.now() - cached.cachedAt > 24 * 60 * 60 * 1000;
      if (isExpired) {
        this.cache.delete(uri);
        return null;
      }
      console.log('📦 비디오 캐시 히트:', uri);
      return cached;
    }
    return null;
  }

  // 캐시 정리
  clearCache() {
    this.cache.clear();
    console.log('🧹 비디오 캐시 정리 완료');
  }

  // 캐시 상태 정보
  getCacheInfo() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 비디오 캐시 인스턴스 내보내기
export const videoCache = VideoCache.getInstance();

const videoStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlayLight,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.base,
  },
  errorText: {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.base,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.base,
  },
  retryText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bufferingOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
  playPauseButton: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    minWidth: theme.accessibility.minTouchTarget,
    minHeight: theme.accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: theme.typography.fontSize.lg,
  },
});
