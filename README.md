# GymMate

GymMate는 초보자들을 위한 개인화된 운동 루틴과 짧은 비디오 가이드를 제공하는 모바일 애플리케이션입니다. 개인 트레이너의 저렴한 대안으로 효과적이고 자신감 있게 운동할 수 있도록 도와줍니다.

## 주요 기능

- **개인화된 운동 루틴**: 사용자의 목표와 빈도에 맞춘 맞춤형 운동 계획
- **운동 가이드**: 각 운동의 올바른 자세를 보여주는 짧은 비디오
- **대체 운동 제안**: 원하는 기구가 사용 중일 때 대체 운동 추천
- **진행상황 추적**: 운동 성과를 기록하고 진행상황을 시각화

## 기술 스택

- **Frontend**: React Native 0.81.0 with TypeScript
- **Backend**: Supabase (Authentication, Database)
- **Navigation**: React Navigation v6
- **Code Quality**: ESLint, Prettier, Husky

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- React Native CLI
- iOS: Xcode 14 이상
- Android: Android Studio 및 Android SDK

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd GymMate
```

2. 의존성 설치
```bash
npm install
```

3. iOS 의존성 설치 (iOS 개발 시)
```bash
cd ios && pod install && cd ..
```

### 실행

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Metro 서버 시작
```bash
npm start
```

## 프로젝트 구조

```
GymMate/
├── src/
│   ├── config/
│   │   └── supabase.ts      # Supabase 설정 및 타입 정의
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   ├── navigation/         # 네비게이션 설정
│   ├── services/           # API 서비스
│   └── utils/              # 유틸리티 함수
├── android/                # Android 네이티브 코드
├── ios/                    # iOS 네이티브 코드
└── __tests__/              # 테스트 파일
```

## 개발 가이드라인

### 코드 품질

- ESLint와 Prettier를 사용한 코드 포맷팅
- Husky를 통한 커밋 전 자동 린팅
- TypeScript를 사용한 타입 안전성

### 네이밍 컨벤션

- 컴포넌트: PascalCase (예: `HomeScreen`)
- 함수: camelCase (예: `getUserProfile`)
- 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- 파일명: kebab-case (예: `user-profile.ts`)

### 커밋 메시지

- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 추가/수정

## 환경 설정

### Supabase 설정

1. Supabase 프로젝트 생성
2. 환경 변수 설정:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 테스트

```bash
npm test
```

## 빌드

### iOS 릴리즈 빌드
```bash
cd ios
xcodebuild -workspace GymMate.xcworkspace -scheme GymMate -configuration Release -destination generic/platform=iOS -archivePath GymMate.xcarchive archive
```

### Android 릴리즈 빌드
```bash
cd android
./gradlew assembleRelease
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
