---
description: "AI 트렌드 리서치, URL 분석, 경쟁 분석을 수행합니다. 사용법: /research [주제 또는 URL]"
---

# /research - 리서치 에이전트

AI 트렌드 리서치, URL 분석, 경쟁 채널 분석을 수행합니다.

## 입력 파싱

$ARGUMENTS 내용에 따라 모드를 자동 선택합니다:

- **URL이 포함된 경우** → 모드 2 (URL 분석)
- **"트렌드", "모니터링" 키워드** → 모드 3 (트렌드 모니터링)
- **"경쟁", "분석", "채널" 키워드** → 모드 4 (경쟁 분석)
- **그 외** → 모드 1 (주제 리서치)

예시:
- `/research AI 에이전트 트렌드` → 모드 1: 주제 리서치
- `/research https://...` → 모드 2: URL 분석
- `/research 트렌드 모니터링` → 모드 3: 트렌드 모니터링
- `/research 경쟁 채널 분석` → 모드 4: 경쟁 분석

## 실행

`agents/researcher/CLAUDE.md`에 정의된 워크플로우를 실행합니다.

**반드시 참조할 파일:**
1. `agents/researcher/CLAUDE.md` - 전체 워크플로우
2. `agents/researcher/sources.md` - 모니터링 소스 목록
3. `agents/_shared/common-rules.md` - 공통 규칙

**결과물 저장 경로:**
`agents/researcher/output/{YYYY-MM-DD}_{주제요약}.md`
