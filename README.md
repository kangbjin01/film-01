# Film Sheet - 일일촬영계획표 관리 시스템

영화/드라마 촬영 현장을 위한 일일촬영계획표(일촬표) 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Backend**: PocketBase
- **PDF Export**: jsPDF, jspdf-autotable
- **Excel Export**: xlsx
- **Drag & Drop**: dnd-kit

## 📋 주요 기능

- 프로젝트(작품) 관리
- 일일촬영계획표 생성 및 편집
- 씬/컷 관리 (드래그 앤 드롭 순서 변경)
- 스태프/캐스트 관리
- PDF/Excel 내보내기
- 한글 폰트 지원 (Pretendard)

## 🛠️ 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. PocketBase 설정

PocketBase를 다운로드하고 `backend` 폴더에 배치합니다:

```bash
# Windows
cd backend
# pocketbase.exe를 다운로드하여 이 폴더에 배치
./pocketbase.exe serve
```

PocketBase Admin UI (http://127.0.0.1:8090/_/) 에서 초기 관리자 계정을 생성합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 앱을 확인합니다.

## 🐳 Docker로 배포

### Docker Compose 사용

```bash
docker-compose up -d
```

- Frontend: http://localhost:3000
- PocketBase: http://localhost:8090

## ☁️ Coolify 배포

### 방법 1: Docker Compose (권장)

1. Coolify에서 새 프로젝트 생성
2. "Docker Compose" 리소스 추가
3. GitHub 레포지토리 연결
4. `docker-compose.yml` 파일이 자동으로 감지됨
5. 환경변수 설정:
   - `NEXT_PUBLIC_POCKETBASE_URL`: PocketBase 서비스 URL

### 방법 2: 개별 서비스 배포

#### Frontend (Next.js)
1. "Docker" 리소스 추가
2. Dockerfile: `Dockerfile`
3. 포트: `3000`
4. 환경변수: `NEXT_PUBLIC_POCKETBASE_URL`

#### Backend (PocketBase)
1. "Docker" 리소스 추가
2. Dockerfile: `Dockerfile.pocketbase`
3. 포트: `8090`
4. 볼륨: `/pb/pb_data` (데이터 영속성)

### 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_POCKETBASE_URL` | PocketBase API URL | `https://api.your-domain.com` |

## 📁 프로젝트 구조

```
film-sheet/
├── backend/
│   ├── pb_migrations/    # PocketBase 마이그레이션
│   └── pocketbase.exe    # PocketBase 실행 파일 (로컬용)
├── public/
│   └── fonts/            # 한글 폰트 (Pretendard)
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # React 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── schedule/     # 스케줄 관련 컴포넌트
│   │   └── ui/           # shadcn/ui 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   ├── stores/           # Zustand 스토어
│   └── types/            # TypeScript 타입 정의
├── Dockerfile            # Next.js Docker 설정
├── Dockerfile.pocketbase # PocketBase Docker 설정
└── docker-compose.yml    # Docker Compose 설정
```

## 📝 라이선스

MIT License
