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

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 확인.
