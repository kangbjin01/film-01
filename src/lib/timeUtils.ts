import { format, parse, addMinutes, differenceInMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 시간 문자열을 HH:mm 형식으로 정규화
 * @param input "8", "830", "8:30", "08:30" 등
 * @returns "08:30" 형식
 */
export function normalizeTime(input: string): string {
  // 숫자만 추출
  const digits = input.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  
  let hours: number;
  let minutes: number;
  
  if (digits.length <= 2) {
    // "8" -> 08:00, "12" -> 12:00
    hours = parseInt(digits, 10);
    minutes = 0;
  } else if (digits.length === 3) {
    // "830" -> 08:30
    hours = parseInt(digits.slice(0, 1), 10);
    minutes = parseInt(digits.slice(1), 10);
  } else {
    // "0830" or "1230" -> 08:30 or 12:30
    hours = parseInt(digits.slice(0, 2), 10);
    minutes = parseInt(digits.slice(2, 4), 10);
  }
  
  // 유효성 검사
  if (hours > 23) hours = 23;
  if (minutes > 59) minutes = 59;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 시간에서 분 단위 추가
 */
export function calculateTimeFromDuration(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  const result = addMinutes(date, durationMinutes);
  return format(result, 'HH:mm');
}

/**
 * 두 시간 사이의 분 차이 계산
 */
export function getMinutesBetween(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const start = new Date();
  start.setHours(startHours, startMinutes, 0, 0);
  
  const end = new Date();
  end.setHours(endHours, endMinutes, 0, 0);
  
  return differenceInMinutes(end, start);
}

/**
 * 분을 시간:분 형식으로 변환
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}분`;
  } else if (mins === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${mins}분`;
  }
}

/**
 * 시간:분 형식의 문자열 반환 (짧은 형식)
 */
export function formatDurationShort(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${mins}m`;
  }
}

/**
 * "1h30m", "90분", "1:30" 등의 입력을 분으로 변환
 */
export function parseDuration(input: string): number {
  // 숫자만 입력된 경우 (분으로 처리)
  if (/^\d+$/.test(input.trim())) {
    return parseInt(input.trim(), 10);
  }
  
  // "1h30m" 또는 "1h 30m" 형식
  const hMatch = input.match(/(\d+)\s*h/i);
  const mMatch = input.match(/(\d+)\s*m/i);
  
  if (hMatch || mMatch) {
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
    return hours * 60 + minutes;
  }
  
  // "1:30" 형식
  if (input.includes(':')) {
    const [hours, minutes] = input.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
  
  // "90분" 형식
  const minMatch = input.match(/(\d+)\s*분/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  
  // "1시간 30분" 형식
  const hourMatch = input.match(/(\d+)\s*시간/);
  const minuteMatch = input.match(/(\d+)\s*분/);
  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    return hours * 60 + minutes;
  }
  
  return 0;
}

/**
 * 시간을 표시 형식으로 변환
 */
export function formatTime(time: string): string {
  return time; // HH:mm 그대로 반환
}

/**
 * 날짜를 한국어 형식으로 변환
 */
export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy.MM.dd (E)', { locale: ko });
}

/**
 * 요일 반환
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'E', { locale: ko });
}

/**
 * 시간 범위 포맷
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} ~ ${endTime}`;
}





