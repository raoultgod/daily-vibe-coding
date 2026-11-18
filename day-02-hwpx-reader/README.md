# Day 02 — 한 장: HWPX 리더

HWPX 보기와 PDF 저장만 제공하는 정적 웹앱입니다. 문서는 서버에 업로드하지 않고 브라우저에서 처리합니다. 서버 코드와 API 키가 필요 없습니다.

## 사용 방법

HWPX 파일을 열고 **PDF로 저장**을 누른 뒤, 브라우저 인쇄 창의 대상을 **PDF로 저장**으로 선택합니다. 배경 그래픽이 빠진다면 인쇄 설정에서 배경 그래픽을 켜세요. 브라우저·운영체제에 따라 인쇄 창의 이름과 설정이 다를 수 있습니다.

## Netlify 배포

GitHub 저장소 `raoultgod/daily-vibe-coding`을 Netlify에 연결하고 다음과 같이 설정합니다.

- Branch: `main`
- Base directory: `day-02-hwpx-reader`
- Build command: 비워두기
- Publish directory: `.` (Base directory 기준)
- 환경 변수: 없음

별도 빌드 과정은 없습니다. 또는 `day-02-hwpx-reader` 폴더 자체를 Netlify Drop에 올릴 수 있습니다. `index.html`, `app.js`, `font.ttf`, `rhwp/`, `vendor/`가 포함되어야 합니다.

## 로컬 실행

이 폴더에서 `python3 -m http.server 8765`를 실행하고 `http://localhost:8765`에 접속합니다. `index.html`을 직접 열면 브라우저 보안 제한으로 동작하지 않습니다.

## 테스트

공공기관 문서를 테스트용으로 직접 다운로드해 별도 폴더에 `msit.hwpx`, `uiwang.hwpx`로 저장한 후 `HWPX_FIXTURES=/path/to/samples node tests/render-regression.mjs`를 실행합니다. PDF 회귀 검사는 같은 자료로 브라우저에서 생성한 PDF `msit.pdf`, `uiwang.pdf`, `bupyeong.pdf`, `iksan.pdf`를 별도 폴더에 준비하고 `python3 tests/pdf-regression.py /path/to/pdfs`로 실행합니다. Poppler의 `pdfimages`, `pdftotext`가 필요합니다. 원본 문서는 저장소에 포함하지 않습니다.

테스트 자료: [과학기술정보통신부 보도자료](https://www.msit.go.kr/bbs/view.do?sCode=user&mId=307&mPid=208&bbsSeqNo=94&nttSeqNo=3187932&searchOpt=ALL), [의왕시 유니콘로드 공간안내](https://www.uiwang.go.kr/UWKORINFO0101/7002497), [부평구 통장 후보자 신청서](https://www.icbp.go.kr/dong/bbs/bbsMsgDetail.do?bcd=dong_notice&dong=cheongcheon1&msg_seq=136500), [진도군 공공임대주택 공고와 신청서](https://www.jindo.go.kr/youth/board/B0132.cs?act=read&articleId=196707).

## 제한과 라이선스

원본 한글 프로그램과 완전히 동일한 렌더링을 보장하지 않습니다. 복잡한 표·수식·글꼴·쪽 나눔이 다를 수 있으며, 문서에 서로 다른 용지 크기가 섞인 경우 인쇄 결과가 달라질 수 있습니다. 예를 들어 익산시 뉴딜일자리 공고의 첫 쪽 표에서 긴 문장이 이웃 셀의 경계에 겹치는 현상을 확인했습니다. PDF를 공유하기 전 결과를 확인하세요. HWP 파일은 지원하지 않습니다.

- 엔진: `@rhwp/core` 0.8.2, MIT (`rhwp/LICENSE`)
- SVG 정화: DOMPurify 3.4.18, Apache-2.0 또는 MPL-2.0 (`vendor/DOMPURIFY-LICENSE`)
- 글꼴: Nanum Gothic, SIL Open Font License (`FONT-LICENSE.txt`)
- 문장부호 대체 글꼴: Noto Sans JP 부분집합, SIL Open Font License (`vendor/PUNCTUATION-FONT-LICENSE`)
