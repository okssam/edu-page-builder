# 클로페이지

교육 신청, 협회원 모집, 세미나/행사 홍보용 상세페이지를 빠르게 만드는 웹서비스 MVP입니다.

## 현재 포함된 것

- Next.js App Router 기반 프로젝트 생성
- 메인 랜딩 페이지
- 대시보드 목업
- 새 상세페이지 생성 화면 목업
- 향후 Supabase/Vercel 연결을 위한 기본 구조

## 추천 다음 단계

1. Supabase 프로젝트 생성
2. 인증(Auth) 연결
3. pages 테이블 설계 및 마이그레이션
4. 실제 저장/불러오기 기능 연결
5. 공개 상세페이지 라우트 `/p/[slug]` 구현
6. Vercel 배포

## 자비스 AI 에이전트 시스템

이 프로젝트에는 업무 자동화를 위한 AI 에이전트 시스템이 포함되어 있습니다.

### 에이전트 구성

| 에이전트 | 역할 | 슬래시 커맨드 |
|---------|------|-------------|
| 자비스 | 비서실장 - 요청을 분석하여 적절한 에이전트로 라우팅 | `/jarvis` |
| PPT 생성기 | 교육용 슬라이드를 HTML로 생성 + PPTX 변환 | `/make-ppt` |
| 교육 설계사 | 맞춤형 교육 과정, 실습 시나리오, 평가 도구 설계 | `/design-course` |
| 리서처 | AI 트렌드 리서치, URL 분석, 경쟁 분석 | `/research` |
| 카톡 아카이버 | 카카오톡 메모를 구글 시트에 카테고리별 정리 (매일 5AM) | `/kakao-archive` |
| 에이전트 개선 | 오토 리서치 방식의 자기 개선 루프 | `/improve-agent` |

### 사용법

Claude Code에서 슬래시 커맨드를 실행하면 됩니다:

```
/make-ppt "AI 활용법" "기업 신입사원" "30분"
/design-course "삼성전자" "마케팅" "초급"
/research "최신 AI 에이전트 트렌드"
/kakao-archive
/improve-agent ppt-generator
```

### 폴더 구조

```
agents/
├── jarvis/           자비스 (라우터)
├── ppt-generator/    PPT 생성
├── edu-designer/     교육 설계
├── researcher/       리서치
├── kakao-archiver/   카톡 아카이빙
└── _shared/          공통 리소스 + 메타 스킬
```

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 확인.
