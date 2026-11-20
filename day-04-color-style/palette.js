const palettes = [
  {
    id: 'classic', mood: '단정한', english: 'CLASSIC & CHEERFUL', title: '익숙해서 더 좋은 조합',
    description: '네이비와 화이트의 단정한 바탕에 레드를 더한 클래식 룩.',
    tip: '화이트 바탕에 네이비와 레드 스트라이프를 더해 보세요.',
    colors: [{name:'네이비',hex:'#263853',role:'main'}, {name:'화이트',hex:'#f3f1e9',role:'main'}, {name:'레드',hex:'#b33f38',role:'accent'}],
    source: {name:'JLJ Back To Classic', url:'https://jljbacktoclassic.com/archives/40292'},
    photo: {src:'assets/photos/classic-pexels-975008.jpg', alt:'화이트 바탕에 네이비와 레드 줄무늬가 있는 상의와 바지를 입은 사람', description:'화이트 바탕의 상의와 팬츠에 네이비와 레드 줄무늬를 더한 룩.', photographer:'Godisable Jacob', url:'https://www.pexels.com/photo/woman-wearing-white-red-and-blue-striped-shirt-and-palazzo-pants-975008/', license:'https://www.pexels.com/license/'}
  },
  {
    id: 'bold', mood: '대담한', english: 'BOLD & DRAMATIC', title: '선명하게 남는 인상',
    description: '블랙과 화이트의 대비에 레드를 더한 드라마틱한 컬러 코드.',
    tip: '블랙과 화이트를 중심으로 입고 레드 아이템을 포인트로 활용해 보세요.',
    colors: [{name:'블랙',hex:'#242424',role:'main'}, {name:'화이트',hex:'#f3f1e9',role:'main'}, {name:'레드',hex:'#b33f38',role:'accent'}],
    source: {name:'Harper’s BAZAAR', url:'https://www.harpersbazaar.com/fashion/photography/a35496166/black-white-red-style/'},
    photo: {src:'assets/photos/bold-pexels-15969866.jpg', alt:'검은 코트와 흰 셔츠, 빨간 체크 스커트를 입은 사람', description:'블랙 코트와 화이트 셔츠에 레드 체크 스커트를 매치한 룩.', photographer:'Nastasya Banana', url:'https://www.pexels.com/photo/woman-in-a-red-plaid-skirt-white-shirt-and-a-black-coat-standing-in-front-of-a-pink-building-15969866/', license:'https://www.pexels.com/license/'}
  },
  {
    id: 'natural', mood: '차분한', english: 'WARM & MINIMAL', title: '따뜻한 뉴트럴',
    description: '화이트와 카멜에 블랙을 더한 담백한 뉴트럴 조합.',
    tip: '화이트 상의와 카멜 하의에 블랙 가방으로 선을 더해 보세요.',
    colors: [{name:'화이트',hex:'#f3f1e9',role:'main'}, {name:'카멜',hex:'#b88b61',role:'main'}, {name:'블랙',hex:'#242424',role:'accent'}],
    source: {name:'FashionBeans', url:'https://www.fashionbeans.com/article/what-to-wear-with-denim/'},
    photo: {src:'assets/photos/natural-pexels-1178745.jpg', alt:'화이트 상의와 카멜색 하의에 검은 가방을 멘 사람', description:'화이트 상의, 카멜색 하의, 블랙 가방을 매치한 룩.', photographer:'Mark Altytsia', url:'https://www.pexels.com/photo/woman-in-white-turtleneck-sleeveless-top-and-brown-bottoms-holding-black-leather-crossbody-bag-outfit-1178745/', license:'https://www.pexels.com/license/'}
  },
  {
    id: 'denim', mood: '편안한', english: 'EASY & CASUAL', title: '데님과 모노톤',
    description: '블루 데님에 블랙과 화이트를 더한 캐주얼 조합.',
    tip: '블랙과 화이트 체크 셔츠에 블루 데님을 매치해 보세요.',
    colors: [{name:'블루',hex:'#86a9be',role:'main'}, {name:'화이트',hex:'#f3f1e9',role:'main'}, {name:'블랙',hex:'#242424',role:'accent'}],
    source: {name:'Glamour', url:'https://www.glamour.com/story/how-to-style-dark-blue-jeans'},
    photo: {src:'assets/photos/denim-pexels-3680771.jpg', alt:'블랙과 화이트 체크 셔츠에 연한 블루 데님을 입은 사람', description:'체크 셔츠와 연청 데님을 입은 룩. 원문은 진청 데님을 소개합니다.', photographer:'José Luis Photographer', url:'https://www.pexels.com/photo/woman-in-black-and-white-plaid-shirt-and-blue-denim-jeans-jumping-on-brown-concrete-floor-3680771/', license:'https://www.pexels.com/license/'}
  }
];
function recommend(id) { return palettes.find(palette => palette.id === id) || null; }
function chooseNext(previousId, random = Math.random) {
  const different = palettes.filter(palette => palette.id !== previousId);
  const choices = different.length ? different : palettes;
  return choices[Math.floor(random() * choices.length)] || null;
}
if (typeof module !== 'undefined') module.exports = { palettes, recommend, chooseNext };
