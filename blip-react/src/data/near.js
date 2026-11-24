// "지금 내 주변 맛있는 빵집" — 빈칸 선언의 '구체화'.
// 애매한 말마다 고를 것(블립은 판단하지 않음, 고르는 건 사용자). 안 고르면 '전부'.
// 고르는 순간 치환된 한 문장이 바로 바뀜 (결과는 받기 전엔 보여 주지 않음 — 블립에선 먼저 '자세히 값을 넣는 경험').
// 결과에서도 무엇으로 바꿔 읽었는지 · 못 읽은 값은 무엇인지 밝힘 → 블랙박스가 아님.
// 받는 방식: 지도에 핀 찍기 / 리스트로 받기 / 대표메뉴 모아보기
import { makeLayer } from './apps';
import { SOURCES } from './trip';

export const HERE = { name: 'L스퀘어', full: '제2판교 테크노밸리 · L스퀘어', lat: 37.4125, lon: 127.1005, approx: true }; // L스퀘어 건물 좌표는 못 찾음 → 제2판교 안 대략

// 문장 속 빈칸(기준). 입력에 그 말이 있으면 밑줄 → 같은 빈칸. 없는 기준(가격대)도 빈칸으로 문장에 들어가 있음 = 더할 수 있는 기준의 제안
//   soft: 아직 안 고른 모습 · opts: 고를 것 (+ UI에서 '전부' · '직접 입력') · say: 고른 것을 문장에 어떻게 적는지(바꿔 읽은 값까지 드러냄)
const REACH = { '걸어서 10분': [0.8, '800m 안'], '차로 10분': [4, '약 4km 안'] };
export const SLOTS = [
  { key: 'near', soft: `${HERE.name} 주변`, preview: '📍 ' + HERE.full, opts: ['걸어서 10분', '차로 10분'],
    say: v => { const r = reach(v); return r ? `${HERE.name}에서 ${v}(${r[1]})` : `${HERE.name}에서 ${v}`; } },
  { key: 'time', multi: true, soft: '여는 시간 상관없이', opts: ['지금 영업 중', '9-6시', '9시 이전 문 여는', '6시 이후에도 문 여는'],
    say: v => (v === '지금 영업 중' ? '지금 문 연' : v === '9-6시' ? '9시–6시에 문 연' : v) },
  { key: 'price', soft: '가격대 상관없이', opts: ['대표 빵 5천원 이하', '대표 빵 1만원 이하'],
    say: v => (/이하|이상/.test(v) || !priceOf(v) ? v : `대표 빵 ${priceOf(v).toLocaleString('ko-KR')}원 이하`) },
  { key: 'tasty', multi: true, soft: '맛 기준 없이 모든', opts: ['평점 좋은', '겉바속촉', '달달한'],
    say: v => (v === '평점 좋은' ? '평점 좋은(다이닝코드 ★4.0 이상)' : v) }
];
// 입력 중에 밑줄을 긋는 말 → 어느 빈칸인지. kind 'me' = 나를 가리키는 말(실선), 'vague' = 기준이 흐린 말(점선)
export const TERMS = [
  { key: 'time', re: /지금|요즘|오늘/, kind: 'vague' },
  { key: 'near', re: /내\s*주변|내\s*근처|근처|주변/, kind: 'me' },
  { key: 'tasty', re: /맛있는|맛집|맛있/, kind: 'vague' }
];
// 직접 적은 값도 읽을 수 있으면 읽음 (못 읽으면 걸러지지 않았다고 결과에 밝힘)
function reach(v) {
  if (REACH[v]) return REACH[v];
  const m = v?.match(/(\d+(?:\.\d+)?)\s*(km|m|분)/);
  if (!m) return null;
  const n = +m[1];
  if (m[2] === 'km') return [n, `${n}km 안`];
  if (m[2] === 'm') return [n / 1000, `${n}m 안`];
  const car = /차|운전|택시/.test(v);
  const k = n * (car ? 0.4 : 0.08);
  return [k, `분당 ${car ? '400' : '80'}m로 셈 · 약 ${k < 1 ? Math.round(k * 1000) + 'm' : k.toFixed(1) + 'km'} 안`];
}
const priceOf = v => { const m = v?.match(/(\d+(?:\.\d+)?)\s*(천|만)?/); return m ? +m[1] * (m[2] === '만' ? 10000 : m[2] === '천' ? 1000 : 1) : null; };
export const isNear = q => /빵|베이커리/.test(q) && /주변|근처/.test(q);
export const VIEWS = [['map', '지도에 핀 찍기', '📍'], ['list', '리스트로 받기', '☰'], ['menu', '대표메뉴 모아보기', '🥐']];

// 고른 것으로 바꾼 한 문장: 조각마다 어느 빈칸인지(key) — 누르면 그 빈칸을 고침
export function rewrite(picks = {}) {
  const parts = [];
  SLOTS.forEach((sl, i) => {
    if (i) parts.push({ text: i === SLOTS.length - 1 ? ', ' : ', ' });
    const v = asList(picks[sl.key]);
    parts.push(v.length ? { key: sl.key, text: v.map(sl.say).join(' · ') } : { key: sl.key, text: sl.soft, soft: true });
  });
  parts.push({ text: ' 빵집' });
  return parts;
}

// 다이닝코드에서 2026-11-23에 읽은 것만 (주소 · 평점 · 대표 메뉴와 값 · 영업시간 · 전화 · 후기 몇 줄).
//   온라인 주문 · 예약이 되는지는 확인하지 못함 → 화면에도 '전화로'만, 확인 못 했다고 밝힘
// 좌표: OpenStreetMap(Nominatim)으로 주소를 찾은 것. 도쿄팡야는 동(판교동)까지만 찾아서 대략.
SOURCES.dcode = { name: '다이닝코드', host: 'diningcode.com', date: '2026.11.23', color: '#ff7a00',
  url: 'https://www.diningcode.com/list.dc?query=%ED%8C%90%EA%B5%90+%EB%B9%B5%EC%A7%91' };
export const SHOPS = [
  { name: '버터풀앤크리멀러스 판교 파미어스몰점', short: '버터풀앤크리멀러스', area: '파미어스몰 · 창업로 18', lat: 37.41344, lon: 127.09841,
    rating: null, menus: [], hours: null, src: 'dcode', phone: null,
    reviews: ['빵도 넘 맛있습니다', '내부가 넓고 빵이 많다', '테이블은 많은데 조금 비좁다'] },
  { name: '아방베이커리 판교카카오점', short: '아방베이커리', area: '카카오 판교아지트 1층 · 판교역로 166', lat: 37.39542, lon: 127.11039, rating: 3.8, n: 8,
    menus: [['쌀 소금빵', 3800, 'salt'], ['쇼콜라 왁뿌 소금빵', 6800, 'sweet'], ['딸기마스카포네 왁뿌 소금빵', 6800, 'sweet'], ['요거트 망고 왁뿌 소금빵', 7200, 'sweet'], ['잠봉뵈르', 9200]],
    hours: [[1, 5, '08:00', '21:00'], [6, 6, '10:00', '19:00'], [0, 0, '10:00', '19:00']], src: 'dcode',
    phone: '031-601-7220', url: 'https://www.diningcode.com/profile.php?rid=YDhTMTGlcDYW', reviews: [] },
  { name: '키로베이커리', area: '백현동 · 판교역로2번길 14', lat: 37.38456, lon: 127.11274, rating: 4.7, n: 18,
    menus: [['소금빵(시오팡)', 3800, 'salt'], ['쌀크루아상', 4800, 'crisp'], ['바닐라까눌레', 3300, 'sweet'], ['플랑바닐라', 6800, 'sweet'], ['시골빵', 8300]],
    hours: [[0, 6, '09:30', '19:00']], src: 'dcode',
    phone: '0507-1368-5731', url: 'https://www.diningcode.com/profile.php?rid=vsQIFwbsiKrM', reviews: ['소금빵 맛집!', '매장이 넓지 않아서 웨이팅이 있을 때도 있다'] },
  { name: '도쿄팡야 판교점', short: '도쿄팡야', area: '서판교 · 운중로277번길 59', lat: 37.38995, lon: 127.09859, approx: true, rating: 3.3, n: 2,
    menus: [['메론빵', 2800, 'crisp sweet']], note: '“겉바속촉 원조 메론빵”', hours: [[0, 0, '09:00', '22:00'], [2, 6, '09:00', '22:00']], closed: '월요일 휴무', src: 'dcode',
    phone: '031-8017-8095', url: 'https://www.diningcode.com/profile.php?rid=FUYQyd5KerLO', reviews: ['겉바속촉 원조 메론빵'] }
];

const DAY = '일월화수목금토';
const hm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const todayHours = (s, d) => s.hours?.find(([a, b]) => d >= a && d <= b);
const openNow = (s, d, t) => { const h = todayHours(s, d); return h && t >= hm(h[2]) && t < hm(h[3]); };
// 두 점 사이 거리(km)
export const km = (a, b) => {
  const r = Math.PI / 180, x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r), y = (b.lat - a.lat) * r;
  return Math.hypot(x, y) * 6371;
};
const TAG = { 겉바속촉: 'crisp|salt', 달달한: 'sweet' };
const has = (s, tag) => s.menus.filter(m => m[2] && new RegExp(TAG[tag]).test(m[2])).map(m => m[0]);

// 여러 개 고를 수 있는 빈칸(맛 · 여는 시간)은 배열 — 고른 것을 모두 만족하는 곳만 남음
export const asList = v => (Array.isArray(v) ? v : v ? [v] : []);

// 고른 것대로: 가게마다 남는지 · 빠지면 왜인지 (결과 페이지가 쓰는 계산)
export function filterNear(picks = {}, now = new Date()) {
  const d = now.getDay(), t = now.getHours() * 60 + now.getMinutes();
  const times = asList(picks.time), tastes = asList(picks.tasty);
  const rows = SHOPS.map(s => {
    const dist = km(HERE, s);
    const why = [];
    const h0 = todayHours(s, d);
    times.forEach(tm => {
      if (!s.hours) return;
      if (!h0) { why.push(`오늘(${DAY[d]}) 쉬어요`); return; }
      if (tm === '지금 영업 중' && !openNow(s, d, t)) why.push('지금은 문을 닫았어요');
      if (tm === '9-6시' && !(hm(h0[2]) <= 540 && hm(h0[3]) >= 1080)) why.push(`오늘 ${h0[2]}–${h0[3]}`);
      if (tm === '9시 이전 문 여는' && !(hm(h0[2]) < 540)) why.push(`${h0[2]}에 열어요`);
      if (tm === '6시 이후에도 문 여는' && !(hm(h0[3]) > 1080)) why.push(`${h0[3]}에 닫아요`);
    });
    const r = picks.near && reach(picks.near);
    if (r && dist > r[0]) why.push(`${dist.toFixed(1)}km — ${picks.near} 밖`);
    const pr = picks.price && priceOf(picks.price);
    if (pr && s.menus.length && !s.menus.some(m => m[1] && m[1] <= pr)) why.push(`대표 빵이 모두 ${pr.toLocaleString('ko-KR')}원 넘어요`);
    tastes.forEach(ts => {
      if (ts === '평점 좋은') { if (s.rating !== null && s.rating < 4) why.push(`다이닝코드 ★${s.rating}`); return; }
      if (TAG[ts]) { if (!has(s, ts).length) why.push(s.menus.length ? `‘${ts}’ 메뉴가 없어요` : '메뉴를 몰라서 확인 못 했어요'); return; }
      if (!s.menus.some(m => m[0].includes(ts))) why.push(`‘${ts}’ 메뉴를 못 찾았어요`);
    });
    const h = todayHours(s, d);
    const unknown = [s.rating === null && tastes.includes('평점 좋은') && '평점 모름', !s.hours && times.length && '영업시간 모름', !s.menus.length && picks.price && '가격 모름'].filter(Boolean);
    const match = [...new Set(tastes.flatMap(ts => (TAG[ts] ? has(s, ts) : s.menus.filter(m => m[0].includes(ts)).map(m => m[0]))))];
    return { ...s, dist, why: [...new Set(why)], keep: !why.length, unknown, today: h ? `오늘 ${h[2]}–${h[3]}` : s.hours ? s.closed || '오늘 쉼' : '영업시간 모름', match };
  }).sort((a, b) => a.dist - b.dist);
  const unread = [picks.near && !reach(picks.near) && picks.near, ...times.filter(x => !SLOTS[1].opts.includes(x)), picks.price && !priceOf(picks.price) && picks.price].filter(Boolean);
  return { rows, left: rows.filter(r => r.keep).length, total: rows.length, unread };
}

const won = n => n.toLocaleString('ko-KR') + '원';
// 메뉴 누끼 (public/demo/menu · bread): 메뉴 '종류' 예시 사진 — 그 가게의 실제 사진이 아님 (CREDITS.txt)
const IMG = [[/소금빵/, 'menu/salt'], [/크루아상/, 'bread/croissant'], [/까눌레/, 'menu/canele'], [/플랑/, 'menu/flan'], [/시골빵|캄파뉴/, 'menu/campagne'], [/메론빵/, 'menu/melon'], [/잠봉/, 'menu/jambon']];
const imgFor = name => { const m = IMG.find(([re]) => re.test(name)); return m ? import.meta.env.BASE_URL + 'demo/' + m[1] + '.png' : null; };

// 고른 것 → 결과에 쓰는 값 (결과 화면에서 필터를 바꾸면 이걸 다시 계산)
export function nearData(picks = {}, now = new Date()) {
  const { rows, left, total, unread } = filterNear(picks, now);
  const shops = rows.filter(r => r.keep).map((s, i) => ({
    n: i + 1, name: s.name, short: s.short || s.name, area: s.area, lat: s.lat, lon: s.lon, approx: s.approx,
    dist: s.dist, walk: Math.round((s.dist * 1000) / 80), rating: s.rating, nr: s.n, today: s.today, note: s.note,
    phone: s.phone, url: s.url, reviews: s.reviews || [],
    week: s.hours ? [...s.hours.map(([a, b, o, c]) => `${a === b ? DAY[a] : DAY[a] + '–' + DAY[b]} ${o}–${c}`), s.closed].filter(Boolean).join(' · ') : '영업시간 모름',
    menus: s.menus.map(([m, p]) => ({ name: m, price: p ? won(p) : '', img: imgFor(m), hit: s.match.includes(m) }))
  }));
  return { sentence: rewrite(picks).map(p => p.text).join(''), here: HERE, shops, left, total, unread };
}

// 받는 방식: 고르면 그 한 장(지도 · 리스트 · 대표메뉴), 안 고르고 Enter면 포털처럼 한 페이지에 다 (지도 → 리스트 → 대표 빵)
export function nearPage(picks = {}, view, q = '') {
  return [makeLayer('nearres', { app: 'near', view: view || 'portal', picks, q })]; // q = 처음 쓴 문장 (검색 문장을 누르면 그대로 다시 열림)
}
