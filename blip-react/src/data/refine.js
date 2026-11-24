// 빈칸 선언의 '구체화' 주제들: 적은 문장에 맞는 주제 하나가 고르면 → 밑줄 칠 말(terms) · 문장 속 빈칸(slots) · 치환 문장(rewrite)
//   블립은 판단하지 않음 — 고를 것을 보여 줄 뿐, 고르는 건 사용자. 안 고르면 '전부'
import { TERMS as NEAR_TERMS, SLOTS as NEAR_SLOTS, VIEWS as NEAR_VIEWS, isNear, rewrite as nearRewrite, asList } from './near';

// 프랑스 빵집: '프랑스' 아래엔 도시, '빵집'엔 종류. 입력에 없는 기준(누가 좋아하는 곳)도 빈칸으로 제안
//   결과 페이지(프랑스 빵집 10곳)의 상세 조정툴과 같은 값 — 고른 것이 그 툴에 미리 걸린 채로 열림
export const FR_CITIES = ['파리', '리옹', '니스', '마르세유', '몽펠리에', '보르도'];
const FRANCE = {
  id: 'france',
  match: q => /프랑스/.test(q) && /빵|베이커리/.test(q),
  terms: [
    { key: 'city', re: /프랑스/, kind: 'me' },
    { key: 'kind', re: /빵집|베이커리|빵/, kind: 'vague' }
  ],
  slots: [
    { key: 'city', soft: '프랑스 전체', opts: FR_CITIES, say: v => v },
    { key: 'kind', multi: true, soft: '모든', opts: ['디저트류', '식사빵류'], say: v => v },
    { key: 'lean', soft: '누가 가든 상관없이', opts: ['한국인이 좋아하는 곳', '로컬이 좋아하는 곳'], say: v => v }
  ],
  rewrite: (picks = {}) => {
    const s = FRANCE.slots, part = (sl, v) => (v.length ? { key: sl.key, text: v.map(sl.say).join(' · ') } : { key: sl.key, text: sl.soft, soft: true });
    return [part(s[0], asList(picks.city)), { text: '의 ' }, part(s[1], asList(picks.kind)), { text: ' 빵집, ' }, part(s[2], asList(picks.lean))];
  },
  hint: 'Enter 찾기',
  // 결과 페이지의 상세 조정툴 값으로
  tune: picks => {
    const city = asList(picks.city)[0];
    const kinds = asList(picks.kind);
    const lean = asList(picks.lean)[0];
    return {
      city: FR_CITIES.includes(city) ? city : null,
      types: kinds.map(k => (k === '디저트류' ? 'dessert' : k === '식사빵류' ? 'meal' : null)).filter(Boolean),
      lean: lean === '한국인이 좋아하는 곳' ? .15 : lean === '로컬이 좋아하는 곳' ? .85 : null
    };
  }
};

const NEAR = { id: 'near', match: isNear, terms: NEAR_TERMS, slots: NEAR_SLOTS, rewrite: nearRewrite, views: NEAR_VIEWS, hint: 'Enter 포털로 받기' };

export const TOPICS = [NEAR, FRANCE];
export const topicOf = q => TOPICS.find(t => t.match(q)) || null;
export { asList };
