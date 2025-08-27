import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'gym_mate_user_id';

// 유효한 UUID 생성 함수
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class UserService {
  private static currentUserId: string | null = null;

  // 현재 사용자 ID 가져오기 (임시 UUID 사용)
  static async getCurrentUserId(): Promise<string> {
    // 메모리에 이미 있으면 반환
    if (this.currentUserId) {
      console.log('🔍 메모리에서 사용자 ID 발견:', this.currentUserId);
      return this.currentUserId;
    }

    try {
      // AsyncStorage에서 기존 사용자 ID 확인
      const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
      
      if (storedUserId) {
        console.log('🔍 저장된 사용자 ID 발견:', storedUserId);
        this.currentUserId = storedUserId;
        return storedUserId;
      }

      // 새로운 임시 UUID 생성
      const newUserId = generateUUID();
      await AsyncStorage.setItem(USER_ID_KEY, newUserId);
      this.currentUserId = newUserId;
      
      console.log('✅ 새로운 임시 사용자 ID 생성:', newUserId);
      return newUserId;

    } catch (error) {
      console.error('❌ 사용자 ID 조회/생성 실패:', error);
      
      // 에러 시 메모리 기반 임시 ID 사용
      if (!this.currentUserId) {
        this.currentUserId = generateUUID();
        console.log('⚠️ 메모리 기반 임시 ID 생성:', this.currentUserId);
      }
      return this.currentUserId;
    }
  }

  // 사용자 ID 초기화 (로그아웃 등에 사용)
  static async clearUserId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);
      this.currentUserId = null;
      console.log('✅ 사용자 ID 초기화 완료');
    } catch (error) {
      console.error('❌ 사용자 ID 초기화 실패:', error);
    }
  }

  // 현재 캐시된 사용자 ID 반환 (비동기 없이)
  static getCachedUserId(): string | null {
    return this.currentUserId;
  }
}
