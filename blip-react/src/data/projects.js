// Publish ▾ → Projects: 폴더를 누르면 그 프로젝트의 장들이 오른쪽(만들기)에 열림 — 장 3~4개 + 첫 장 위에 아이템 3~5개
// 내용은 이미 있는 것들로만: 빵집지도 = 스타터 '나만의 빵집지도', 빵서관 = 다인의 블로그 글, 테스트 · 풀이는 고르면 결과가 나오는 놀이
import { makeLayer } from './apps';
import { STARTERS } from './starters';
import { BLOG } from './blog';

const item = (text, x, y) => ({ kind: 'item', text, w: 104, h: 84, x, y, scale: 1 });
// 아래쪽에 한 줄(3개) + 다음 줄(나머지) — 이름이 다 보이는 크기로
const row = names => names.map((n, i) => item(n, 75 + (i % 3) * 120 + (i >= 3 ? 60 : 0), i < 3 ? 320 : 412));

export const PROJECTS = [
  { name: '빵집지도', sub: '만드는 중', papers: ['#8b6cff', '#ffffff', '#f3f1ff'] },
  { name: '사주 풀이', sub: '초안', papers: ['#ffffff', '#ffd76a', '#b58cff'] },
  { name: '빵순이 테스트', sub: '공유됨', papers: ['#ffffff', '#f6f3ff', '#8b6cff'] },
  { name: '빵서관', sub: '블로그', papers: ['#ffffff', '#ffd76a', '#c9a6ff'] }
];

// 프로젝트 → 장들 (app = 그 판 id, 첫 장에 아이템)
export function projectLayers(name, app) {
  const L = (kind, p) => makeLayer(kind, { app, ...p });
  let layers = [], items = [];
  if (name === '빵집지도') {
    layers = STARTERS().find(s => s.id === 's3').layers.map(l => makeLayer(l.kind, { ...l, app }));
    items = row(['연남', '성수', '소금빵', '크루아상']);
  } else if (name === '사주 풀이') {
    layers = [
      L('cover', { color: '#ece6fb', emoji: '🔮', kick: '생일로 보는', head: '오늘의\n빵 운세', sub: '태어난 계절을 골라 보세요' }),
      L('choice', { color: '#ece6fb', key: 'season', q: '태어난 계절은?', opts: [['봄', '🌸'], ['여름', '🌊'], ['가을', '🍂'], ['겨울', '❄️']] }),
      L('verdict', { color: '#2b2140', decide: a => a.season && ({
        봄: { kick: '오늘의 빵', big: '딸기 크루아상', sub: '새로 시작하기 좋은 날', lines: ['행운의 동네: 연남'] },
        여름: { kick: '오늘의 빵', big: '소금빵', sub: '짭짤하게 기운 내는 날', lines: ['행운의 동네: 망원'] },
        가을: { kick: '오늘의 빵', big: '시골빵', sub: '천천히 씹어 먹는 날', lines: ['행운의 동네: 성수'] },
        겨울: { kick: '오늘의 빵', big: '뺑 오 쇼콜라', sub: '따뜻한 커피와 함께', lines: ['행운의 동네: 북촌'] }
      })[a.season] })
    ];
    items = row(['행운의 빵', '행운의 동네', '오늘의 한 줄']);
  } else if (name === '빵순이 테스트') {
    layers = [
      L('cover', { color: '#fbefe0', emoji: '🥐', kick: '두 번 고르면', head: '나는 어떤\n빵순이?', sub: '평소 모습대로 골라요' }),
      L('choice', { color: '#fbefe0', key: 'meal', q: '빵은 주로', opts: [['아침 대신', '☕'], ['간식으로', '🍪'], ['저녁 반찬처럼', '🍷']] }),
      L('choice', { color: '#fbefe0', key: 'tex', q: '더 끌리는 건', opts: [['겉바속촉', '🥖'], ['폭신촉촉', '🍞'], ['달달꾸덕', '🍫']] }),
      L('verdict', { color: '#2e2616', decide: a => a.meal && a.tex && ({ kick: '당신은', big: (a.tex === '겉바속촉' ? '바삭' : a.tex === '폭신촉촉' ? '촉촉' : '달달') + '한 ' + (a.meal === '아침 대신' ? '아침빵파' : a.meal === '간식으로' ? '오후빵파' : '저녁빵파'), sub: '고른 대로 나온 결과예요', lines: [] }) })
    ];
    items = row(['아침빵파', '바삭파', '달달파', '빵지순례러']);
  } else if (name === '빵서관') {
    layers = BLOG.slice(0, 4).map(b => L('card', { color: '#f3efe6', bread: b.bread === '베이글' ? 'bagel' : b.bread === '소금빵' ? 'salt' : 'croissant', head: b.shop, sub: b.area + ' · ' + (b.bread || b.candidates?.join(' · ') || '빵'), lines: [b.title] }));
    items = row(['소금빵', '베이글', '크루아상', '망원', '성수']);
  }
  if (layers[0]) layers[0] = { ...layers[0], pieces: [...(layers[0].pieces || []), ...items.map((p, i) => ({ ...p, id: 'pj' + Date.now() + i }))] };
  return layers;
}

// 커밋 로그 (가상): 프로젝트마다 6개 — 그래프 줄(lane 0 = main, 1 = 곁가지), 그때의 화면(page = 그 판의 몇 번째 장)
const LOGS = {
  빵집지도: [
    ['a1b2c3d', 'Init', '빈 판에서 시작', 0, 0], ['3f8e0a2', 'Cover', '표지 · 나만의 빵집지도', 0, 0], ['9c4d1b7', 'Area', '동네 고르기 (연남 · 성수 · 망원)', 1, 1],
    ['2e7a6f5', 'Bread', '빵 고르기 (소금빵 · 크루아상)', 0, 2], ['6b0c9d3', 'Merge', '동네 + 빵 합치기', 0, 2], ['d4e2f10', 'Map', '핀이 꽂힌 지도', 0, 3]
  ],
  '사주 풀이': [
    ['a1b2c3d', 'Init', '빈 판에서 시작', 0, 0], ['5c1d2e9', 'Cover', '생일로 보는 오늘의 빵', 0, 0], ['8f3a0b4', 'Season', '태어난 계절 고르기', 1, 1],
    ['1e9c7d2', 'Copy', '운세 문장 다듬기', 0, 0], ['7a2b5c8', 'Merge', '계절 → 오늘의 빵', 0, 1], ['c0d4e61', 'Result', '오늘의 빵 · 행운의 동네', 0, 2]
  ],
  '빵순이 테스트': [
    ['a1b2c3d', 'Init', '빈 판에서 시작', 0, 0], ['4d7e1a0', 'Cover', '나는 어떤 빵순이?', 0, 0], ['b93c2f5', 'Meal', '빵은 주로 언제', 1, 1],
    ['0e6a8d3', 'Texture', '겉바속촉 · 폭신 · 달달', 0, 2], ['f2c1b7a', 'Merge', '두 질문 합치기', 0, 2], ['9a0e5d4', 'Result', '나는 바삭한 아침빵파', 0, 3]
  ],
  빵서관: [
    ['a1b2c3d', 'Init', '블로그 글 불러오기', 0, 0], ['6e2f9b1', 'Salt', '망원 바삭공방 · 소금빵', 0, 0], ['c48a1d7', 'Bagel', '연남 동그라미베이글', 1, 1],
    ['3b7d0e2', 'Croissant', '성수 결제과 · 크루아상', 0, 2], ['8d1f4a6', 'Merge', '빵서관 한 판으로', 0, 2], ['e5c09b3', 'Corner', '모퉁이빵집 · 크루아상과 단팥빵', 0, 3]
  ]
};
export const commitsFor = name => (LOGS[name] || []).map(([hash, title, msg, lane, page]) => ({ hash, title, msg, lane, page }));
