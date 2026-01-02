import PocketBase from 'pocketbase';

// PocketBase 인스턴스 생성
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

// 자동 취소 비활성화 (Next.js에서 필요)
pb.autoCancellation(false);

export default pb;

// 컬렉션 이름 상수
export const COLLECTIONS = {
  PROJECTS: 'projects',
  SCHEDULES: 'schedules',
  SCENES: 'scenes',
  TIMELINE: 'timeline',
  STAFF: 'staff',
  CASTS: 'casts',
  CAST_SCHEDULES: 'cast_schedules',
  DEPARTMENT_DETAILS: 'department_details',
} as const;





