#!/usr/bin/env python3
"""
구글 시트 초기 세팅 스크립트.
카카오톡 아카이빙용 스프레드시트를 자동으로 생성하고 카테고리별 시트 탭을 만듭니다.

사용법:
    python3 agents/kakao-archiver/setup_google_sheets.py

.env 파일에서 인증 정보를 자동으로 로드합니다.
"""

import os
import sys
from pathlib import Path

# .env 파일 자동 로드
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

try:
    from googleapiclient.discovery import build
except ImportError:
    print("Google API 패키지가 설치되지 않았습니다.")
    print("설치: pip install google-api-python-client")
    sys.exit(1)

CATEGORIES = ["학습자료", "강의소재", "트렌드", "아이디어", "도구_툴", "기타"]
HEADERS = ["날짜", "유형", "원본 내용", "제목", "키워드", "요약", "활용 메모"]


def setup_with_service_account(creds_path: str):
    """서비스 계정으로 스프레드시트를 생성합니다 (생성 + 쓰기 가능)."""
    from google.oauth2.service_account import Credentials

    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    sheets_service = build("sheets", "v4", credentials=creds)

    print("스프레드시트를 생성합니다...")
    spreadsheet = sheets_service.spreadsheets().create(
        body={
            "properties": {"title": "카카오톡 아카이브"},
            "sheets": [{"properties": {"title": cat}} for cat in CATEGORIES],
        }
    ).execute()

    spreadsheet_id = spreadsheet["spreadsheetId"]
    _setup_headers_and_format(sheets_service, spreadsheet_id, spreadsheet)
    return spreadsheet_id


def setup_with_existing_sheet(spreadsheet_id: str, api_key: str):
    """기존 스프레드시트에 카테고리 탭과 헤더를 설정합니다 (API 키 방식)."""
    service = build("sheets", "v4", developerKey=api_key)

    print(f"기존 스프레드시트({spreadsheet_id})에 탭을 설정합니다...")

    # 기존 탭 확인
    sheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    existing_tabs = {s["properties"]["title"] for s in sheet["sheets"]}

    missing = [cat for cat in CATEGORIES if cat not in existing_tabs]
    if missing:
        print(f"  누락된 탭: {', '.join(missing)}")
        print("  API 키로는 탭 생성이 불가합니다.")
        print("  구글 시트에서 직접 다음 탭을 추가해 주세요:")
        for cat in missing:
            print(f"    - {cat}")
    else:
        print("  모든 카테고리 탭이 존재합니다.")

    return spreadsheet_id


def _setup_headers_and_format(service, spreadsheet_id, spreadsheet):
    """헤더와 서식을 설정합니다."""
    # 헤더 입력
    data = [{"range": f"{cat}!A1:G1", "values": [HEADERS]} for cat in CATEGORIES]
    service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"valueInputOption": "RAW", "data": data},
    ).execute()

    # 서식 (볼드 + 배경색 + 열 너비)
    sheet_ids = {
        s["properties"]["title"]: s["properties"]["sheetId"]
        for s in spreadsheet["sheets"]
    }
    requests = []
    for cat, sid in sheet_ids.items():
        requests.append({
            "repeatCell": {
                "range": {"sheetId": sid, "startRowIndex": 0, "endRowIndex": 1},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "backgroundColor": {"red": 0.85, "green": 0.92, "blue": 1.0},
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)",
            }
        })
        for start, end, px in [(0, 1, 110), (2, 3, 300), (5, 6, 250)]:
            requests.append({
                "updateDimensionProperties": {
                    "range": {"sheetId": sid, "dimension": "COLUMNS", "startIndex": start, "endIndex": end},
                    "properties": {"pixelSize": px},
                    "fields": "pixelSize",
                }
            })

    service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": requests},
    ).execute()


def main():
    creds_path = os.environ.get("GOOGLE_SHEETS_CREDENTIALS_PATH")
    api_key = os.environ.get("GOOGLE_API_KEY")
    existing_id = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID")

    print("=" * 60)
    print("카카오톡 아카이브 구글 시트 세팅")
    print("=" * 60)
    print()

    # 방법 1: 서비스 계정으로 새 시트 생성
    if creds_path and os.path.exists(creds_path):
        spreadsheet_id = setup_with_service_account(creds_path)

    # 방법 2: 이미 시트가 있고 API 키가 있는 경우
    elif existing_id and api_key:
        spreadsheet_id = setup_with_existing_sheet(existing_id, api_key)

    # 방법 3: API 키만 있는 경우 → 수동 생성 안내
    elif api_key:
        print("API 키가 설정되어 있습니다.")
        print()
        print("구글 시트를 수동으로 생성해 주세요:")
        print()
        print("1. https://sheets.google.com 에서 새 스프레드시트 생성")
        print('2. 이름을 "카카오톡 아카이브"로 변경')
        print("3. 다음 시트 탭을 추가 (기본 Sheet1은 삭제):")
        for cat in CATEGORIES:
            print(f"   - {cat}")
        print("4. 각 탭의 A1:G1에 다음 헤더를 입력:")
        print(f"   {' | '.join(HEADERS)}")
        print()
        print("5. 스프레드시트를 '링크가 있는 모든 사용자 - 편집자'로 공유")
        print()
        print("6. URL에서 스프레드시트 ID를 복사하여 .env에 추가:")
        print("   URL: https://docs.google.com/spreadsheets/d/{이 부분이 ID}/edit")
        print('   .env에 추가: GOOGLE_SHEETS_SPREADSHEET_ID=복사한ID')
        print()
        print("7. 이 스크립트를 다시 실행하면 확인합니다.")
        return

    else:
        print("인증 정보가 없습니다.")
        print(".env 파일에 GOOGLE_API_KEY를 설정해 주세요.")
        return

    print()
    print("=" * 60)
    print("세팅 완료!")
    print("=" * 60)
    print()
    print(f"스프레드시트 ID: {spreadsheet_id}")
    print(f"URL: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
    print()
    if not existing_id:
        print(".env 파일에 다음을 추가하세요:")
        print(f"GOOGLE_SHEETS_SPREADSHEET_ID={spreadsheet_id}")


if __name__ == "__main__":
    main()
