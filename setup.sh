#!/bin/bash
# ============================================
# 자비스 에이전트 시스템 - 원클릭 세팅 스크립트
# 맥미니에서 이 스크립트 하나만 실행하면 됩니다.
# ============================================

set -e
cd "$(dirname "$0")"

echo "============================================"
echo "  자비스 에이전트 시스템 세팅 시작"
echo "============================================"
echo ""

# 1. Python 패키지 설치
echo "[1/4] Python 패키지 설치 중..."
pip3 install python-pptx beautifulsoup4 google-api-python-client google-auth google-auth-httplib2 2>/dev/null || pip install python-pptx beautifulsoup4 google-api-python-client google-auth google-auth-httplib2
echo "  완료"
echo ""

# 2. 구글 시트 생성
echo "[2/4] 구글 시트 생성 중..."
SHEET_ID=$(python3 -c "
import os, sys
from pathlib import Path

env_path = Path('.env')
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ.setdefault(key.strip(), val.strip())

creds_path = os.environ.get('GOOGLE_SHEETS_CREDENTIALS_PATH', '.credentials.json')
if not os.path.exists(creds_path):
    print('ERROR:credentials_not_found', file=sys.stderr)
    sys.exit(1)

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
sheets = build('sheets', 'v4', credentials=creds)
drive = build('drive', 'v3', credentials=creds)

CATEGORIES = ['학습자료', '강의소재', '트렌드', '아이디어', '도구_툴', '기타']
HEADERS = ['날짜', '유형', '원본 내용', '제목', '키워드', '요약', '활용 메모']

# 시트 생성
sp = sheets.spreadsheets().create(body={
    'properties': {'title': '카카오톡 아카이브'},
    'sheets': [{'properties': {'title': c}} for c in CATEGORIES],
}).execute()
sid = sp['spreadsheetId']

# 헤더 입력
data = [{'range': f'{c}!A1:G1', 'values': [HEADERS]} for c in CATEGORIES]
sheets.spreadsheets().values().batchUpdate(
    spreadsheetId=sid, body={'valueInputOption': 'RAW', 'data': data}
).execute()

# 본인 구글 드라이브에서 보이도록 공유 설정
# 서비스 계정 소유 파일을 '링크가 있는 모든 사용자'에게 공개
drive.permissions().create(
    fileId=sid,
    body={'type': 'anyone', 'role': 'writer'},
    fields='id'
).execute()

print(sid)
")

if [ $? -eq 0 ] && [ -n "$SHEET_ID" ]; then
    echo "  구글 시트 생성 완료!"
    echo "  ID: $SHEET_ID"
    echo "  URL: https://docs.google.com/spreadsheets/d/$SHEET_ID"

    # .env에 시트 ID 추가
    if grep -q "GOOGLE_SHEETS_SPREADSHEET_ID" .env 2>/dev/null; then
        sed -i '' "s|.*GOOGLE_SHEETS_SPREADSHEET_ID.*|GOOGLE_SHEETS_SPREADSHEET_ID=$SHEET_ID|" .env 2>/dev/null || \
        sed -i "s|.*GOOGLE_SHEETS_SPREADSHEET_ID.*|GOOGLE_SHEETS_SPREADSHEET_ID=$SHEET_ID|" .env
    else
        echo "GOOGLE_SHEETS_SPREADSHEET_ID=$SHEET_ID" >> .env
    fi
    echo "  .env에 시트 ID 저장 완료"
else
    echo "  구글 시트 생성 실패. .credentials.json 파일을 확인하세요."
fi
echo ""

# 3. 샘플 데이터로 구글 시트 기록 테스트
echo "[3/4] 샘플 데이터로 구글 시트 기록 테스트..."
if [ -n "$SHEET_ID" ]; then
    python3 agents/kakao-archiver/sheets_writer.py agents/kakao-archiver/output/2026-04-10_sample.json
    echo "  기록 완료! 구글 시트에서 확인하세요."
else
    echo "  건너뜀 (시트 ID 없음)"
fi
echo ""

# 4. PPT 변환 테스트
echo "[4/4] PPT 변환 테스트..."
if [ -f "agents/ppt-generator/output/2026-04-10_ChatGPT실무활용법.html" ]; then
    python3 agents/ppt-generator/convert.py "agents/ppt-generator/output/2026-04-10_ChatGPT실무활용법.html"
else
    echo "  HTML 파일 없음, 건너뜀"
fi
echo ""

echo "============================================"
echo "  세팅 완료!"
echo "============================================"
echo ""
echo "사용 가능한 슬래시 커맨드:"
echo "  /jarvis          - 자비스 비서실장"
echo "  /make-ppt        - PPT 슬라이드 생성"
echo "  /design-course   - 교육 과정 설계"
echo "  /research        - 리서치"
echo "  /kakao-archive   - 카톡 아카이빙"
echo "  /improve-agent   - 에이전트 자기 개선"
echo ""
if [ -n "$SHEET_ID" ]; then
    echo "구글 시트: https://docs.google.com/spreadsheets/d/$SHEET_ID"
fi
echo ""
