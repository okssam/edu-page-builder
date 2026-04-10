# 카카오톡 아카이빙 스케줄 설정 가이드

## 방법 1: Claude Code 스케줄 기능 (권장)

Claude Code의 내장 스케줄 기능을 사용합니다.
맥미니에서 Claude Code가 실행 중인 상태에서 다음 명령을 실행하세요:

```
/schedule create --cron "0 5 * * *" --prompt "카카오톡 정옥선 대화창에서 어제 메시지를 수집하여 구글 시트에 정리해줘. agents/kakao-archiver/CLAUDE.md 워크플로우를 따라 실행해." --name "카톡 아카이빙"
```

## 방법 2: macOS launchd (대안)

맥미니에서 launchd를 사용하여 새벽 5시에 자동 실행합니다.

### 1. plist 파일 생성

`~/Library/LaunchAgents/com.okssam.kakao-archive.plist` 파일을 생성합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.okssam.kakao-archive</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ~/edu-page-builder && claude -p "카카오톡 정옥선 대화창에서 어제 메시지를 수집하여 구글 시트에 정리해줘. agents/kakao-archiver/CLAUDE.md 워크플로우를 따라 실행해."</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>5</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/kakao-archive.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/kakao-archive-error.log</string>
</dict>
</plist>
```

### 2. launchd에 등록

```bash
launchctl load ~/Library/LaunchAgents/com.okssam.kakao-archive.plist
```

### 3. 상태 확인

```bash
launchctl list | grep kakao
```

### 4. 해제

```bash
launchctl unload ~/Library/LaunchAgents/com.okssam.kakao-archive.plist
```

## 방법 3: n8n 자동화 (고급)

n8n 워크플로우를 사용하여 스케줄링할 수도 있습니다.

```
[Schedule Trigger: 매일 05:00]
  → [Execute Command: claude -p "..."]
  → [IF 성공: 로그 기록]
  → [IF 실패: 텔레그램/카톡 알림]
```

## 로그 확인

실행 결과 로그는 다음 위치에서 확인할 수 있습니다:
- Claude Code 스케줄: Claude Code 대시보드
- launchd: `/tmp/kakao-archive.log`
- n8n: n8n 실행 이력

## 주의사항

- 맥미니가 새벽 5시에 깨어 있어야 합니다 (잠자기 모드 해제)
- 카카오톡 PC 앱이 로그인된 상태여야 합니다
- 오픈 클로우가 실행 중이어야 합니다 (컴퓨터 유즈 방식)
- 구글 시트 API 인증이 설정되어 있어야 합니다
