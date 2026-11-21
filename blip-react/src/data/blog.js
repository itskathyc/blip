// 페르소나의 네이버 블로그 글 (데모용으로 미리 받아 둔 것). 글 하나 = 빵 하나.
// 실제 불러오기는 서버가 필요해서, 지금은 붙여넣은 주소를 이 목록에 차례로 맞춰 줌.
// 블록 구조는 스마트에디터의 se-component처럼: 제목 / 사진 / 문단(문장들) / 가게 정보
// trait: 그 문장이 말하는 기준 (data/criteria.js의 TRAITS)

export const BLOG = [
  {
    id: 'b1', url: 'https://blog.naver.com/bbangseogwan/223101', bread: '소금빵', shop: '바삭공방', area: '망원',
    title: '[소금빵] 망원 바삭공방, 식어도 바삭한 소금빵',
    blocks: [
      { t: 'img', bread: '소금빵' },
      { t: 'p', s: [
        { text: '겉이 유리처럼 바삭하게 깨지는 소금빵.', traits: ['crisp'] },
        { text: '식은 뒤에도 겉이 바삭해서 놀람.', traits: ['cold', 'carry'] },
        { text: '아메리카노에 찍어 먹으면 버터가 녹아 나온다.', traits: ['coffee', 'butter'] }
      ] },
      { t: 'shop', text: '바삭공방 · 망원 · 3,800원' }
    ]
  },
  {
    id: 'b2', url: 'https://blog.naver.com/bbangseogwan/223102', bread: '베이글', shop: '동그라미베이글', area: '연남',
    title: '[베이글] 연남 동그라미베이글, 아침 한 끼로 충분',
    blocks: [
      { t: 'img', bread: '베이글' },
      { t: 'p', s: [
        { text: '쫀득하게 씹히는 결이 오래 간다.', traits: ['chewy'] },
        { text: '크림치즈 하나면 아침 한 끼로 충분.', traits: ['morning'] },
        { text: '가방에 넣고 다녀도 모양이 그대로.', traits: ['carry', 'cold'] }
      ] },
      { t: 'shop', text: '동그라미베이글 · 연남 · 4,200원' }
    ]
  },
  {
    id: 'b3', url: 'https://blog.naver.com/bbangseogwan/223103', bread: '크루아상', shop: '결제과', area: '성수',
    title: '[크루아상] 성수 결제과, 버터 향이 먼저 오는 크루아상',
    blocks: [
      { t: 'img', bread: '크루아상' },
      { t: 'p', s: [
        { text: '봉투를 여는 순간 버터 향이 먼저 온다.', traits: ['butter'] },
        { text: '갓 나왔을 때 먹어야 결이 산다.', traits: ['fresh'] },
        { text: '우유보다는 진한 커피랑.', traits: ['coffee'] }
      ] },
      { t: 'shop', text: '결제과 · 성수 · 5,500원' }
    ]
  },
  {
    // 빵이 둘 나오는 글: 무엇에 대한 글인지 Blip이 확신하지 못함 → 그림으로 물어봄
    id: 'b4', url: 'https://blog.naver.com/bbangseogwan/223104', bread: null, candidates: ['크루아상', '단팥빵'], shop: '모퉁이빵집', area: '북촌',
    title: '[비교] 아침엔 크루아상 vs 단팥빵?',
    blocks: [
      { t: 'img', bread: '크루아상' },
      { t: 'img', bread: '단팥빵' },
      { t: 'p', s: [
        { text: '바쁜 아침엔 손에 덜 묻는 단팥빵.', traits: ['morning', 'carry'] },
        { text: '단팥은 우유랑 먹어야 완성.', traits: ['milk'] },
        { text: '여럿이 나눠 먹기엔 크루아상이 낫다.', traits: ['share'] }
      ] },
      { t: 'shop', text: '모퉁이빵집 · 북촌 · 2,800원~' }
    ]
  },
  {
    id: 'b5', url: 'https://blog.naver.com/bbangseogwan/223105', bread: '마늘바게트', shop: '한입제과', area: '연남',
    title: '[마늘바게트] 연남 한입제과, 여럿이 나눠 먹는 빵',
    blocks: [
      { t: 'img', bread: '마늘바게트' },
      { t: 'p', s: [
        { text: '한 봉지를 여럿이 나눠 먹기 좋다.', traits: ['share'] },
        { text: '담백한 빵에 마늘 버터가 스며 있다.', traits: ['plain', 'butter'] },
        { text: '식으면 딱딱해져서 그 자리에서.', traits: ['fresh'] }
      ] },
      { t: 'shop', text: '한입제과 · 연남 · 6,000원' }
    ]
  },
  {
    id: 'b6', url: 'https://blog.naver.com/bbangseogwan/223106', bread: '식빵', shop: '구름식빵', area: '합정',
    title: '[식빵] 합정 구름식빵, 결대로 찢기는 우유식빵',
    blocks: [
      { t: 'img', bread: '식빵' },
      { t: 'p', s: [
        { text: '결대로 찢어지는 담백한 우유식빵.', traits: ['plain'] },
        { text: '우유에 적셔 먹는 게 최고.', traits: ['milk'] },
        { text: '이틀 지나도 촉촉하다.', traits: ['cold'] }
      ] },
      { t: 'shop', text: '구름식빵 · 합정 · 4,500원' }
    ]
  }
];

// 이 글에서 무엇을 주인공으로 담을지 (Blip의 추측 → 한 번 눌러 바꿈)
export const PRIMARY = ['bread', 'shop', 'line'];
export const PRIMARY_LABEL = { bread: '빵', shop: '빵집', line: '내 문장' };

export const sentencesOf = post => post.blocks.filter(b => b.t === 'p').flatMap(b => b.s);
export const traitsOf = post => [...new Set(sentencesOf(post).flatMap(s => s.traits))];

export function primaryText(post) {
  if (post.primary === 'shop') return post.shop;
  if (post.primary === 'line') return '문장 ' + sentencesOf(post).length;
  return post.bread || '어떤 빵?';
}

// 붙여넣은 글자에서 주소만 골라 아직 안 가져온 글에 맞춤
export function matchUrls(text, taken) {
  const urls = (text.match(/https?:\/\/\S+/g) || []).filter(u => /blog\.naver\.com/.test(u));
  const out = [];
  const used = new Set(taken);
  for (const u of urls) {
    const exact = BLOG.find(p => p.url === u && !used.has(p.id));
    const next = exact || BLOG.find(p => !used.has(p.id));
    if (!next) break;
    used.add(next.id);
    out.push(next);
  }
  return out;
}

export const SAMPLE_URLS = BLOG.map(p => p.url).join('\n');
