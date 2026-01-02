import jsPDF from 'jspdf';
import autoTable, { CellDef } from 'jspdf-autotable';
import type { DailySchedule, Scene, TimelineItem, Staff, Cast, DepartmentDetail } from '@/types';
import { TIME_OF_DAY_LABELS, LOCATION_TYPE_LABELS } from '@/types';
import { formatDateKorean } from './timeUtils';

interface ExportData {
  schedule: DailySchedule;
  scenes: Scene[];
  timeline: TimelineItem[];
  staff: Staff[];
  casts: Cast[];
  departmentDetails?: DepartmentDetail[];
  projectTitle: string;
  orientation?: 'portrait' | 'landscape';
  mode?: 'basic' | 'detailed';
}

// 색상 상수 (잉크 절약을 위해 밝은 색 위주)
const COLORS = {
  primary: [249, 115, 22] as [number, number, number],
  primaryLight: [255, 247, 237] as [number, number, number],
  headerBg: [245, 245, 245] as [number, number, number],
  borderDark: [80, 80, 80] as [number, number, number],
  borderMedium: [150, 150, 150] as [number, number, number],
  borderLight: [200, 200, 200] as [number, number, number],
  text: [20, 20, 20] as [number, number, number],
  textGray: [100, 100, 100] as [number, number, number],
};

// Pretendard 폰트 로드 및 등록
async function loadPretendardFont(doc: jsPDF): Promise<void> {
  try {
    // Regular
    const regularResponse = await fetch('/fonts/Pretendard-Regular.ttf');
    const regularBuffer = await regularResponse.arrayBuffer();
    const regularBase64 = btoa(
      new Uint8Array(regularBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    doc.addFileToVFS('Pretendard-Regular.ttf', regularBase64);
    doc.addFont('Pretendard-Regular.ttf', 'Pretendard', 'normal');
    
    // Bold
    const boldResponse = await fetch('/fonts/Pretendard-Bold.ttf');
    const boldBuffer = await boldResponse.arrayBuffer();
    const boldBase64 = btoa(
      new Uint8Array(boldBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    doc.addFileToVFS('Pretendard-Bold.ttf', boldBase64);
    doc.addFont('Pretendard-Bold.ttf', 'Pretendard', 'bold');
    
    doc.setFont('Pretendard');
  } catch (error) {
    console.error('Failed to load Pretendard font:', error);
    // 폴백으로 기존 NotoSansKR 시도
    try {
      const response = await fetch('/fonts/NotoSansKR-Regular.ttf');
      const fontBuffer = await response.arrayBuffer();
      const fontBase64 = btoa(
        new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      doc.addFileToVFS('NotoSansKR-Regular.ttf', fontBase64);
      doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
      doc.setFont('NotoSansKR');
    } catch {
      console.error('Failed to load fallback font');
    }
  }
}

// 씬과 컷을 펼쳐서 행 데이터 생성 (S# rowSpan 지원)
function generateSceneRowsWithMerge(scenes: Scene[]): CellDef[][] {
  const rows: CellDef[][] = [];
  let globalOrder = 1;
  
  scenes.forEach((scene) => {
    const cuts = scene.cuts || [];
    const rowCount = cuts.length > 0 ? cuts.length : 1;
    
    if (cuts.length === 0) {
      // 컷이 없는 씬
      rows.push([
        { content: globalOrder.toString(), styles: { halign: 'center' } },
        { content: scene.sceneNumber, styles: { halign: 'center', fillColor: COLORS.primaryLight } },
        { content: '', styles: { halign: 'center' } },
        { content: TIME_OF_DAY_LABELS[scene.timeOfDay], styles: { halign: 'center' } },
        { content: LOCATION_TYPE_LABELS[scene.locationType], styles: { halign: 'center' } },
        { content: scene.startTime || '', styles: { halign: 'center' } },
        { content: scene.endTime || '', styles: { halign: 'center' } },
        { content: scene.location },
        { content: scene.description },
        { content: scene.mainCharacters.join(', ') },
        { content: scene.remarks || '' },
      ]);
      globalOrder++;
    } else {
      // 컷이 있는 씬 - S# 셀 병합
      cuts.forEach((cut, cutIndex) => {
        const row: CellDef[] = [
          { content: globalOrder.toString(), styles: { halign: 'center' } },
        ];
        
        // S# 셀 - 첫 번째 컷에만 rowSpan 적용
        if (cutIndex === 0) {
          row.push({
            content: scene.sceneNumber,
            rowSpan: rowCount,
            styles: { halign: 'center', fillColor: COLORS.primaryLight, valign: 'middle' }
          });
        }
        
        row.push(
          { content: cut.cutNumber, styles: { halign: 'center' } },
          { content: TIME_OF_DAY_LABELS[scene.timeOfDay], styles: { halign: 'center' } },
          { content: LOCATION_TYPE_LABELS[scene.locationType], styles: { halign: 'center' } },
          { content: '', styles: { halign: 'center' } },
          { content: '', styles: { halign: 'center' } },
          { content: scene.location },
          { content: cut.description || scene.description },
          { content: scene.mainCharacters.join(', ') },
          { content: cut.remarks || scene.remarks || '' },
        );
        
        rows.push(row);
        globalOrder++;
      });
    }
  });
  
  return rows;
}

export async function exportScheduleToPdf(data: ExportData): Promise<Blob> {
  const { 
    schedule, 
    scenes, 
    timeline, 
    staff, 
    casts = [],
    departmentDetails = [],
    projectTitle, 
    orientation = 'landscape',
    mode = 'basic'
  } = data;
  
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
  });
  
  await loadPretendardFont(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const tableWidth = pageWidth - margin * 2; // 테이블 전체 너비
  let y = margin;
  
  // ========== 1. 제목 ==========
  doc.setFont('Pretendard', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.text(`< ${projectTitle} > 일일촬영계획표`, pageWidth / 2, y + 6, { align: 'center' });
  y += 14;
  
  // ========== 2. 기본 정보 테이블 ==========
  const shootingTimeTotal = calculateTotalShootingTime(scenes);
  const isLandscape = orientation === 'landscape';
  
  // 기본 정보 컬럼 너비 (총합 = tableWidth)
  // [0]회차 [1]라벨 [2-4]데이터 [5]라벨 [6]데이터 [7]라벨 [8]데이터 [9]라벨 [10]데이터
  const infoColWidths = isLandscape 
    ? [24, 20, 30, 30, 30, 20, 30, 16, 28, 16, 32]  // 합계: 276 (가로 A4)
    : [18, 18, 22, 22, 22, 18, 22, 14, 20, 14, 20]; // 합계: 190 (세로 A4)
  
  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      // Row 1: 회차 | 촬영일시 | 날짜(colSpan 3) | 집합시간 | 값 | 최저 | 값 | 최고 | 값
      [
        { content: `${schedule.episode} 회차`, styles: { fontStyle: 'bold', halign: 'center', fillColor: COLORS.primaryLight } },
        { content: '촬영일시', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: formatDateKorean(schedule.shootingDate), colSpan: 3 },
        { content: '집합시간', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.gatherTime },
        { content: '최저', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.minTemp ? `${schedule.minTemp}°` : '-' },
        { content: '최고', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.maxTemp ? `${schedule.maxTemp}°` : '-' },
      ],
      // Row 2: (span) | 촬영장소 | 값 | Shooting | 값 | 날씨 | 값 | 강수 | 값
      [
        { content: '', rowSpan: 2 },
        { content: '촬영장소', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.shootingLocationName || '-', colSpan: 3 },
        { content: 'Shooting', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: shootingTimeTotal },
        { content: '날씨', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.weatherCondition || '-' },
        { content: '강수', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.rainProbability ? `${schedule.rainProbability}%` : '-' },
      ],
      // Row 3: (span) | 집합장소 | 값 | 종료시간 | 값 | 일출/몰 | 값
      [
        { content: '집합장소', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.gatherLocationName || '촬영장소와 동일', colSpan: 3 },
        { content: '종료시간', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: schedule.shootingEndTime || '-' },
        { content: '일출/몰', styles: { fillColor: COLORS.headerBg, halign: 'center' } },
        { content: `${schedule.sunrise || '-'} / ${schedule.sunset || '-'}`, colSpan: 2 },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'Pretendard',
      fontStyle: 'normal',
      lineColor: COLORS.borderMedium,
      lineWidth: 0.2,
      textColor: COLORS.text,
    },
    columnStyles: Object.fromEntries(infoColWidths.map((w, i) => [i, { cellWidth: w }])),
    margin: { left: margin, right: margin },
    tableWidth: tableWidth,
    tableLineColor: COLORS.borderMedium,
    tableLineWidth: 0.3,
  });
  
  y = (doc as any).lastAutoTable.finalY + 6;
  
  // ========== 3. 촬영 씬 ==========
  if (scenes.length > 0) {
    doc.setFont('Pretendard', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text('촬영 씬', margin, y);
    y += 4;
    
    const sceneRows = generateSceneRowsWithMerge(scenes);
    
    // 촬영 씬 컬럼 너비 (총합 = tableWidth)
    // [0]순서 [1]S# [2]CUT [3]M/D/E/N [4]I/E [5]시작 [6]끝 [7]장소 [8]내용 [9]인물 [10]비고
    const sceneColWidths = isLandscape 
      ? [14, 14, 12, 12, 10, 14, 14, 38, 75, 38, 36]  // 합계: 277 (가로 A4)
      : [10, 10, 10, 10, 8, 12, 12, 26, 50, 26, 26];   // 합계: 200 (세로 A4)
    
    autoTable(doc, {
      startY: y,
      head: [[
        { content: '촬영\n순서', styles: { halign: 'center' } },
        { content: 'S#', styles: { halign: 'center' } },
        { content: 'CUT', styles: { halign: 'center' } },
        { content: 'M/D\nE/N', styles: { halign: 'center' } },
        { content: 'I/E', styles: { halign: 'center' } },
        { content: '시작', styles: { halign: 'center' } },
        { content: '끝', styles: { halign: 'center' } },
        { content: '촬영장소', styles: { halign: 'center' } },
        { content: '촬영내용', styles: { halign: 'center' } },
        { content: '주요인물', styles: { halign: 'center' } },
        { content: '비고', styles: { halign: 'center' } },
      ]],
      body: sceneRows,
      styles: {
        fontSize: isLandscape ? 7.5 : 6.5,
        cellPadding: 1.5,
        font: 'Pretendard',
        fontStyle: 'normal',
        lineColor: COLORS.borderLight,
        lineWidth: 0.15,
        textColor: COLORS.text,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.text,
        fontStyle: 'normal',
        lineColor: COLORS.borderMedium,
        lineWidth: 0.2,
        font: 'Pretendard',
      },
      alternateRowStyles: {},
      columnStyles: Object.fromEntries(sceneColWidths.map((w, i) => [i, { cellWidth: w }])),
      margin: { left: margin, right: margin },
      tableWidth: tableWidth,
    });
    
    y = (doc as any).lastAutoTable.finalY + 6;
  }
  
  // ========== 4. 전체일정 & 스태프 (2컬럼 레이아웃) ==========
  if (timeline.length > 0 || staff.length > 0) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    
    const halfWidth = (tableWidth - margin) / 2;
    const leftX = margin;
    const rightX = margin + halfWidth + margin;
    
    // 전체일정 (좌측)
    if (timeline.length > 0) {
      doc.setFont('Pretendard', 'bold');
      doc.setFontSize(10);
      doc.text('전체일정', leftX, y);
      
      const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));
      
      autoTable(doc, {
        startY: y + 4,
        head: [['일정', '내용']],
        body: sortedTimeline.map(item => [
          item.title,
          item.description || item.time,
        ]),
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          font: 'Pretendard',
          fontStyle: 'normal',
          lineColor: COLORS.borderLight,
          lineWidth: 0.15,
          textColor: COLORS.text,
        },
        headStyles: {
          fillColor: COLORS.headerBg,
          textColor: COLORS.text,
          fontStyle: 'normal',
          font: 'Pretendard',
        },
        alternateRowStyles: {},
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: halfWidth - 40 },
        },
        margin: { left: leftX, right: pageWidth - leftX - halfWidth },
        tableWidth: halfWidth,
      });
    }
    
    // 스태프 (우측)
    if (staff.length > 0) {
      doc.setFont('Pretendard', 'bold');
      doc.setFontSize(10);
      doc.text('스태프', rightX, y);
      
      autoTable(doc, {
        startY: y + 4,
        head: [['직책', '이름', '연락처']],
        body: staff.map(s => [
          s.position,
          s.name,
          s.phone,
        ]),
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          font: 'Pretendard',
          fontStyle: 'normal',
          lineColor: COLORS.borderLight,
          lineWidth: 0.15,
          textColor: COLORS.text,
        },
        headStyles: {
          fillColor: COLORS.headerBg,
          textColor: COLORS.text,
          fontStyle: 'normal',
          font: 'Pretendard',
        },
        alternateRowStyles: {},
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 24 },
          2: { cellWidth: halfWidth - 52 },
        },
        margin: { left: rightX, right: margin },
        tableWidth: halfWidth,
      });
    }
    
    const lastTableY = (doc as any).lastAutoTable?.finalY || y;
    y = lastTableY + 8;
  }
  
  // ========== 상세 모드에서만 출력되는 섹션들 ==========
  if (mode === 'detailed') {
    // ========== 5. 세부진행 ==========
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont('Pretendard', 'bold');
    doc.setFontSize(10);
    doc.text('세부진행', margin, y);
    y += 5;
    
    // 부서별 3열 그리드
    const deptGrid = [
      [
        { label: '연출', key: 'DIRECTING' },
        { label: '조연출', key: 'DIRECTING' },
        { label: '촬영/관련장비', key: 'CAMERA' },
      ],
      [
        { label: '정신머리', key: 'MAKEUP' },
        { label: '프리뷰', key: 'OTHER' },
        { label: '', key: '' },
      ],
      [
        { label: '조명', key: 'LIGHTING' },
        { label: '음향', key: 'SOUND' },
        { label: '미술', key: 'ART' },
      ],
      [
        { label: '의상', key: 'COSTUME' },
        { label: '제작', key: 'PRODUCTION' },
        { label: '기타', key: 'OTHER' },
      ],
    ];
    
    const colWidth = tableWidth / 3;
    const rowHeight = 16;
    const labelWidth = 28;
    
    doc.setFont('Pretendard', 'normal');
    
    deptGrid.forEach((row, rowIdx) => {
      row.forEach((dept, colIdx) => {
        if (!dept.label) return;
        
        const x = margin + colIdx * colWidth;
        const cellY = y + rowIdx * rowHeight;
        
        // 라벨 배경
        doc.setFillColor(...COLORS.headerBg);
        doc.rect(x, cellY, labelWidth, rowHeight, 'F');
        
        // 전체 셀 테두리
        doc.setDrawColor(...COLORS.borderLight);
        doc.setLineWidth(0.15);
        doc.rect(x, cellY, colWidth - 2, rowHeight);
        
        // 라벨 텍스트
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.text);
        doc.text(dept.label, x + 2, cellY + rowHeight / 2 + 2);
        
        // 내용
        const detail = departmentDetails.find(d => d.department === dept.key);
        if (detail) {
          doc.setFontSize(6.5);
          doc.text(detail.content.substring(0, 80), x + labelWidth + 2, cellY + 5, {
            maxWidth: colWidth - labelWidth - 6,
          });
        }
      });
    });
    
    y += deptGrid.length * rowHeight + 8;
    
    // ========== 6. 캐스트리스트 ==========
    if (casts.length > 0) {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFont('Pretendard', 'bold');
      doc.setFontSize(10);
      doc.text('캐스트리스트 및 배우집합', margin, y);
      y += 5;
      
      autoTable(doc, {
        startY: y,
        head: [[
          { content: '배역', styles: { halign: 'center' } },
          { content: '연기자', styles: { halign: 'center' } },
          { content: '집합시간', styles: { halign: 'center' } },
          { content: '집합위치', styles: { halign: 'center' } },
          { content: '동장면', styles: { halign: 'center' } },
          { content: '배우 준비 의상/소품', styles: { halign: 'center' } },
          { content: '연락처', styles: { halign: 'center' } },
        ]],
        body: casts.map(cast => [
          cast.role,
          cast.actorName,
          '',
          '',
          '',
          '',
          cast.phone,
        ]),
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          font: 'Pretendard',
          fontStyle: 'normal',
          lineColor: COLORS.borderLight,
          lineWidth: 0.15,
          textColor: COLORS.text,
        },
        headStyles: {
          fillColor: COLORS.headerBg,
          textColor: COLORS.text,
          fontStyle: 'normal',
          font: 'Pretendard',
        },
        alternateRowStyles: {},
        margin: { left: margin, right: margin },
        tableWidth: tableWidth,
      });
      
      y = (doc as any).lastAutoTable.finalY + 5;
    }
  }
  
  // ========== 페이지 번호 ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('Pretendard', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textGray);
    doc.text(
      `${i} / ${pageCount}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
}

// 총 촬영시간 계산
function calculateTotalShootingTime(scenes: Scene[]): string {
  const totalMinutes = scenes.reduce((acc, s) => acc + (s.estimatedDuration || 0), 0);
  if (totalMinutes === 0) return '-';
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}h ${mins}m`;
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
