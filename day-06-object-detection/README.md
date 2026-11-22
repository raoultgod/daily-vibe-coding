# Day 06 — FRAME / Object Detector

브라우저 카메라로 물체를 실시간 인식하고, 감지 결과를 상자와 신뢰도로 표시하는 정적 웹앱입니다. Ultralytics YOLO26n과 COCO 80개 범주를 사용합니다. 모델 추론은 브라우저에서 수행하며 영상 프레임을 서버로 전송하지 않습니다.

## 실행

```sh
cd day-06-object-detection
npm install
npm run dev
```

Vite가 출력한 localhost 주소를 브라우저에서 엽니다. 카메라는 `localhost` 또는 HTTPS에서만 동작합니다. 처음 시작할 때 약 10 MB 모델 파일과 브라우저 런타임이 로드됩니다. 이후 브라우저 캐시가 유지되면 다시 받을 필요가 줄어듭니다. 기기와 브라우저에 따라 WebGPU 또는 CPU/WASM을 사용하며 처리 속도는 달라집니다.

## Netlify 배포

이 폴더를 Base directory로 설정합니다. 저장소 루트에 연결하는 경우 Base directory는 `day-06-object-detection`, Build command는 `npm run build`, Publish directory는 `dist`입니다. `netlify.toml`에도 설정이 들어 있습니다. HTTPS 주소에서 카메라 권한을 허용하세요.

## 조작

- **카메라 시작/정지**: 브라우저 권한을 요청하고 인식 루프를 시작/종료합니다.
- **감지 민감도**: 신뢰도 기준을 조절합니다.
- **찾은 물체**: 현재 화면에 인식된 범주와 개수를 표시합니다.
- 정지하거나 페이지를 떠나면 카메라 트랙을 닫습니다.

## 라이선스와 개인정보

Ultralytics YOLO inference 패키지와 YOLO 모델은 AGPL-3.0 조건을 따릅니다. 해당 앱 코드는 같은 라이선스로 제공하며 LICENSE 파일을 포함합니다. 배포/수정 시 라이선스 전문과 소스 제공 의무를 확인하세요. 상업적 사용 등 AGPL 조건이 맞지 않는 경우 Ultralytics의 별도 라이선스를 확인해야 합니다.

카메라 영상은 로컬 브라우저 메모리에서만 분석하며 저장하거나 업로드하지 않습니다. 모델 파일은 이 정적 사이트에서 다운로드됩니다. UI 웹폰트는 Google Fonts에서 불러옵니다.

## 테스트

```sh
npm test
npm run build
```

단위 테스트는 감지 필터, confidence 정렬, 상자 좌표 변환을 확인합니다. 실제 카메라 동작은 HTTPS/localhost 브라우저와 카메라 권한이 필요합니다. 실제 기기에서의 성능과 Netlify 배포는 별도 확인해야 합니다.
