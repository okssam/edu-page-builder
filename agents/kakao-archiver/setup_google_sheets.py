#!/usr/bin/env python3
"""
구글 시트 초기 세팅 스크립트.
카카오톡 아카이빙용 스프레드시트를 자동으로 생성하고 카테고리별 시트 탭을 만듭니다.

사용법:
    1. Google Cloud Console에서 서비스 계정 JSON 키를 다운로드합니다
    2. 환경변수를 설정합니다:
       export GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json
    3. 이 스크립트를 실행합니다:
       python3 setup_google_sheets.py

결과:
    - "카카오톡 아카이브" 스프레드시트가 생성됩니다
    - 6개 카테고리 시트 탭이 자동 생성됩니다
    - 각 탭에 헤더가 설정됩니다
    - 스프레드시트 ID가 출력됩니다 (settings.json에 등록할 값)
"""

import os
import sys

try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print("Google API 패키지가 설치되지 않았습니다.")
    print("설치: pip install google-auth google-auth-oauthlib google-api-python-client")
    sys.exit(1)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

CATEGORIES = ["학습자료", "강의소재", "트렌드", "아이디어", "도구_툴", "기타"]
HEADERS = ["날짜", "유형", "원본 내용", "제목", "키워드", "요약", "활용 메모"]


def main():
    creds_path = os.environ.get("GOOGLE_SHEETS_CREDENTIALS_PATH")
    if not creds_path:
        print("=" * 60)
        print("구글 시트 초기 세팅 가이드")
        print("=" * 60)
        print()
        print("1. Google Cloud Console (https://console.cloud.google.com) 접속")
        print("2. 새 프로젝트 생성 (예: kakao-archive)")
        print("3. API 라이브러리에서 다음 API 활성화:")
        print("   - Google Sheets API")
        print("   - Google Drive API")
        print("4. '사용자 인증 정보' → '서비스 계정 만들기'")
        print("5. 서비스 계정 생성 후 '키 추가' → JSON 다운로드")
        print("6. 다운로드한 JSON 파일 경로를 환경변수에 설정:")
        print()
        print("   export GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json")
        print()
        print("7. 이 스크립트를 다시 실행합니다:")
        print("   python3 agents/kakao-archiver/setup_google_sheets.py")
        print()
        print("=" * 60)
        return

    if not os.path.exists(creds_path):
        print(f"인증 파일을 찾을 수 없습니다: {creds_path}")
        sys.exit(1)

    creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    sheets_service = build("sheets", "v4", credentials=creds)
    drive_service = build("drive", "v3", credentials=creds)

    # 1. 스프레드시트 생성
    print("스프레드시트를 생성합니다...")
    spreadsheet = sheets_service.spreadsheets().create(
        body={
            "properties": {"title": "카카오톡 아카이브"},
            "sheets": [
                {"properties": {"title": cat}} for cat in CATEGORIES
            ],
        }
    ).execute()

    spreadsheet_id = spreadsheet["spreadsheetId"]
    print(f"스프레드시트 생성 완료!")
    print(f"  ID: {spreadsheet_id}")

    # 2. 각 탭에 헤더 설정
    print("각 시트 탭에 헤더를 설정합니다...")
    data = []
    for cat in CATEGORIES:
        data.append({
            "range": f"{cat}!A1:G1",
            "values": [HEADERS],
        })

    sheets_service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"valueInputOption": "RAW", "data": data},
    ).execute()

    # 3. 헤더 행 서식 (볼드 + 배경색)
    sheet_ids = {}
    for sheet in spreadsheet["sheets"]:
        sheet_ids[sheet["properties"]["title"]] = sheet["properties"]["sheetId"]

    requests = []
    for cat, sheet_id in sheet_ids.items():
        # 헤더 볼드
        requests.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "backgroundColor": {"red": 0.85, "green": 0.92, "blue": 1.0},
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)",
            }
        })
        # 열 너비 조정
        requests.append({
            "updateDimensionProperties": {
                "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1},
                "properties": {"pixelSize": 110},
                "fields": "pixelSize",
            }
        })
        requests.append({
            "updateDimensionProperties": {
                "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 2, "endIndex": 3},
                "properties": {"pixelSize": 300},
                "fields": "pixelSize",
            }
        })
        requests.append({
            "updateDimensionProperties": {
                "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 5, "endIndex": 6},
                "properties": {"pixelSize": 250},
                "fields": "pixelSize",
            }
        })

    sheets_service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": requests},
    ).execute()

    # 4. 소유자에게 편집 권한 부여 안내
    print()
    print("=" * 60)
    print("세팅 완료!")
    print("=" * 60)
    print()
    print(f"스프레드시트 ID: {spreadsheet_id}")
    print()
    print("다음 단계:")
    print(f"1. 구글 시트 열기:")
    print(f"   https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
    print()
    print("2. 서비스 계정에서 본인 이메일로 공유:")
    print("   스프레드시트 → 공유 → 본인 이메일 추가 (편집자)")
    print()
    print("3. settings.json에 스프레드시트 ID 등록:")
    print(f'   "GOOGLE_SHEETS_SPREADSHEET_ID": "{spreadsheet_id}"')
    print()
    print("4. 환경변수에도 등록:")
    print(f'   export GOOGLE_SHEETS_SPREADSHEET_ID="{spreadsheet_id}"')
    print()


if __name__ == "__main__":
    main()
