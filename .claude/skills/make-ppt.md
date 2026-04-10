---
description: "교육용 PPT/슬라이드를 HTML로 생성합니다. 사용법: /make-ppt [주제] [대상] [분량]"
---

# /make-ppt - PPT 슬라이드 생성

교육용 강의 슬라이드를 HTML로 생성하는 에이전트입니다.

## 입력 파싱

$ARGUMENTS 에서 다음 정보를 추출합니다:
- **주제**: 첫 번째 인자 또는 자연어에서 추출
- **대상**: 두 번째 인자 (기본값: "기업 실무자")
- **분량**: 세 번째 인자 (기본값: "30분")

예시:
- `/make-ppt AI 에이전트 활용법` → 주제: AI 에이전트 활용법
- `/make-ppt "ChatGPT 실무 활용" "마케팅 팀" "2시간"` → 주제, 대상, 분량 모두 지정

## 실행

`agents/ppt-generator/CLAUDE.md`에 정의된 워크플로우를 실행합니다.

**반드시 참조할 파일:**
1. `agents/ppt-generator/CLAUDE.md` - 전체 워크플로우
2. `agents/ppt-generator/style-guide.md` - 디자인 가이드라인
3. `agents/_shared/common-rules.md` - 공통 규칙

**결과물 저장 경로:**
`agents/ppt-generator/output/{YYYY-MM-DD}_{주제요약}.html`

## 워크플로우 요약
1. 요청 분석 (주제, 대상, 분량, 스타일)
2. 목차 구성 → 사용자 확인
3. HTML 슬라이드 생성 (style-guide.md 적용)
4. 결과물 저장
5. (선택) PPT 변환: `python3 agents/ppt-generator/convert.py {파일경로}`
