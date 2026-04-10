---
description: "맞춤형 AI 교육 과정을 설계합니다. 사용법: /design-course [고객사명] [직무] [수준]"
---

# /design-course - 교육 과정 설계

고객사 맞춤형 AI 활용 교육 과정과 실습 시나리오를 설계합니다.

## 입력 파싱

$ARGUMENTS 에서 다음 정보를 추출합니다:
- **고객사명**: 첫 번째 인자 (필수 - 없으면 질문)
- **직무**: 두 번째 인자 (기본값: "전 직무")
- **수준**: 세 번째 인자 (기본값: "초급")

예시:
- `/design-course 삼성전자` → 삼성전자, 전 직무, 초급
- `/design-course "LG전자" "마케팅" "중급"` → 모든 인자 지정

## 실행

`agents/edu-designer/CLAUDE.md`에 정의된 워크플로우를 실행합니다.

**반드시 참조할 파일:**
1. `agents/edu-designer/CLAUDE.md` - 전체 워크플로우
2. `agents/edu-designer/evaluation-criteria.md` - 평가 기준
3. `agents/_shared/common-rules.md` - 공통 규칙

**결과물 저장 경로:**
```
agents/edu-designer/output/{YYYY-MM-DD}_{고객사명}/
  ├── 교육과정_설계안.md
  ├── 실습시나리오_10선.md
  ├── 평가기준표.md
  └── 수강생_피드백_양식.md
```

## 워크플로우 요약
1. 고객사 정보 수집 (누락 시 질문)
2. 교육 과정 프레임 설계
3. 맞춤형 실습 시나리오 10가지 생성
4. 평가 기준 생성
5. 결과물 저장
