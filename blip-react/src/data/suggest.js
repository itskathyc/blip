import { makeLayer } from './apps';
import { makeCriterion, nextTemplates } from './criteria';

// + 를 누를 때마다 다음 장을 하나 제안 (반투명). 끝이 없음:
//   1) 블로그 글을 불러왔으면 → 아직 안 쓴 "고르는 기준"부터
//   2) 판의 주제(제목)에 맞는 장들 → 빵이면 빵 쪽
//   3) 누구에게나 맞는 장들
//   4) 다 썼으면 2)·3)을 처음부터 다시 (답이 섞이지 않게 key에 번호를 붙여)
// 같은 판 안의 장들은 layer.app = 판 id 로 답을 나눠 씀 (앞에서 고른 빵 → 지도·판정에 반영)

const AREAS = ['연남', '성수', '종로', '망원', '북촌', '용산'];
const strs = a => Object.values(a).filter(v => typeof v === 'string');

const BREAD = [
  { id: 'menu', make: () => ({ kind: 'choice', key: 'menu', color: '#fbecd9', q: '어떤 빵이\n끌려요?', opts: [['소금빵', '🧂'], ['크루아상', '🥐'], ['베이글', '🥯'], ['식빵', '🍞']] }) },
  { id: 'when', make: () => ({ kind: 'choice', key: 'when', color: '#fff4dc', q: '언제 먹을\n빵이에요?', opts: [['아침', '🌅'], ['오후 간식', '☕'], ['야식', '🌙'], ['선물', '🎁']] }) },
  { id: 'area', make: () => ({ kind: 'choice', key: 'area', color: '#e3f1ea', q: '어느 동네에서\n찾을까요?', opts: AREAS.map(a => [a, '📍']) }) },
  { id: 'map', make: () => ({ kind: 'mapq' }) },
  {
    id: 'pick', make: () => ({
      kind: 'verdict', color: '#2b2018', decide: a => a.menu && {
        kick: '오늘의 빵', big: a.menu,
        sub: [a.when && a.when + '에', a.area && a.area + '에서'].filter(Boolean).join(' ') || '지금 바로',
        lines: strs(a).slice(0, 4)
      }
    })
  },
  { id: 'tour', make: () => ({ kind: 'checklist', key: 'tour', color: '#fff7ec', title: '빵지순례 준비물', items: ['장바구니', '보냉백', '물티슈', '지도 저장해 두기'] }) }
];

const GENERIC = [
  { id: 'cover', make: c => ({ kind: 'cover', color: '#f3f2ee', emoji: '✨', kick: c.title, head: '다음 장에서\n이어 가요', sub: '넘기면서 해 보는 콘텐츠' }) },
  { id: 'mood', make: c => ({ kind: 'choice', key: 'mood', color: '#eef2ff', q: c.title + ',\n어떤 쪽이 좋아요?', opts: [['가볍게', '🍃'], ['진하게', '🔥'], ['새롭게', '✨'], ['익숙하게', '🏠']] }) },
  { id: 'todo', make: c => ({ kind: 'checklist', key: 'todo', color: '#f6f4ef', title: c.title + '\n해 볼 것', items: ['하나 골라 보기', '친구에게 보내기', '다시 해 보기'] }) },
  { id: 'rate', make: () => ({ kind: 'rate', key: 'score' }) },
  {
    id: 'sum', make: c => ({
      kind: 'verdict', color: '#111', decide: a => strs(a).length > 0 && {
        kick: '지금까지 고른 것', big: strs(a).slice(-1)[0], sub: c.title, lines: strs(a).slice(0, 4)
      }
    })
  }
];

export function suggestNext(board, posts, basis) {
  const ls = board.layers;
  const used = new Set(ls.map(l => l.sug).filter(Boolean));
  const base = { draft: true, app: board.id };

  // 1) 고르는 기준 (불러온 글이 있을 때)
  if (posts.length) {
    const seen = [...ls, ...(board.rejected || []).map(q => ({ kind: 'criterion', tpl: q }))];
    const [tpl] = nextTemplates(seen, 1);
    if (tpl) return makeCriterion(tpl, basis);
  }

  // 2)·3) 주제에 맞는 것부터, 아직 안 쓴 것
  // 주제: Remix로 복제한 판이면 "…의 복제본" 대신 원본 제목(forkOf)으로
  const topic = (board.forkOf || board.title || '').trim();
  const pool = [...(/빵|베이커리|베이킹/.test(topic) ? BREAD : []), ...GENERIC];
  const ctx = { title: topic || '이 콘텐츠' };
  const fresh = pool.find(s => !used.has(s.id));
  if (fresh) return makeLayer(fresh.make(ctx).kind, { ...base, ...fresh.make(ctx), sug: fresh.id });

  // 4) 다 썼으면 다시 처음부터 — 몇 바퀴째인지 key에 붙여 답이 따로 저장되게
  const round = ls.filter(l => l.sug).length;
  const s = pool[round % pool.length];
  const made = s.make(ctx);
  const n = Math.floor(round / pool.length) + 1;
  return makeLayer(made.kind, { ...base, ...made, key: made.key && made.key + n, sug: s.id + n });
}
