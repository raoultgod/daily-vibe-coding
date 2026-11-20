# mood.palette

새로고침할 때마다 기존 패션 자료의 컬러 조합을 추천하는 한국어 정적 사이트입니다. 각 조합은 메인 2색과 포인트 1색으로 정리했으며 색상 견본의 HEX 값은 원문에서 추출한 정확한 색이 아닌 이해를 돕는 근사값입니다. 무드와 색상 역할은 사이트의 편집적 해석입니다.

## 실행 및 테스트

`index.html`을 브라우저로 열거나 `python3 -m http.server 8000`을 실행해 접속합니다. 의존성 설치 없이 `node --test tests/*.test.cjs`로 테스트합니다.

## Netlify

저장소를 연결할 때 Base directory는 `day-04-color-style`, Publish directory는 `.`으로 설정합니다. 빌드 명령은 필요하지 않습니다. 이 폴더를 Netlify에 직접 업로드해도 됩니다.

## 출처와 이미지

- Classic: Godisable Jacob, [Pexels 사진 975008](https://www.pexels.com/photo/woman-wearing-white-red-and-blue-striped-shirt-and-palazzo-pants-975008/) — 화이트 바탕에 네이비와 레드 줄무늬 상의와 팬츠. 액세서리에는 다른 색도 있습니다.
- Bold: Nastasya Banana, [Pexels 사진 15969866](https://www.pexels.com/photo/woman-in-a-red-plaid-skirt-white-shirt-and-a-black-coat-standing-in-front-of-a-pink-building-15969866/) — 블랙 코트, 화이트 셔츠, 레드 체크 스커트.

- Natural: [FashionBeans 조합 출처](https://www.fashionbeans.com/article/what-to-wear-with-denim/)는 카멜, 블랙, 화이트 티셔츠를 함께 제안합니다. Mark Altytsia의 [Pexels 사진 1178745](https://www.pexels.com/photo/woman-in-white-turtleneck-sleeveless-top-and-brown-bottoms-holding-black-leather-crossbody-bag-outfit-1178745/)은 화이트 상의, 카멜 하의, 블랙 가방을 보여 줍니다. 원문과 의상 아이템의 배치는 다릅니다.
- Denim: [Glamour 조합 출처](https://www.glamour.com/story/how-to-style-dark-blue-jeans)는 진청 데님과 블랙·화이트를 제안합니다. José Luis Photographer의 [Pexels 사진 3680771](https://www.pexels.com/photo/woman-in-black-and-white-plaid-shirt-and-blue-denim-jeans-jumping-on-brown-concrete-floor-3680771/)은 블랙·화이트 체크 셔츠와 연청 데님을 보여 줍니다. 사진은 원문의 진청을 연청으로 바꾼 변형입니다.

사진들은 [Pexels 라이선스](https://www.pexels.com/license/)로 제공됩니다. Pexels의 [라이선스 안내](https://help.pexels.com/hc/en-us/articles/360042295174-What-is-the-license-of-the-photos-and-videos-on-Pexels)에 따르면 무료 개인·상업적 사용이 가능합니다. 식별 가능한 인물을 부정적이거나 불쾌하게 묘사하거나 인물·브랜드의 보증을 암시해서는 안 됩니다. 인물·상표 등 제3자의 권리는 별도로 고려해야 합니다. 사진의 색은 견본 HEX와 정확히 일치하지 않습니다.
