import { traitsOf } from './blog';
import { makeLayer } from './apps';

// 기준(trait) → 두 갈래 이름. 앞쪽 갈래 = 그 trait이 있는 빵
export const TRAITS = {
  morning: ['아침 한 끼', '오후 간식'],
  coffee: ['커피랑', '우유랑'],
  milk: ['우유랑', '커피랑'],
  butter: ['버터 풍미', '담백함'],
  plain: ['담백함', '진한 풍미'],
  share: ['여럿이 나눠', '혼자 조용히'],
  carry: ['들고 다니기 좋음', '그 자리에서'],
  cold: ['식어도 맛있음', '갓 나왔을 때'],
  fresh: ['갓 나왔을 때', '식어도 맛있음'],
  crisp: ['겉바삭', '쫀득 촉촉'],
  chewy: ['쫀득 촉촉', '겉바삭']
};

// Blip이 주는 템플릿 (그저 시작점. 사용자가 손대는 순간 사용자 것이 됨)
export const TEMPLATES = [
  { q: '이 빵 언제 먹어요?', trait: 'morning' },
  { q: '커피랑? 우유랑?', trait: 'coffee' },
  { q: '버터 풍미 vs 담백함', trait: 'butter' },
  { q: '혼자? 같이?', trait: 'share' },
  { q: '들고 다녀도 돼요?', trait: 'carry' },
  { q: '겉바삭? 촉촉?', trait: 'crisp' }
];

const breadOf = p => p.bread || p.candidates?.[0];

// 불러온 글들을 기준 하나로 두 갈래에 나눔
export function splitBy(trait, posts) {
  const names = [TRAITS[trait]?.[0] || '그렇다', TRAITS[trait]?.[1] || '아니다'];
  const yes = [], no = [];
  for (const p of posts) {
    const b = breadOf(p);
    if (!b) continue;
    const list = traitsOf(p).includes(trait) ? yes : no;
    if (!list.includes(b)) list.push(b);
  }
  return [{ label: names[0], breads: yes }, { label: names[1], breads: no }];
}

export const makeCriterion = (tpl, posts) =>
  makeLayer('criterion', { draft: true, q: tpl.q, trait: tpl.trait, tpl: tpl.q, choices: splitBy(tpl.trait, posts) });

// 판에 아직 없는 템플릿부터
export function nextTemplates(layers, n) {
  const used = new Set(layers.filter(l => l.kind === 'criterion').map(l => l.tpl));
  return TEMPLATES.filter(t => !used.has(t.q)).slice(0, n);
}

// 찢어 온 문장의 trait 중 기준으로 쓸 수 있는 첫 번째
export const traitOfPiece = piece => (piece.traits || []).find(t => TRAITS[t]);
