import { makeLayer } from './apps';
import { BLOG } from './blog';

// 다인이 "프랑스에서 가장 많이 먹는 빵 10가지"를 검색했을 때 블립이 엮어 오는 페이지 3개.
// 한 페이지 = 여러 url에서 필요한 정보만 뽑아 블립이 다시 편집한 것 → 페이지 하나에 url 하나가 없음.
// 대신 항목마다 출처(사이트)가 붙고, 그 항목의 원문으로만 갈 수 있음.
// 확인: 2026-11-19에 각 원문을 직접 읽고 사실·숫자·짧은 인용만 옮김 (NBC Palm Springs 기사는 CNN 기사를 받아 실은 것 — CNN 원문으로 확인)
export const SOURCES = {
  sap: { name: 'Sortir à Paris', host: 'sortiraparis.com', date: '2026.04.15', color: '#e4572e',
    url: 'https://www.sortiraparis.com/ko/palieseo-meog-eul-gos/kape-titaim/guides/174252-pali-ppangjib' },
  cnn: { name: 'NBC Palm Springs · CNN', host: 'nbcpalmsprings.com', date: '2026.04.19', color: '#2f6fd6',
    url: 'https://www.nbcpalmsprings.com/ca-us-and-world/2026/04/19/the-baguette-paradox-france-struggles-to-save-its-iconic-bread-as-habits-shift' },
  esq: { name: '에스콰이어 코리아', host: 'esquirekorea.co.kr', date: '2026.03.13', color: '#1d1d1f',
    url: 'https://www.esquirekorea.co.kr/article/1898604' }
};

const page = (app, p) => [makeLayer('blipweb', { app, ...p })];

const WEB_APPS = () => [
  {
    id: 'w3', title: '파리 빵집 12곳', by: '블립이 2곳에서 모음', web: true,
    tags: '프랑스 파리 빵 빵집 베이커리 바게트 사워도우 비에누아즈리 추천 지도 10가지 여행',
    layers: page('w3', {
      bread: 'croissant', title: '파리 빵집 12곳', srcs: ['sap', 'esq'],
      dek: 'Sortir à Paris의 파리 소식 중 빵집 이야기만, 에스콰이어의 파리 맛집 기사 중 빵집만 골라 모았어요.',
      filters: ['바게트', '사워도우', '비에누아즈리', '식물성', '앉아서'],
      sections: [{
        type: 'rows', rows: [
          { name: '라 파리지엥', where: '노트르담 근처', line: '2016 · 2025 ‘파리 최고의 바게트’ 우승. 우승 바게트는 1년간 엘리제궁에', tags: ['바게트'], src: 'esq' },
          { name: '밀레앙', where: '파리', line: '한국인 부부의 베이커리 카페. 크루아상 · 바게트 · 타르트', tags: ['바게트', '비에누아즈리', '앉아서'], src: 'esq' },
          { name: '샹불', where: '18구', line: '몽마르트르. 사워도우, 고대 밀가루 빵. 앉아서 먹는 메뉴도', tags: ['사워도우', '앉아서'], src: 'sap' },
          { name: '쁘띠 일', where: '3구', line: '프랑스-대만식. 대만식 브리오슈', tags: ['비에누아즈리'], src: 'sap' },
          { name: '불랑제리 누벨', where: '11구', line: '옛 방식 유기농 밀가루 사워도우, 브리오슈', tags: ['사워도우'], src: 'sap' },
          { name: '에베일', where: '17구', line: '전통 바게트. 좋은 재료에 값이 합리적', tags: ['바게트'], src: 'sap' },
          { name: '미에뜨', where: '18구', line: '꾸밈없이 재료와 레시피에 집중', tags: ['사워도우'], src: 'sap' },
          { name: '레 꼼므', where: '12구', line: '크로자티에 거리 74번지. 넓은 테라스, 복고풍', tags: ['앉아서'], src: 'sap' },
          { name: '레퀼리브르', where: '15구', line: '궁전 수셰프 출신 제빵사. 사워도우와 페이스트리', tags: ['사워도우'], src: 'sap' },
          { name: '곤플레', where: '10구', line: '파리 북역 근처. 메뉴를 새로 디자인한 빵집', tags: [], src: 'sap' },
          { name: '룰레스 불레', where: '3구', line: '동네 빵집. 샌드위치와 비에누아즈리', tags: ['비에누아즈리'], src: 'sap' },
          { name: '라 모베즈 에르브', where: '17구', line: '동물성 재료 없는 100% 식물성 빵과 과자', tags: ['식물성'], src: 'sap' }
        ]
      }]
    })
  },
  {
    id: 'w1', title: '프랑스는 빵을 얼마나 먹나', by: '블립이 3곳에서 모음', web: true,
    tags: '프랑스 파리 빵 바게트 많이 먹는 소비 숫자 통계 하루 가격 10가지',
    layers: page('w1', {
      bread: 'baguette', title: '프랑스는 빵을\n얼마나 먹나', srcs: ['cnn', 'esq', 'sap'],
      dek: '‘가장 많이 먹는 빵 10가지’ 순위를 낸 출처는 찾지 못했어요. 대신 숫자로 본 프랑스 빵이에요.',
      sections: [
        { type: 'facts', h: '하루에 먹는 빵', facts: [['약 700g', '전쟁 직후'], ['약 100g', '지금'], ['36%', '5년 새 빵을 줄였다 (2023 설문)'], ['86%', '공장식 식빵도 먹는다']], src: 'cnn' },
        { type: 'quote', text: '“young people are losing the habit of buying a baguette every day”', who: '도미니크 아낙트, 제빵제과 연맹 회장', src: 'cnn' },
        { type: 'rows', h: '바게트 한 개 값', rows: [
          { name: '기본 바게트', where: '약 €1', src: 'cnn' }, { name: '트라디시옹', where: '약 €1.30', src: 'cnn' }, { name: '특제 빵', where: '500g에 최대 €7', src: 'cnn' }
        ] },
        { type: 'rows', h: '그래도 바게트', rows: [
          { name: '유네스코', where: '2022', line: '바게트가 무형문화유산이 됐어요', src: 'cnn' },
          { name: '파리 최고의 바게트', where: '라 파리지엥', line: '우승 바게트는 1년간 엘리제궁에', src: 'esq' }
        ] },
        { type: 'quote', text: '“완벽한 빵집은 맛있는 바게트만으로 평가되지 않습니다”', who: 'Sortir à Paris', src: 'sap' }
      ]
    })
  },
  {
    id: 'w2', title: '사람으로 보는 파리 빵', by: '블립이 2곳에서 모음', web: true,
    tags: '프랑스 파리 빵 바게트 제빵사 셀럽 요정재형 정재형 카리나 리사 맛집 여행',
    layers: page('w2', {
      bread: 'baguette', title: '사람으로 보는\n파리 빵', srcs: ['cnn', 'esq'],
      dek: '빵을 만드는 사람, 빵을 찾아간 사람.',
      filters: ['만드는 사람', '찾아간 사람'],
      sections: [{
        type: 'rows', rows: [
          { name: '브누아 카스텔', where: '파리 빵집 3곳', line: '“지금처럼 좋은 빵을 먹은 적은 없다”', tags: ['만드는 사람'], src: 'cnn' },
          { name: '에릭 카이저', where: '빵집 370곳', line: '바게트 샌드위치가 줄어든 낱개 판매를 메운다고 봐요', tags: ['만드는 사람'], src: 'cnn' },
          { name: '마리옹 쥐엘', where: '렌', line: '바게트를 그만 팔고 사워도우를 무게로 팔아요', tags: ['만드는 사람'], src: 'cnn' },
          { name: '카리나', where: '라 파리지엥', line: '파리에 갈 때마다 들르는 바게트 집', tags: ['찾아간 사람'], src: 'esq' },
          { name: '리사', where: '밀레앙', line: '한국인 부부의 베이커리 카페', tags: ['찾아간 사람'], src: 'esq' },
          { name: '정재형', where: '라 로통드', line: '몽파르나스의 1911년 브라세리. 빵집이 아니라 식당. 유튜브 ‘요정재형’에 소개', tags: ['찾아간 사람'], src: 'esq' },
          { name: '지수', where: '캐비어 카스피아', line: '1927년부터. 베이크드 포테이토 & 캐비어', tags: ['찾아간 사람'], src: 'esq' }
        ]
      }]
    })
  }
];

// 다인이 오른쪽에 「나라별 빵 맛집 지도」를 선언하면 왼쪽에 뜨는 재료 페이지.
// 지도에 꽂을 수 있는 것(가게 이름 + 어디)만, 나라별로. 지어낸 것 없이 이미 읽은 원문과 다인의 블로그에서만.
const MAP_APP = () => ({
  id: 'w4', title: '나라별 빵 맛집', by: '블립이 4곳에서 모음', web: true, detail: true, onTitle: ['지도', '맛집'],
  tags: '나라별 빵 맛집 지도 빵집 주소 위치',
  layers: page('w4', {
    title: '나라별 빵 맛집', srcs: ['sap2', 'sap', 'esq', 'blog'],
    dek: '지도에 꽂을 수 있게 가게 이름과 위치가 있는 것만 나라별로 모았어요.',
    filters: ['프랑스', '한국'],
    sections: [
      { type: 'rows', h: '프랑스 · 2026 전통 바게트 대회 수상점', rows: [
        { name: 'Fournil Didot', where: '파리 14구', line: '2026 ‘파리 최고의 바게트’ 우승', tags: ['프랑스'], src: 'sap2' },
        { name: 'Boulangerie du Parc', where: '셸 · 센에마른(77)', line: '도 대회 전통 바게트 수상', tags: ['프랑스'], src: 'sap2' },
        { name: 'La Tradition by Elio et Franck', where: '생제르맹앙레 · 이블린(78)', line: '도 대회 전통 바게트 수상', tags: ['프랑스'], src: 'sap2' },
        { name: "Le Fournil d'Autrefois", where: '에탕프 · 85 rue de la République', line: '도 대회 전통 바게트 수상', tags: ['프랑스'], src: 'sap2' },
        { name: 'La Rose de Villemomble', where: '빌모블 · 센생드니(93)', line: '도 대회 전통 바게트 수상', tags: ['프랑스'], src: 'sap2' },
        { name: 'Boulangerie Rouget', where: '에잔빌 · 릴라당 · 발두아즈(95)', line: '도 대회 전통 바게트 수상', tags: ['프랑스'], src: 'sap2' }
      ] },
      { type: 'rows', h: '프랑스 · 파리 빵집', rows: WEB_APPS()[0].layers[0].sections[0].rows.map(r => ({ ...r, tags: ['프랑스'] })) },
      { type: 'rows', h: '한국 · 내가 쓴 빵집', rows: BLOG.map(b => ({
        name: b.shop, where: b.area, line: (b.bread || b.candidates.join(' · ')) + ' · ' + b.blocks.find(x => x.t === 'shop').text.split(' · ').pop(), tags: ['한국'], src: 'blog'
      })) },
      { type: 'pending', text: '다른 나라는 블립이 더 모으는 중이에요' }
    ]
  })
});

export const TRIP = () => [...WEB_APPS(), MAP_APP()].map(a => ({ ...a, mine: false, found: true }));
export const TRIP_NEXT = { w1: ['app:w3', 'app:w2'], w2: ['app:w3', 'app:w1'], w3: ['app:w1', 'app:w2'] };

// 다인의 취향 (빵 메뉴 하나하나를 리뷰하는 블로거): 검색 결과 3개 중 무엇을 먼저 띄울지
export const DAIN_TASTE = '빵 빵집 베이커리 바게트 크루아상 사워도우 비에누아즈리 메뉴 추천';

// 2026 대회 기사 (다인이 따로 가져온 원문): 일드프랑스 전통 바게트 대회 수상점
SOURCES.blog = { name: '빵서관 · 다인의 블로그', host: 'blog.naver.com', color: '#03c75a', url: 'https://blog.naver.com/bbangseogwan' };
SOURCES.sap2 = { name: 'Sortir à Paris', host: 'sortiraparis.com', date: '2026.04.14', color: '#e4572e',
  url: 'https://www.sortiraparis.com/ko/palieseo-meog-eul-gos/eumsig-ibenteu/guides/312061-paliwa-ildeupeulangseuui-jeontong-bageteu-choego-moglog-2026nyeon-susang-jusodeul' };

// 한 곳만의 페이지: 블립이 아는 것만. 더 아는 게 있으면 여러 출처를 섞어서, 없으면 "더 모으는 중"
const MORE = {
  '라 파리지엥': [
    { name: '어디', where: '파리 6구 인근', line: '노트르담 대성당에서 멀지 않은 불랑제리', src: 'esq' },
    { name: '기록', where: '2016 · 2025', line: '‘파리 최고의 바게트’ 우승. 우승 바게트는 1년간 엘리제궁에', src: 'esq' },
    { name: '맛', where: '바게트', line: '겉은 얇고 바삭, 속은 촉촉하고 쫀득. 버터를 곁들이거나 샌드위치로', src: 'esq' },
    { name: '누가', where: '카리나', line: '파리에 갈 때마다 들르는 곳', src: 'esq' },
    { name: '올해는', where: '2026', line: '파리 최고의 바게트는 Fournil Didot(14구)에게', src: 'sap2' }
  ]
};
// 원문을 그대로 재구성해 보여 주는 곳 (카드로 바꾸지 않음): 다인이 가져온 에스콰이어 기사 화면에서 사진은 잘라 오고 글은 그대로 옮김
const img = n => import.meta.env.BASE_URL + 'demo/' + n;
const ESQ_PARIS = {
  site: 'ESQUIRE', section: 'FOOD', title: '카리나, 지수가 파리에서 또 간 찐 맛집은?', dek: '셀럽들의 오프 듀티 동선에서 포착된 파리 맛집.',
  by: '김유진', date: '2026.03.13', src: 'esq',
  summary: { h: '셀럽 인증 파리 맛집 리스트 4 요약', items: [
    ['라 파리지엥', '카리나가 파리에 갈 때마다 방문하는 바게트 맛집.'],
    ['캐비어 카스피아', '파리에서 가장 유명한 캐비어 레스토랑 중 한 곳.'],
    ['밀레앙', '리사 픽! 프렌치 베이커리와 한국식 디저트 문화가 자연스럽게 공존하는 카페.'],
    ['라 로통드', '1911년에 문을 연 이래로 오랫동안 예술가들의 아지트로 불리고 있는 정통 레스토랑.']
  ] },
  blocks: [
    { anchor: '라 파리지엥', imgs: [img('esq-karina-1.jpg'), img('esq-karina-2.jpg')], names: ['카리나', '카리나'], cap: '카리나가 파리에 갈 때마다 방문하는 가는 바게트 맛집, 라 파리지엥. / 이미지 출처: 인스타그램 @katarinabluu' },
    { p: '카리나가 파리에 갈 때마다 사 먹는 바게트 맛집이 있습니다. 바로 라 파리지엥이죠. 이곳은 파리 6구 인근, 노트르담 대성당에서 멀지 않은 거리에 위치한 유명한 불랑제리입니다. 파리에서 ‘제대로 된 바게트를 먹고 싶다면 반드시 들러야 할 곳’으로 꼽히는 베이커리이기도 하죠. 2016년과 2025년 ‘파리 최고의 바게트’ 콘테스트에서 우승한 곳이기 때문입니다. 이 대회는 파리 시가 매년 개최하는 권위 있는 대회로, 우승한 바게트는 1년 동안 엘리제궁에 납품되는 영예를 얻습니다.' },
    { imgs: [img('esq-karina-3.jpg'), img('esq-sandwich.jpg')], names: ['카리나', '바게트 샌드위치'], cap: '라 파리지엥은 2016년과 2025년 ‘파리 최고의 바게트’ 콘테스트에서 우승했다. / 이미지 출처: 인스타그램 @katarinabluu' },
    { p: '이곳의 바게트는 겉은 얇고 바삭하며, 속은 촉촉하고 쫀득한 크럼이 특징입니다. 밀 향이 진하게 살아 있어 버터를 곁들이거나 샌드위치로 먹어도 풍미가 뛰어납니다. 실제로 많은 관광객이 갓 구운 바게트 샌드위치를 주문해 근처 거리나 공원에서 간단한 식사로 즐기는 모습을 발견할 수 있습니다. 카리나처럼 포장한 빵을 들고 산책을 하다가 에펠탑 앞에서 먹는 작은 낭만을 즐겨보세요.' },
    { anchor: '캐비어 카스피아', p: '디올 쇼 참석차 파리를 자주 찾는 지수. 지수가 인증했던 파리 맛집은 캐비어 카스피아입니다. 1927년에 문을 연 캐비어 카스피아는 파리에서 가장 유명한 캐비어 레스토랑 중 한 곳인데요. 파리 중심부에 자리하여 오랜 시간 동안 패션계와 문화계 인사들이 즐겨 찾는 장소로 알려져 있습니다. 파리 패션위크 기간이면 디자이너와 모델, 에디터들이 자연스럽게 모이는 ‘패션 피플들의 아지트’ 같은 공간이기도 하죠.' },
    { imgs: [img('esq-jisoo-1.jpg'), img('esq-caviar.jpg')], names: ['지수', '베이크드 포테이토 & 캐비어'], cap: '지수 픽, 베이크드 포테이토와 캐비어. / 이미지 출처: 인스타그램 @sooyaaa__' },
    { p: '지수가 SNS에 올려 화제가 된 메뉴는 이곳의 시그니처 요리인 베이크드포테이토 & 캐비어입니다. 겉은 바삭하고 속은 부드럽게 구운 감자 위에 풍성한 캐비어를 올리고, 크림 프레슈를 곁들여 먹는 단순하면서도 고급스러운 요리입니다. 화려한 플레이팅보다 재료 자체의 풍미에 집중한 메뉴로, 캐비어 카스피아를 대표하는 요리로 손꼽힙니다.' }
  ],
  // 밀레앙 · 라 로통드 본문은 아직 안 가져옴 (요약 줄만 있음)
  rest: '밀레앙 · 라 로통드 이야기는 원문에서 이어져요'
};
const READER = { '라 파리지엥': ESQ_PARIS, '밀레앙': ESQ_PARIS, '카리나': ESQ_PARIS, '지수': ESQ_PARIS };

export function detailApp(id, row) {
  const art = READER[row.name];
  if (art) {
    return { id, title: row.name, by: art.site, mine: false, web: true, detail: true,
      layers: [makeLayer('reader', { app: id, ...art, focus: row.name === '카리나' ? '라 파리지엥' : row.name === '지수' ? '캐비어 카스피아' : row.name })] };
  }
  const more = MORE[row.name];
  const rows = more || [{ name: '한 줄', where: row.where, line: row.line, src: row.src }];
  return {
    id, title: row.name, by: SOURCES[row.src].name, mine: false, web: true, detail: true,
    layers: [makeLayer('blipweb', {
      app: id, title: row.name, srcs: [...new Set(rows.map(r => r.src))],
      dek: row.where + (row.tags?.length ? ' · ' + row.tags.join(' · ') : ''),
      sections: [{ type: 'rows', rows }, ...(more ? [] : [{ type: 'pending', text: '블립이 이곳에 대해 더 모으는 중이에요' }])]
    })]
  };
}
