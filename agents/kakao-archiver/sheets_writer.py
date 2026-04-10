#!/usr/bin/env python3
"""
카카오톡 아카이빙 내용을 구글 시트에 카테고리별로 기록하는 스크립트.

사용법:
    python3 sheets_writer.py <input.json>

인증 방법 (우선순위):
    1. 서비스 계정: GOOGLE_SHEETS_CREDENTIALS_PATH 환경변수
    2. API 키: GOOGLE_API_KEY 환경변수 (공개 시트에만 쓰기 가능)
    3. .env 파일에서 자동 로드

필요 패키지:
    pip install google-auth google-auth-oauthlib google-api-python-client python-dotenv
"""

import json
import os
import sys
from datetime import datetime
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
    print("설치: pip install google-api-python-client python-dotenv")
    sys.exit(1)


# 카테고리 → 시트 탭 매핑
CATEGORY_SHEETS = {
    "학습자료": "학습자료",
    "강의소재": "강의소재",
    "트렌드": "트렌드",
    "아이디어": "아이디어",
    "도구/툴": "도구_툴",
    "기타": "기타",
}

HEADERS = ["날짜", "유형", "원본 내용", "제목", "키워드", "요약", "활용 메모"]


def get_sheets_service():
    """Google Sheets API 서비스 객체를 생성합니다."""
    # 방법 1: 서비스 계정
    creds_path = os.environ.get("GOOGLE_SHEETS_CREDENTIALS_PATH")
    if creds_path and os.path.exists(creds_path):
        from google.oauth2.service_account import Credentials
        SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
        creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        return build("sheets", "v4", credentials=creds)

    # 방법 2: API 키
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        return build("sheets", "v4", developerKey=api_key)

    print("인증 정보가 없습니다.")
    print("  .env 파일에 GOOGLE_API_KEY 또는 GOOGLE_SHEETS_CREDENTIALS_PATH를 설정하세요.")
    sys.exit(1)


def ensure_sheet_tabs(service, spreadsheet_id: str):
    """카테고리별 시트 탭이 존재하는지 확인하고, 없으면 생성합니다."""
    sheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    existing_tabs = {s["properties"]["title"] for s in sheet["sheets"]}

    requests = []
    for tab_name in CATEGORY_SHEETS.values():
        if tab_name not in existing_tabs:
            requests.append({
                "addSheet": {"properties": {"title": tab_name}}
            })

    if requests:
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={"requests": requests},
        ).execute()
        print(f"  새 시트 탭 {len(requests)}개 생성")

    # 각 탭에 헤더가 없으면 추가
    for tab_name in CATEGORY_SHEETS.values():
        result = (
            service.spreadsheets().values()
            .get(spreadsheetId=spreadsheet_id, range=f"{tab_name}!A1:G1")
            .execute()
        )
        if not result.get("values", []):
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{tab_name}!A1:G1",
                valueInputOption="RAW",
                body={"values": [HEADERS]},
            ).execute()


def write_items(service, spreadsheet_id: str, items: list[dict]):
    """아이템들을 카테고리별 시트에 기록합니다."""
    by_category: dict[str, list] = {}
    for item in items:
        category = item.get("category", "기타")
        tab_name = CATEGORY_SHEETS.get(category, "기타")
        if tab_name not in by_category:
            by_category[tab_name] = []
        by_category[tab_name].append([
            item.get("date", datetime.now().strftime("%Y-%m-%d")),
            item.get("type", ""),
            item.get("original", ""),
            item.get("title", ""),
            item.get("keywords", ""),
            item.get("summary", ""),
            "",
        ])

    total = 0
    for tab_name, rows in by_category.items():
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=f"{tab_name}!A:G",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": rows},
        ).execute()
        total += len(rows)
        print(f"  {tab_name}: {len(rows)}건 기록")

    return total


def main():
    if len(sys.argv) < 2:
        print("사용법: python3 sheets_writer.py <input.json>")
        sys.exit(1)

    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        print(f"파일을 찾을 수 없습니다: {input_path}")
        sys.exit(1)

    spreadsheet_id = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID")
    if not spreadsheet_id:
        print("GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.")
        print("  .env 파일에 추가하거나 setup_google_sheets.py를 먼저 실행하세요.")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    if not items:
        print("정리할 항목이 없습니다.")
        return

    print(f"총 {len(items)}건을 구글 시트에 기록합니다...")
    service = get_sheets_service()
    ensure_sheet_tabs(service, spreadsheet_id)
    total = write_items(service, spreadsheet_id, items)
    print(f"\n구글 시트 기록 완료: 총 {total}건")


if __name__ == "__main__":
    main()
