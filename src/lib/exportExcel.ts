import * as XLSX from 'xlsx';
import type { DailySchedule, Scene, TimelineItem, Staff, Cut } from '@/types';
import { TIME_OF_DAY_LABELS, LOCATION_TYPE_LABELS, TIMELINE_TYPE_LABELS, DEPARTMENT_LABELS } from '@/types';
import { formatDateKorean } from './timeUtils';

interface ExportData {
  schedule: DailySchedule;
  scenes: Scene[];
  timeline: TimelineItem[];
  staff: Staff[];
  projectTitle: string;
}

// 씬과 컷을 펼쳐서 행 데이터 생성
function generateSceneRows(scenes: Scene[]): any[][] {
  const rows: any[][] = [];
  let globalOrder = 1;
  
  scenes.forEach((scene) => {
    const cuts = scene.cuts || [];
    
    if (cuts.length === 0) {
      // 컷이 없는 씬은 씬 정보만 표시
      rows.push([
        globalOrder,
        `S#${scene.sceneNumber}`,
        '',
        TIME_OF_DAY_LABELS[scene.timeOfDay],
        LOCATION_TYPE_LABELS[scene.locationType],
        scene.startTime || '',
        scene.endTime || '',
        scene.location,
        scene.description,
        scene.mainCharacters.join(', '),
        scene.remarks || '',
      ]);
      globalOrder++;
    } else {
      // 컷이 있는 씬은 각 컷을 행으로 표시
      cuts.forEach((cut, cutIndex) => {
        rows.push([
          globalOrder,
          cutIndex === 0 ? `S#${scene.sceneNumber}` : '', // S#은 첫 컷에만 표시
          cut.cutNumber,
          TIME_OF_DAY_LABELS[scene.timeOfDay],
          LOCATION_TYPE_LABELS[scene.locationType],
          '', // 시작 시간
          '', // 종료 시간
          scene.location,
          cut.description || scene.description,
          scene.mainCharacters.join(', '),
          cut.remarks || scene.remarks || '',
        ]);
        globalOrder++;
      });
    }
  });
  
  return rows;
}

export function exportScheduleToExcel(data: ExportData): Blob {
  const { schedule, scenes, timeline, staff, projectTitle } = data;
  
  // 워크북 생성
  const wb = XLSX.utils.book_new();
  
  // ========== 일촬표 시트 ==========
  const scheduleData: any[][] = [];
  
  // 헤더
  scheduleData.push([`< ${projectTitle} > 일일촬영계획표`]);
  scheduleData.push([]);
  
  // 기본 정보
  scheduleData.push(['작품명', projectTitle, '', '촬영일', formatDateKorean(schedule.shootingDate)]);
  scheduleData.push(['회차', `${schedule.episode}회차`, '', '집합시간', schedule.gatherTime]);
  scheduleData.push(['촬영장소', schedule.shootingLocationName || '', '', '예상종료', schedule.shootingEndTime]);
  scheduleData.push(['주소', schedule.shootingLocation || '']);
  
  if (schedule.weatherCondition) {
    scheduleData.push([
      '날씨', 
      `${schedule.weatherCondition} ${schedule.minTemp || ''}~${schedule.maxTemp || ''}°C`,
      '',
      '일출/일몰',
      `${schedule.sunrise || '-'} / ${schedule.sunset || '-'}`
    ]);
  }
  
  scheduleData.push([]);
  scheduleData.push(['촬영 씬']);
  
  // 씬 테이블 헤더 - 이미지 형식에 맞춤
  scheduleData.push([
    '촬영순서', 'S#', 'CUT', 'M/D/E/N', 'I/E', '촬영시간 시작', '끝', '촬영장소', '촬영내용', '주요인물', '비고'
  ]);
  
  // 씬 데이터 - 컷 단위로 펼쳐서 생성
  const sceneRows = generateSceneRows(scenes);
  sceneRows.forEach(row => {
    scheduleData.push(row);
  });
  
  // 총 촬영시간
  const totalCuts = scenes.reduce((acc, s) => acc + (s.cuts?.length || 1), 0);
  scheduleData.push([]);
  scheduleData.push(['총 씬 수', `${scenes.length}개`, '', '총 컷 수', `${totalCuts}개`]);
  
  const ws1 = XLSX.utils.aoa_to_sheet(scheduleData);
  
  // 열 너비 설정
  ws1['!cols'] = [
    { wch: 8 },   // 촬영순서
    { wch: 8 },   // S#
    { wch: 6 },   // CUT
    { wch: 8 },   // M/D/E/N
    { wch: 5 },   // I/E
    { wch: 10 },  // 시작
    { wch: 10 },  // 끝
    { wch: 20 },  // 촬영장소
    { wch: 50 },  // 촬영내용
    { wch: 20 },  // 주요인물
    { wch: 25 },  // 비고
  ];
  
  // 셀 병합 (제목)
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // 제목 병합
  ];
  
  XLSX.utils.book_append_sheet(wb, ws1, '일촬표');
  
  // ========== 전체일정 시트 ==========
  if (timeline.length > 0) {
    const timelineData: any[][] = [
      ['전체일정'],
      [],
      ['시간', '유형', '일정명', '설명'],
    ];
    
    const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));
    sortedTimeline.forEach((item) => {
      timelineData.push([
        item.time,
        TIMELINE_TYPE_LABELS[item.type],
        item.title,
        item.description || '',
      ]);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(timelineData);
    ws2['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, '전체일정');
  }
  
  // ========== 스태프 시트 ==========
  if (staff.length > 0) {
    const staffData: any[][] = [
      ['스태프 연락처'],
      [],
      ['부서', '직책', '이름', '연락처', '이메일'],
    ];
    
    staff.forEach((s) => {
      staffData.push([
        DEPARTMENT_LABELS[s.department],
        s.position,
        s.name,
        s.phone,
        s.email || '',
      ]);
    });
    
    const ws3 = XLSX.utils.aoa_to_sheet(staffData);
    ws3['!cols'] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, ws3, '스태프');
  }
  
  // Blob으로 변환
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
