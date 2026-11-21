import { useRef } from 'react';
import { FRANCE, PARIS, at } from '../../data/mapShapes';
import { CELEB_BAKERIES } from '../../data/celebMap';
import './Map.css';

// 지도 조각: 실제 경계선 (프랑스 전역 / 파리 20구), 디자인 3가지 (선 · 종이 · 밤)
// 갓 완성됐으면 선이 그려지며 나타나고, 아이템을 합친 직후면 단계별로: 합치는 중 → 핀이 하나씩 → 못 찾은 곳
export default function MiniMap({ cfg, merge, name, w = 340, still = false }) {
  const M = cfg.region === 'paris' ? PARIS : FRANCE;
  const born = useRef(!still && cfg.at && Date.now() - cfg.at < 3000).current;
  const live = useRef(!still && merge && Date.now() - merge.at < 3000).current;
  const spots = merge ? CELEB_BAKERIES.filter(b => b.lat) : [];
  const miss = merge ? CELEB_BAKERIES.filter(b => !b.lat) : [];
  const pct = b => { const [x, y] = at(M, b.lat, b.lon); return { left: (x / M.W) * 100 + '%', top: (y / M.H) * 100 + '%' }; };
  return (
    <div className={'mm mm-' + cfg.style + (born ? ' born' : '') + (live ? ' live' : '')} style={{ width: w }}>
      {name && <b className="mm-name">{name}</b>}
      <div className="mm-geo">
        <svg viewBox={`0 0 ${M.W} ${M.H}`} aria-hidden="true">
          {cfg.region === 'paris'
            ? M.ar.map(a => <path key={a.n} d={a.d} pathLength="1" />)
            : <path d={M.d} pathLength="1" />}
        </svg>
        {spots.map((b, i) => (
          <span key={b.name} className={'mm-pin' + (cfg.pins ? '' : ' dot')} style={{ ...pct(b), '--i': i }}>
            <i />
            {cfg.pins && <em>{b.name}<small>{b.who}</small></em>}
          </span>
        ))}
        {live && <span className="mm-busy"><s />{merge.name} 합치는 중</span>}
      </div>
      {miss.length > 0 && (
        <p className="mm-miss" style={{ '--i': spots.length }}>{miss.map(b => b.name + ' · ' + b.who).join(', ')} — 위치를 못 찾았어요</p>
      )}
    </div>
  );
}
