# Film Sheet - 일일촬영계획표 관리 시스템

영화/드라마 촬영 현장을 위한 일일촬영계획표(일촬표) 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Database**: PostgreSQL + Prisma ORM
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

### 2. 환경변수 설정

`.env` 파일을 생성하고 DATABASE_URL을 설정합니다:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/filmsheet?schema=public"
```

### 3. 데이터베이스 설정

PostgreSQL이 실행 중이어야 합니다. Docker를 사용하면 편리합니다:

```bash
# PostgreSQL 컨테이너 실행
docker run --name filmsheet-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=filmsheet -p 5432:5432 -d postgres:16-alpine
```

### 4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 앱을 확인합니다.

## 🐳 Docker로 배포

### Docker Compose 사용

```bash
docker-compose up -d
```

이 명령어는 다음을 자동으로 설정합니다:
- Next.js 앱 (포트 3000)
- PostgreSQL 데이터베이스 (내부에서만 접근)
- 데이터베이스 마이그레이션

## ☁️ Coolify 배포

### 1. Docker Compose로 배포 (권장)

1. Coolify에서 새 프로젝트 생성
2. **+ Add** → **Docker Compose** 선택
3. GitHub 레포지토리 연결
4. `docker-compose.yml` 파일이 자동으로 감지됨
5. **Deploy** 클릭

### 2. 환경변수 (자동 설정됨)

Docker Compose를 사용하면 `DATABASE_URL`이 자동으로 설정됩니다.
별도의 환경변수 설정이 필요하지 않습니다.

### 3. 하나의 도메인만 필요!

```
사용자 브라우저
    ↓
https://your-domain.com (Next.js + API + DB)
```

PostgreSQL은 외부에 노출되지 않고, Next.js API Routes를 통해서만 접근합니다.

## 📁 프로젝트 구조

```
film-sheet/
├── prisma/
│   └── schema.prisma     # 데이터베이스 스키마
├── public/
│   └── fonts/            # 한글 폰트 (Pretendard)
├── src/
│   ├── app/
│   │   ├── api/          # API Routes (서버 사이드)
│   │   └── ...           # 페이지 컴포넌트
│   ├── components/       # React 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── schedule/     # 스케줄 관련 컴포넌트
│   │   └── ui/           # shadcn/ui 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   │   └── prisma.ts     # Prisma 클라이언트
│   ├── stores/           # Zustand 스토어
│   └── types/            # TypeScript 타입 정의
├── Dockerfile            # Docker 설정
└── docker-compose.yml    # Docker Compose 설정
```

## 🔧 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects` | 모든 프로젝트 조회 |
| POST | `/api/projects` | 새 프로젝트 생성 |
| GET | `/api/projects/[id]` | 단일 프로젝트 조회 |
| PATCH | `/api/projects/[id]` | 프로젝트 수정 |
| DELETE | `/api/projects/[id]` | 프로젝트 삭제 |
| GET | `/api/projects/[id]/schedules` | 프로젝트의 일촬표 목록 |
| POST | `/api/projects/[id]/schedules` | 새 일촬표 생성 |
| GET | `/api/schedules/[id]` | 단일 일촬표 조회 (씬, 타임라인 포함) |
| PATCH | `/api/schedules/[id]` | 일촬표 수정 |
| DELETE | `/api/schedules/[id]` | 일촬표 삭제 |
| GET | `/api/schedules/[id]/scenes` | 일촬표의 씬 목록 |
| POST | `/api/schedules/[id]/scenes` | 새 씬 생성 |
| PATCH | `/api/scenes/[id]` | 씬 수정 |
| DELETE | `/api/scenes/[id]` | 씬 삭제 |
| POST | `/api/scenes/reorder` | 씬 순서 변경 |

## 📝 라이선스

MIT License
