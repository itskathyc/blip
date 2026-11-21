// 지도에 직접 찍은 핀에 이름을 적으면: 블립이 이미 모아 둔 곳에서 찾아 그 자리로 옮김.
// 지어내지 않음 — 확인된 주소(셀럽 인증 빵집)는 그 위치, 나머지는 원문에 적힌 '구'나 도시 단위로만 (대략).
// 못 찾으면 null → 그 핀은 내 메모로 남음.
import { PARIS } from '../../data/mapShapes';
import { CELEB_BAKERIES } from '../../data/celebMap';
import { BAKERY_POOL } from '../../data/trip';

// 도시 중심 (프랑스 전역 지도에서 도시 단위 핀 자리)
const CITY = { 파리: [48.8566, 2.3522], 리옹: [45.764, 4.8357], 니스: [43.7102, 7.262], 마르세유: [43.2965, 5.3698], 몽펠리에: [43.6108, 3.8767] };

// 파리 n구의 가운데 (경계선 경로의 상자 가운데, 지도 안 비율)
const arCenter = n => {
  const a = PARIS.ar.find(x => x.n === n);
  if (!a) return null;
  const v = a.d.match(/-?\d+(\.\d+)?/g).map(Number);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < v.length; i += 2) { x0 = Math.min(x0, v[i]); x1 = Math.max(x1, v[i]); y0 = Math.min(y0, v[i + 1]); y1 = Math.max(y1, v[i + 1]); }
  return { fx: (x0 + x1) / 2 / PARIS.W, fy: (y0 + y1) / 2 / PARIS.H };
};

const norm = s => (s || '').replace(/\s+/g, '').toLowerCase();

// region: 'paris' | 'france'
export function findPlace(text, region) {
  const q = norm(text);
  if (q.length < 2) return null;
  const celeb = CELEB_BAKERIES.find(b => b.lat && (norm(b.name).includes(q) || q.includes(norm(b.name))));
  if (celeb) return { name: celeb.name, who: celeb.who, where: celeb.where, city: '파리', lat: celeb.lat, lon: celeb.lon };
  const b = BAKERY_POOL.find(x => norm(x.name) === q) || BAKERY_POOL.find(x => norm(x.name).includes(q) || q.includes(norm(x.name)));
  if (!b) return null;
  const base = { name: b.name, where: b.where, city: b.city, line: b.line, approx: true };
  const gu = b.city === '파리' && b.where?.match(/(\d+)구/);
  if (region === 'paris') {
    if (b.city !== '파리') return { ...base, outside: true }; // 이 지도 밖
    const c = gu && arCenter(Number(gu[1]));
    return c ? { ...base, ...c } : { ...base, lat: CITY.파리[0], lon: CITY.파리[1] };
  }
  const c = CITY[b.city];
  return c ? { ...base, lat: c[0], lon: c[1] } : null;
}

// 핀 카드의 '○○에서 열기' (설계할 때 고른 지도 앱)
export const MAP_APPS = { google: '구글맵', naver: '네이버지도', kakao: '카카오맵', apple: '애플 지도' };
const FR = { 파리: 'Paris', 리옹: 'Lyon', 니스: 'Nice', 마르세유: 'Marseille', 몽펠리에: 'Montpellier' };
export const openUrl = (app, p) => {
  const q = encodeURIComponent([p.name, FR[p.city] || ''].filter(Boolean).join(' '));
  if (app === 'naver') return `https://map.naver.com/p/search/${q}`;
  if (app === 'kakao') return `https://map.kakao.com/?q=${q}`;
  if (app === 'apple') return `https://maps.apple.com/?q=${q}` + (p.lat ? `&ll=${p.lat},${p.lon}` : '');
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
};
