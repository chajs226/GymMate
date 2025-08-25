# GymMate

GymMate는 초보자들을 위한 개인화된 워크아웃 루틴을 제공하는 모바일 애플리케이션입니다.

## 기술 스택

- **Frontend**: React Native 0.81.0
- **Backend**: Supabase (PostgreSQL)
- **Navigation**: React Navigation
- **Language**: TypeScript

## 프로젝트 구조

```
GymMate/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase 클라이언트 설정
│   ├── services/
│   │   └── database.ts          # 데이터베이스 서비스 레이어
│   └── types/
│       └── database.ts          # 데이터베이스 타입 정의
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 초기 데이터베이스 스키마
├── scripts/
│   └── seed-data.js             # 초기 데이터 시딩 스크립트
└── App.tsx                      # 메인 앱 컴포넌트
```

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 API 키를 확인합니다.

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정합니다:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. 데이터베이스 마이그레이션 실행

Supabase 대시보드의 SQL 편집기에서 다음 파일의 내용을 실행합니다:

```sql
-- supabase/migrations/001_initial_schema.sql 파일의 내용을 실행
```

### 4. 초기 데이터 시딩

```bash
# 환경 변수 설정 후
node scripts/seed-data.js
```

## 데이터베이스 스키마

### 주요 테이블

- **user_profiles**: 사용자 프로필 및 목표 설정
- **exercises**: 운동 정보 (이름, 설명, 비디오 URL, 팁 등)
- **routines**: 워크아웃 루틴 템플릿
- **routine_exercises**: 루틴과 운동의 관계 (요일별, 순서별)
- **alternative_exercises**: 대체 운동 관계
- **user_routines**: 사용자별 할당된 루틴
- **workout_logs**: 운동 완료 로그

### 루틴 매핑 로직

PRD 요구사항에 따라 다음과 같이 루틴이 매핑됩니다:

- **Muscle Gain + 3 days/week** → "Beginner Strength 3-Day Split A"
- **Fat Loss + 4 days/week** → "Beginner Fat Loss 4-Day Split"
- **General Fitness + 2 days/week** → "Beginner General Fitness 2-Day Split"

## 개발 가이드

### 데이터베이스 서비스 사용

```typescript
import { DatabaseService } from './src/services/database';

// 사용자 프로필 생성
const profile = await DatabaseService.createUserProfile({
  user_id: 'user-id',
  goal: 'Muscle Gain',
  frequency: '3 days/week'
});

// 오늘의 운동 조회
const todaysWorkout = await DatabaseService.getTodaysWorkout(
  'user-id',
  DatabaseUtils.getCurrentDayOfWeek()
);

// 대체 운동 조회
const alternative = await DatabaseService.getRandomAlternativeExercise('exercise-id');
```

### 타입 안전성

모든 데이터베이스 작업은 TypeScript 타입을 통해 안전성을 보장합니다:

```typescript
import { Exercise, Routine, UserProfile } from './src/types/database';
```

## 보안

- Row Level Security (RLS) 정책이 모든 테이블에 적용됩니다
- 사용자는 자신의 데이터만 접근할 수 있습니다
- 운동, 루틴 등 공개 데이터는 인증된 사용자만 읽기 가능합니다

## 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS 실행
npm run ios

# Android 실행
npm run android

# 개발 서버 시작
npm start
```

## 테스트

```bash
npm test
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
