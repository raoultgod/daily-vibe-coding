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
  },
  {
  "id": "olive-everyday",
  "mood": "편안한",
  "english": "OLIVE & EASY",
  "title": "올리브로 완성하는 데일리 룩",
  "description": "올리브색 재킷에 화이트와 블랙을 더한 캐주얼 조합.",
  "tip": "올리브 유틸리티 재킷에 화이트 상의와 블랙 진을 매치해 보세요.",
  "colors": [
    {
      "name": "올리브",
      "hex": "#777961",
      "role": "main"
    },
    {
      "name": "화이트",
      "hex": "#f3f1e9",
      "role": "main"
    },
    {
      "name": "블랙",
      "hex": "#242424",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Merrick’s Art — Olive Jacket White Lace Top Black Jeans and Black Ankle Boots",
    "url": "https://www.merricksart.com/outfits/olive-jacket-white-lace-top-black-jeans-black-booties/"
  },
  "photo": {
    "src": "assets/photos/a-olive-pexels-61120.jpg",
    "alt": "회색빛 올리브 재킷, 흰색 터틀넥, 검은색 찢어진 청바지를 입은 사람",
    "description": "회색빛 올리브 재킷, 화이트 터틀넥, 블랙 진을 확인했습니다. 사진의 재킷 색은 조명에 따라 회색으로도 보입니다.",
    "photographer": "Kristin Vogt",
    "url": "https://www.pexels.com/photo/woman-in-grey-jacket-wearing-black-distress-pants-while-crossing-her-arms-61120/",
    "license": "https://www.pexels.com/license/"
  }
},
  {
  "id": "olive-denim-white",
  "mood": "편안한",
  "english": "EASY & EARTHY",
  "title": "올리브와 데님의 여유",
  "description": "올리브 그린과 블루 데님에 화이트를 더한 편안한 조합.",
  "tip": "올리브 셔츠와 블루 데님에 흰 신발을 더해 보세요.",
  "colors": [
    {
      "name": "올리브",
      "hex": "#777c5e",
      "role": "main"
    },
    {
      "name": "블루",
      "hex": "#6f91a7",
      "role": "main"
    },
    {
      "name": "화이트",
      "hex": "#f3f1e9",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Lookastic — Olive Jacket Outfits For Women",
    "url": "https://lookastic.com/women/olive-jacket/looks"
  },
  "photo": {
    "src": "assets/photos/b-olive-blue-white-4107118.jpg",
    "alt": "올리브색 상의와 블루 데님, 흰 신발을 신고 선반을 정리하는 사람",
    "description": "올리브색 상의, 블루 데님, 흰 신발이 함께 보이는 일상복. 사진은 셔츠, 출처의 예시는 올리브 밀리터리 재킷입니다.",
    "photographer": "cottonbro studio",
    "url": "https://www.pexels.com/photo/woman-in-brown-jacket-and-blue-denim-jeans-standing-beside-white-wooden-shelf-4107118/",
    "license": "https://www.pexels.com/license/"
  }
},
  {
  "id": "c-01",
  "mood": "데일리",
  "english": "Rust Orange + Brown + Cream",
  "title": "러스트 오렌지 · 브라운 · 크림",
  "description": "러스트 오렌지 · 브라운 · 크림 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "러스트 스커트에 크림 니트와 브라운 부츠를 매치해 보세요.",
  "colors": [
    {
      "name": "러스트 오렌지",
      "hex": "#B85C38",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#70452E",
      "role": "main"
    },
    {
      "name": "크림",
      "hex": "#F5EBD8",
      "role": "accent"
    }
  ],
  "source": {
    "name": "ChooseMyFashion — What Colors Go With Orange",
    "url": "https://choosemy.fashion/style-guide/colors-with-orange"
  },
  "photo": null
},
  {
  "id": "c-02",
  "mood": "데일리",
  "english": "Burnt Orange + Cream + Tan",
  "title": "번트 오렌지 · 크림 · 탄",
  "description": "번트 오렌지 · 크림 · 탄 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "번트 오렌지 재킷과 크림 블라우스에 탄색 바지를 더해 보세요.",
  "colors": [
    {
      "name": "번트 오렌지",
      "hex": "#C25A28",
      "role": "main"
    },
    {
      "name": "크림",
      "hex": "#F5EBD8",
      "role": "main"
    },
    {
      "name": "탄",
      "hex": "#C49A6C",
      "role": "accent"
    }
  ],
  "source": {
    "name": "ChooseMyFashion — What Colors Go With Orange",
    "url": "https://choosemy.fashion/style-guide/colors-with-orange"
  },
  "photo": null
},
  {
  "id": "c-03",
  "mood": "데일리",
  "english": "Camel + Burnt Orange + Dark Brown",
  "title": "카멜 · 번트 오렌지 · 다크 브라운",
  "description": "카멜 · 번트 오렌지 · 다크 브라운 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "카멜 코트와 오렌지 터틀넥에 다크 브라운 부츠를 더해 보세요.",
  "colors": [
    {
      "name": "카멜",
      "hex": "#BC8F62",
      "role": "main"
    },
    {
      "name": "번트 오렌지",
      "hex": "#C25A28",
      "role": "main"
    },
    {
      "name": "다크 브라운",
      "hex": "#533428",
      "role": "accent"
    }
  ],
  "source": {
    "name": "ChooseMyFashion — What Colors Go With Orange",
    "url": "https://choosemy.fashion/style-guide/colors-with-orange"
  },
  "photo": null
},
  {
  "id": "c-04",
  "mood": "데일리",
  "english": "Burgundy + Gray + Black",
  "title": "버건디 · 그레이 · 블랙",
  "description": "버건디 · 그레이 · 블랙 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "그레이 블라우스와 블랙 스커트에 버건디 재킷을 매치해 보세요.",
  "colors": [
    {
      "name": "버건디",
      "hex": "#722F37",
      "role": "main"
    },
    {
      "name": "그레이",
      "hex": "#929292",
      "role": "main"
    },
    {
      "name": "블랙",
      "hex": "#222222",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Style Fix Studio — Burgundy Color Combination Outfit Ideas",
    "url": "https://stylefixstudio.com/2025/09/29/what-colors-go-with-burgundy-burgundy-color-combination-outfit-ideas/"
  },
  "photo": null
},
  {
  "id": "c-05",
  "mood": "데일리",
  "english": "Rust Orange + Olive Green + Tan",
  "title": "러스트 오렌지 · 올리브 그린 · 탄",
  "description": "러스트 오렌지 · 올리브 그린 · 탄 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "러스트 니트와 올리브 카고 팬츠에 탄색 운동화를 신어 보세요.",
  "colors": [
    {
      "name": "러스트 오렌지",
      "hex": "#B85C38",
      "role": "main"
    },
    {
      "name": "올리브 그린",
      "hex": "#687447",
      "role": "main"
    },
    {
      "name": "탄",
      "hex": "#C49A6C",
      "role": "accent"
    }
  ],
  "source": {
    "name": "ChooseMyFashion — What Colors Go With Orange",
    "url": "https://choosemy.fashion/style-guide/colors-with-orange"
  },
  "photo": null
},
  {
  "id": "d-02",
  "mood": "데일리",
  "english": "Khaki + Burgundy + Brown",
  "title": "카키 · 버건디 · 브라운",
  "description": "카키 · 버건디 · 브라운 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "버건디 니트와 카키 바지에 브라운 벨트를 더해 보세요.",
  "colors": [
    {
      "name": "카키",
      "hex": "#A99A75",
      "role": "main"
    },
    {
      "name": "버건디",
      "hex": "#722F37",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#694332",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Wdrobe — What Colors Go With Khaki Clothes?",
    "url": "https://wdrobe.app/blog/colors-that-go-with-khaki"
  },
  "photo": null
},
  {
  "id": "d-03",
  "mood": "데일리",
  "english": "Khaki + Rust + Brown",
  "title": "카키 · 러스트 · 브라운",
  "description": "카키 · 러스트 · 브라운 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "러스트 니트와 카키 바지에 브라운 부츠를 매치해 보세요.",
  "colors": [
    {
      "name": "카키",
      "hex": "#A99A75",
      "role": "main"
    },
    {
      "name": "러스트",
      "hex": "#A64B2A",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#694332",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Wdrobe — What Colors Go With Khaki Clothes?",
    "url": "https://wdrobe.app/blog/colors-that-go-with-khaki"
  },
  "photo": null
},
  {
  "id": "d-04",
  "mood": "데일리",
  "english": "Olive + Cream + Brown",
  "title": "올리브 · 크림 · 브라운",
  "description": "올리브 · 크림 · 브라운 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "올리브 재킷과 크림 상의에 브라운 바지를 입어 보세요.",
  "colors": [
    {
      "name": "올리브",
      "hex": "#68734A",
      "role": "main"
    },
    {
      "name": "크림",
      "hex": "#F2E8D5",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#694332",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Outfit Lovers — Men's Fall Casual Outfits in Brown, Olive, and Cream",
    "url": "https://outfitlovers.com/stylish-mens-fall-casual-outfits-in-brown-olive-and-cream/"
  },
  "photo": null
},
  {
  "id": "d-05",
  "mood": "데일리",
  "english": "Orange + Green + Gray",
  "title": "오렌지 · 그린 · 그레이",
  "description": "오렌지 · 그린 · 그레이 조합. 색상 견본은 원문을 참고한 근사값입니다.",
  "tip": "그레이 바탕에 오렌지와 그린을 더해 보세요.",
  "colors": [
    {
      "name": "오렌지",
      "hex": "#E8752D",
      "role": "main"
    },
    {
      "name": "그린",
      "hex": "#39865A",
      "role": "main"
    },
    {
      "name": "그레이",
      "hex": "#888888",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Who What Wear — Fashion People Know That These Odd Color Combinations Hit Every Time",
    "url": "https://www.whowhatwear.com/best-color-combinations"
  },
  "photo": null
},
  {
  "id": "e-01",
  "mood": "산뜻한 컬러 블록",
  "english": "Light Blue, Hot Pink & White",
  "title": "라이트 블루 · 핫핑크 · 화이트",
  "description": "Her Vogue Life가 소개한 라이트 블루 셔츠, 핫핑크 플리츠 스커트와 화이트 힐 조합. 색상값은 원문이 지정한 값이 아닌 참고용 근사치입니다.",
  "tip": "밝은 핑크를 스커트에 두고 블루 셔츠와 화이트 슈즈로 균형을 잡아보세요.",
  "colors": [
    {
      "name": "라이트 블루",
      "hex": "#A9CDE0",
      "role": "main"
    },
    {
      "name": "핫핑크",
      "hex": "#E73587",
      "role": "main"
    },
    {
      "name": "화이트",
      "hex": "#FFFFFF",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Her Vogue Life — 9 Pink and Blue Outfits for Women, look 3",
    "url": "https://hervoguelife.com/pink-and-blue-outfits-for-women/"
  },
  "photo": null
},
  {
  "id": "e-02",
  "mood": "편안한 데님",
  "english": "Pink, Light Blue & Brown",
  "title": "핑크 · 라이트 블루 · 브라운",
  "description": "Her Vogue Life가 제안한 핑크 버튼다운, 연청 와이드 진과 브라운 가죽 벨트 조합. 색상값은 원문이 지정한 값이 아닌 참고용 근사치입니다.",
  "tip": "셔츠를 바지 안에 넣고 브라운 벨트로 허리선을 잡아보세요.",
  "colors": [
    {
      "name": "핑크",
      "hex": "#E8A9B8",
      "role": "main"
    },
    {
      "name": "라이트 블루",
      "hex": "#A7C5D8",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#815439",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Her Vogue Life — 9 Pink and Blue Outfits for Women, look 8",
    "url": "https://hervoguelife.com/pink-and-blue-outfits-for-women/"
  },
  "photo": null
},
  {
  "id": "e-03",
  "mood": "부드러운 대비",
  "english": "Light Blue, Pink & Olive",
  "title": "라이트 블루 · 핑크 · 올리브",
  "description": "Her Vogue Life가 소개한 라이트 블루 셔츠, 핑크 티어드 스커트와 올리브 그린 가방 조합. 색상값은 원문이 지정한 값이 아닌 참고용 근사치입니다.",
  "tip": "올리브색은 가방에 소량만 더해 파스텔 의상의 포인트로 활용해보세요.",
  "colors": [
    {
      "name": "라이트 블루",
      "hex": "#B4D2E2",
      "role": "main"
    },
    {
      "name": "핑크",
      "hex": "#E8A8BD",
      "role": "main"
    },
    {
      "name": "올리브 그린",
      "hex": "#788047",
      "role": "accent"
    }
  ],
  "source": {
    "name": "Her Vogue Life — 9 Pink and Blue Outfits for Women, look 9",
    "url": "https://hervoguelife.com/pink-and-blue-outfits-for-women/"
  },
  "photo": null
},
  {
  "id": "e-04",
  "mood": "차분한 디너 룩",
  "english": "Dusty Rose, Cream & Chocolate",
  "title": "더스티 로즈 · 크림 · 초콜릿",
  "description": "The Pink Jacket Edit의 더스티 로즈 블레이저, 크림 캐미솔, 초콜릿 새틴 스커트 제안. 색상값은 원문이 지정한 값이 아닌 참고용 근사치입니다.",
  "tip": "매트한 재킷과 새틴 스커트의 질감 차이를 활용해보세요.",
  "colors": [
    {
      "name": "더스티 로즈",
      "hex": "#C48691",
      "role": "main"
    },
    {
      "name": "크림",
      "hex": "#F3E8D3",
      "role": "main"
    },
    {
      "name": "초콜릿 브라운",
      "hex": "#4B3029",
      "role": "accent"
    }
  ],
  "source": {
    "name": "The Pink Jacket Edit — The Dusty-Rose Dinner Blazer",
    "url": "https://pinkjacketedit.com/style/pink-jacket-outfits/"
  },
  "photo": null
},
  {
  "id": "e-05",
  "mood": "따뜻한 레이어드",
  "english": "Blush Pink, Burgundy & Brown",
  "title": "블러시 핑크 · 버건디 · 브라운",
  "description": "SoManyTrends가 소개한 블러시 핑크 트렌치, 버건디 니트 드레스와 브라운 롱부츠 조합. 색상값은 원문이 지정한 값이 아닌 참고용 근사치입니다.",
  "tip": "부드러운 핑크 코트 아래에 깊은 버건디 드레스를 배치하고 브라운 부츠로 마무리하세요.",
  "colors": [
    {
      "name": "블러시 핑크",
      "hex": "#E3B4BA",
      "role": "main"
    },
    {
      "name": "버건디",
      "hex": "#702B3B",
      "role": "main"
    },
    {
      "name": "브라운",
      "hex": "#805137",
      "role": "accent"
    }
  ],
  "source": {
    "name": "SoManyTrends — Pink Trench, Burgundy Knit Dress",
    "url": "https://somanytrends.com/pink-and-burgundy-outfits/"
  },
  "photo": null
}
];
function recommend(id) { return palettes.find(palette => palette.id === id) || null; }
function chooseNext(previousId, random = Math.random) {
  const different = palettes.filter(palette => palette.id !== previousId);
  const choices = different.length ? different : palettes;
  return choices[Math.floor(random() * choices.length)] || null;
}
if (typeof module !== 'undefined') module.exports = { palettes, recommend, chooseNext };
