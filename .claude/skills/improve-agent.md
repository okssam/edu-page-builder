---
description: "에이전트를 자동 개선합니다 (오토 리서치). 사용법: /improve-agent [에이전트명] [반복횟수]"
---

# /improve-agent - 에이전트 자기 개선 (오토 리서치)

지정된 에이전트의 결과물을 평가하고, 자동으로 개선 루프를 돌립니다.

## 입력 파싱

$ARGUMENTS 에서 다음 정보를 추출합니다:
- **에이전트명**: ppt-generator, edu-designer, researcher, self-critique (필수)
- **반복횟수**: 숫자 (기본값: 3)

예시:
- `/improve-agent ppt-generator` → PPT 에이전트 3회 개선
- `/improve-agent edu-designer 5` → 교육 설계 에이전트 5회 개선
- `/improve-agent self-critique` → 전체 시스템 비판적 검토

## 실행

### "self-critique" 모드
`agents/_shared/meta-skills/self-critique.md`를 참조하여 전체 시스템을 검토합니다.

### 일반 에이전트 개선 모드
`agents/_shared/meta-skills/auto-research.md`를 참조하여 다음을 수행합니다:

1. **평가**: 해당 에이전트의 최근 output/ 결과물을 가져와서 CLAUDE.md에 정의된 평가 기준으로 채점
2. **분석**: 낮은 점수 항목의 원인 분석
3. **개선**: 에이전트의 CLAUDE.md 또는 관련 파일 수정
4. **재실행**: 동일 작업을 수정된 설정으로 재실행
5. **비교**: 개선 전후 점수 비교 → 반영 또는 롤백
6. **반복**: 지정된 횟수만큼 반복

## 결과물
개선 리포트를 생성합니다:
`agents/_shared/meta-skills/output/{YYYY-MM-DD}_{에이전트명}_개선리포트.md`

## 참조
- agents/_shared/meta-skills/auto-research.md
- agents/_shared/meta-skills/self-critique.md
- 대상 에이전트의 CLAUDE.md
