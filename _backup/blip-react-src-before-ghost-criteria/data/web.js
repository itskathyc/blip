// 웹 결과 아이콘 색: 빵 종류별
export const MENU_COLOR = { 소금빵: '#f0dcae', 크루아상: '#e9c37f', 베이글: '#d8b48a', 마늘바게트: '#e2c08d', 식빵: '#f6e2bb', 미트파이: '#e6bba6' };

// 미리 받아온 웹 검색 결과 (2026-11-18 수집). 영업 여부·가격은 출처 시점 기준이라 달라졌을 수 있음.
export const WEB = [
  { t: '소하염전', a: '종로', m: '소금빵', d: '한옥 염전 콘셉트, 부드러운 소하 소금빵', u: 'https://www.tastekoreanfood.com/ktrend/best-salt-bread-in-seoul-3-bakeries-you-must-try' },
  { t: '자연도소금빵', a: '성수', m: '소금빵', d: '연무장길, 4개 세트 메뉴', u: 'https://hotplacehunter.co.kr/seoul/article/50239/' },
  { t: '아티스트베이커리', a: '안국', m: '소금빵', d: '플레인·시나몬·바질 페스토 소금빵', u: 'https://hotplacehunter.co.kr/seoul/article/50239/' },
  { t: '밀로밀', a: '망원', m: '소금빵', d: '바삭한 바게트 소금빵이 대표', u: 'https://hotplacehunter.co.kr/seoul/article/50239/' },
  { t: '테디뵈르하우스', a: '용산', m: '크루아상', d: '용리단길, 서울 3대 크루아상으로 소개', u: 'https://hotplacehunter.co.kr/sns/article/67602/' },
  { t: '메종고댕', a: '서초', m: '크루아상', d: '피가로지 크루아상 경연 우승 제빵사', u: 'https://www.wkorea.com/?p=277341' },
  { t: '오버트 서울', a: '종로', m: '크루아상', d: '카푸치노에 찍어 먹는 자이언트 크루아상', u: 'https://www.wkorea.com/?p=277341' },
  { t: '런던 베이글 뮤지엄', a: '북촌', m: '베이글', d: '참깨 베이글 + 크림치즈·꿀 브릭 레인', u: 'https://www.harpersbazaar.co.kr/article/66152' },
  { t: '코끼리베이글', a: '영등포', m: '베이글', d: '참나무 장작 화덕, 버터솔트 베이글', u: 'https://www.diningcode.com/dingco/tPaRqATbOrvu' },
  { t: '베카롱 베이글', a: '신당', m: '베이글', d: '우유·버터 없는 전통 뉴욕 스타일', u: 'https://polle.com/place/16i8CK/%EB%B2%A0%EC%B9%B4%EB%A1%B1%20%EB%B2%A0%EC%9D%B4%EA%B8%80' },
  { t: '만동제과', a: '연남', m: '마늘바게트', d: '테이크아웃 전문, 시식 제공', u: 'https://polle.com/place/3qjeaQ/%EB%A7%8C%EB%8F%99%EC%A0%9C%EA%B3%BC' },
  { t: '베어스덴 베이커리', a: '연남', m: '식빵', d: '마블 식빵, 별이 빛나는 밤 식빵', u: 'https://heypop.kr/?p=144741' },
  { t: '모토', a: '연남', m: '미트파이', d: '주택가 1인 베이커리, 소고기 미트파이', u: 'https://heypop.kr/?p=144741' },
  { t: 'SF베이글', a: '연남', m: '베이글', d: '동진시장 인근, 포장하기 좋은 베이글', u: 'https://heypop.kr/?p=144741' }
];

export const YEONNAM = WEB.filter(w => w.a === '연남');
