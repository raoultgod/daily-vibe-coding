# Day 02 — 한 장: HWPX 리더

HWPX 보기와 PDF 저장만 제공하는 정적 웹앱입니다. 파일은 업로드하지 않고 브라우저 안에서 처리합니다. 서버 코드와 API 키가 필요 없습니다.

## Netlify 배포

GitHub 저장소 `raoultgod/daily-vibe-coding`을 Netlify에 연결하고 다음과 같이 설정합니다.

- Branch: `main`
- Base directory: `day-02-hwpx-reader`
- Build command: 비워두기
- Publish directory: `.` (Base directory 기준)
- 환경 변수: 없음

별도 빌드 과정은 없습니다. 또는 `day-02-hwpx-reader` 폴더 자체를 Netlify Drop에 올릴 수 있습니다. 폴더 안에 `index.html`, `app.js`, `font.ttf`, `engine/`이 모두 있어야 합니다.

## 로컬 실행

이 폴더에서 `python3 -m http.server 8765`를 실행하고 `http://localhost:8765`에 접속합니다. `index.html`을 파일로 직접 열면 브라우저 보안 제한 때문에 동작하지 않습니다.

## 제한과 라이선스

모든 문서의 원본 레이아웃과 완전히 동일함을 보장하지 않습니다. 복잡한 표·수식·글꼴·쪽 나눔은 다를 수 있으며, PDF를 공유하기 전에 확인하세요. 글꼴은 나눔고딕으로 대체됩니다. HWP 파일은 지원하지 않습니다.

- 엔진: `@auto-hwp/engine` 0.0.17, Apache-2.0 (`engine/LICENSE`)
- 글꼴: Nanum Gothic, SIL Open Font License (`FONT-LICENSE.txt`)
