// =====================
// 공통 타입
// =====================
export type RecordId = string;

// =====================
// 프로젝트 (영화/작품)
// =====================
export interface Project {
  id: RecordId;
  title: string;                    // 작품명
  director: string;                 // 감독
  producer: string;                 // PD
  assistantDirector: string;        // 조연출
  description?: string;             // 작품 설명
  startDate?: string;               // 촬영 시작 예정일
  endDate?: string;                 // 촬영 종료 예정일
  status: ProjectStatus;
  created: string;
  updated: string;
}

export type ProjectStatus = 'PREP' | 'SHOOTING' | 'POST' | 'COMPLETED';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PREP: '프리 프로덕션',
  SHOOTING: '촬영 중',
  POST: '포스트 프로덕션',
  COMPLETED: '완료',
};

// =====================
// 일일촬영계획표
// =====================
export interface DailySchedule {
  id: RecordId;
  projectId: RecordId;
  
  // 기본 정보
  shootingDate: string;             // 촬영일 (YYYY-MM-DD)
  episode: number;                  // 회차 (몇 번째 촬영일)
  
  // 시간 정보
  gatherTime: string;               // 집합시간 (HH:mm)
  shootingEndTime: string;          // 예상 종료시간 (HH:mm)
  
  // 장소 정보
  shootingLocation: string;         // 촬영장소 주소
  shootingLocationName: string;     // 촬영장소 이름
  gatherLocation: string;           // 집합장소 (비어있으면 촬영장소와 동일)
  gatherLocationName: string;       // 집합장소 이름
  
  // 날씨 정보
  weatherCondition?: string;        // 날씨 (맑음, 흐림 등)
  minTemp?: number;                 // 최저온도
  maxTemp?: number;                 // 최고온도
  rainProbability?: number;         // 강수확률 (%)
  sunrise?: string;                 // 일출시간 (HH:mm)
  sunset?: string;                  // 일몰시간 (HH:mm)
  
  // 기타
  notes?: string;                   // 기타사항
  
  created: string;
  updated: string;
}

// =====================
// 촬영 씬
// =====================
export interface Scene {
  id: RecordId;
  scheduleId: RecordId;
  
  order: number;                    // 촬영 순서 (정렬용)
  sceneNumber: string;              // 씬 번호 (S#1, S#2...)
  
  // 시간대
  timeOfDay: TimeOfDay;             // M/D/E/N
  locationType: LocationType;       // I/E
  
  // 시간
  startTime: string;                // 예상 시작시간 (HH:mm)
  endTime: string;                  // 예상 종료시간 (HH:mm)
  estimatedDuration: number;        // 예상 소요시간 (분)
  
  // 내용
  location: string;                 // 촬영장소
  description: string;              // 촬영내용 (여러 줄)
  mainCharacters: string[];         // 주요인물 배열
  remarks?: string;                 // 비고 (렌즈, 장비 정보 등)
  
  // 컷 정보
  cuts: Cut[];                      // 씬에 속한 컷들
  
  status: SceneStatus;
  
  created: string;
  updated: string;
}

// =====================
// 컷 (씬 하위)
// =====================
export interface Cut {
  id: string;                       // 로컬 ID (uuid)
  cutNumber: string;                // 컷 번호 (1, 2, 3...)
  description: string;              // 컷 설명
  estimatedDuration: number;        // 예상 소요시간 (분)
  remarks?: string;                 // 비고
}

export type TimeOfDay = 'M' | 'D' | 'E' | 'N';
export type LocationType = 'I' | 'E';
export type SceneStatus = 'PENDING' | 'SHOOTING' | 'OK' | 'NG' | 'SKIP';

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  M: 'M',
  D: 'D',
  E: 'E',
  N: 'N',
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  I: 'I',
  E: 'E',
};

export const SCENE_STATUS_LABELS: Record<SceneStatus, string> = {
  PENDING: '대기',
  SHOOTING: '촬영중',
  OK: 'OK',
  NG: 'NG',
  SKIP: '스킵',
};

// =====================
// 전체일정 타임라인
// =====================
export interface TimelineItem {
  id: RecordId;
  scheduleId: RecordId;
  
  order: number;                    // 정렬 순서
  time: string;                     // 시작 시간 (HH:mm)
  endTime?: string;                 // 종료 시간 (HH:mm)
  title: string;                    // 일정명
  description?: string;             // 상세 내용
  type: TimelineType;
  
  created: string;
  updated: string;
}

export type TimelineType = 'GATHER' | 'MEAL' | 'SHOOTING' | 'BREAK' | 'WRAP' | 'OTHER';

export const TIMELINE_TYPE_LABELS: Record<TimelineType, string> = {
  GATHER: '집합',
  MEAL: '식사',
  SHOOTING: '촬영',
  BREAK: '휴식',
  WRAP: '철수',
  OTHER: '기타',
};

// =====================
// 스태프
// =====================
export interface Staff {
  id: RecordId;
  projectId: RecordId;
  
  name: string;                     // 이름
  department: DepartmentType;       // 부서
  position: string;                 // 직책
  phone: string;                    // 연락처
  email?: string;
  
  created: string;
  updated: string;
}

export type DepartmentType = 
  | 'DIRECTING'     // 연출부
  | 'CAMERA'        // 촬영부
  | 'LIGHTING'      // 조명부
  | 'SOUND'         // 음향부
  | 'ART'           // 미술부
  | 'PRODUCTION'    // 제작부
  | 'MAKEUP'        // 분장부
  | 'COSTUME'       // 의상부
  | 'OTHER';        // 기타

export const DEPARTMENT_LABELS: Record<DepartmentType, string> = {
  DIRECTING: '연출부',
  CAMERA: '촬영부',
  LIGHTING: '조명부',
  SOUND: '음향부',
  ART: '미술부',
  PRODUCTION: '제작부',
  MAKEUP: '분장부',
  COSTUME: '의상부',
  OTHER: '기타',
};

// =====================
// 세부전형 (부서별 장비/소품)
// =====================
export interface DepartmentDetail {
  id: RecordId;
  scheduleId: RecordId;
  department: DepartmentType;
  
  // 각 부서별 텍스트 필드
  content: string;                  // 장비/소품 내용 (줄바꿈으로 구분)
  
  created: string;
  updated: string;
}

// =====================
// 캐스트 (배우)
// =====================
export interface Cast {
  id: RecordId;
  projectId: RecordId;
  
  role: string;                     // 배역명
  actorName: string;                // 연기자 이름
  phone: string;                    // 연락처
  
  created: string;
  updated: string;
}

// =====================
// 캐스트 스케줄 (일촬표별 배우 정보)
// =====================
export interface CastSchedule {
  id: RecordId;
  scheduleId: RecordId;
  castId: RecordId;
  
  gatherTime: string;               // 집합시간 (HH:mm)
  gatherLocation: string;           // 집합위치
  scenes: string[];                 // 출연 씬 번호 배열
  prepItems?: string;               // 배우 준비물
  
  created: string;
  updated: string;
}

// =====================
// 폼 타입 (생성/수정용)
// =====================
export type ProjectFormData = Omit<Project, 'id' | 'created' | 'updated'>;
export type DailyScheduleFormData = Omit<DailySchedule, 'id' | 'created' | 'updated'>;
export type SceneFormData = Omit<Scene, 'id' | 'created' | 'updated'>;
export type TimelineItemFormData = Omit<TimelineItem, 'id' | 'created' | 'updated'>;
export type StaffFormData = Omit<Staff, 'id' | 'created' | 'updated'>;
export type CastFormData = Omit<Cast, 'id' | 'created' | 'updated'>;
export type CastScheduleFormData = Omit<CastSchedule, 'id' | 'created' | 'updated'>;

// =====================
// 확장 타입 (조인된 데이터)
// =====================
export interface DailyScheduleWithDetails extends DailySchedule {
  scenes: Scene[];
  timeline: TimelineItem[];
  departmentDetails: DepartmentDetail[];
  castSchedules: (CastSchedule & { cast: Cast })[];
}

export interface ProjectWithStaff extends Project {
  staff: Staff[];
  casts: Cast[];
}

