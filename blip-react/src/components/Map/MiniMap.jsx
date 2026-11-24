import { useEffect, useRef, useState } from 'react';
import { FRANCE, PARIS, at } from '../../data/mapShapes';
import { findPlace, MAP_APPS, openUrl } from './places';
import './Map.css';

// 지도 조각: 실제 경계선 (프랑스 전역 / 파리 20구), 디자인 3가지 (선 · 종이 · 밤)
// 핀(📍)은 두 가지로 꽂힘 — 아이템을 지도에 던지기(합치기) / 지도 빈 곳을 직접 탭
// 핀: 끌면 옮김 · 탭하면 카드 (고른 지도 앱에서 열기 · 빼기)
const fresh = t => t && Date.now() - t < 3000;
const send = (el, op, pin) => {
  const es = el.closest('.es[data-layer]'), pc = el.closest('[data-piece]');
  if (es && pc) dispatchEvent(new CustomEvent('blip:mappin', { detail: { layerId: es.dataset.layer, map: pc.dataset.piece, op, pin } }));
};

function Busy({ merge }) {
  const on = useRef(fresh(merge.at)).current;
  return on ? <span className="mm-busy"><s />{merge.name} 합치는 중</span> : null;
}

function Pin({ p, pos, labels, dot, onDown, open, naming, onName }) {
  const drop = useRef(fresh(p.at)).current; // 막 꽂힌 핀만 떨어지는 움직임
  const [v, setV] = useState('');
  return (
    <span className={'mm-pin' + (dot ? ' dot' : '') + (drop ? ' drop' : '') + (open ? ' open' : '')} style={{ ...pos, '--d': p.m ? 1.7 + (p.i || 0) * .6 + 's' : '0s' }}
      onPointerDown={onDown} onClick={e => e.stopPropagation()}>
      <i aria-hidden="true">{dot ? '' : '📍'}</i>
      {labels && (p.name || p.note) && <em>{p.name || p.note}{p.who && <small>{p.who}</small>}</em>}
      {naming && (
        <input className="mm-name-in" autoFocus value={v} placeholder="가게 이름이나 메모" spellCheck="false"
          onPointerDown={e => e.stopPropagation()} onChange={e => setV(e.target.value)}
          onKeyDown={e => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') { e.preventDefault(); onName(v.trim()); }
            if (e.key === 'Escape') onName('');
          }}
          onBlur={() => onName(v.trim())} />
      )}
    </span>
  );
}

export default function MiniMap({ cfg, pins = [], miss = [], merge, name, w = 340, still = false }) {
  const M = cfg.region === 'paris' ? PARIS : FRANCE;
  const born = useRef(!still && fresh(cfg.at)).current;
  const geo = useRef(null);
  const [card, setCard] = useState(null);   // 카드가 열린 핀
  const [naming, setNaming] = useState(null); // 방금 직접 찍어 이름을 기다리는 핀
  const can = !still && cfg.pins;
  useEffect(() => { if (card && !pins.some(p => p.id === card)) setCard(null); }, [pins, card]);

  const pos = p => {
    if (p.lat != null) { const [x, y] = at(M, p.lat, p.lon); return { left: (x / M.W) * 100 + '%', top: (y / M.H) * 100 + '%' }; }
    return { left: p.fx * 100 + '%', top: p.fy * 100 + '%' };
  };
  const frac = ev => {
    const r = geo.current.getBoundingClientRect(); // 지도 안 비율
    return { fx: Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), fy: Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)) };
  };

  // 지도 빈 곳 탭 → 그 자리에 📍 + 이름 칸
  const tap = e => {
    if (!can || e.target.closest('.mm-pin, .mm-card')) return;
    const id = 'pin' + Date.now();
    send(geo.current, 'add', { id, ...frac(e), at: Date.now() });
    setCard(null); setNaming(id);
  };
  // 📍 끌기 = 옮기기 / 그냥 떼기 = 카드
  const down = p => e => {
    if (still || e.button !== 0) return;
    e.stopPropagation();
    const s = { x: e.clientX, y: e.clientY, moved: false, cmd: e.metaKey || e.ctrlKey }; // 핀 옮기기도 Cmd를 누르고 있는 동안만 (떼고 누르면 카드)
    // 잡은 자리와 핀 끝 사이 거리는 그대로 (핀이 손끝으로 튀지 않게)
    const r = geo.current.getBoundingClientRect(), tip = e.currentTarget.getBoundingClientRect();
    const off = { x: e.clientX - tip.left, y: e.clientY - tip.top };
    const move = ev => {
      if (!s.cmd || !(ev.metaKey || ev.ctrlKey)) return;
      if (!s.moved && Math.hypot(ev.clientX - s.x, ev.clientY - s.y) < 4) return;
      if (!s.moved) setCard(null);
      s.moved = true;
      const fx = (ev.clientX - off.x - r.left) / r.width, fy = (ev.clientY - off.y - r.top) / r.height;
      send(geo.current, 'set', { id: p.id, fx: Math.min(1, Math.max(0, fx)), fy: Math.min(1, Math.max(0, fy)), lat: null, lon: null, approx: false, at: 0 });
    };
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      if (!s.moved && naming !== p.id) setCard(c => (c === p.id ? null : p.id));
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };
  const named = p => t => {
    setNaming(null);
    if (!t) { if (!p.name && !p.note) send(geo.current, 'del', { id: p.id }); return; }
    const f = findPlace(t, cfg.region);
    if (f && !f.outside) send(geo.current, 'set', { id: p.id, ...f, fx: f.fx ?? null, fy: f.fy ?? null, lat: f.lat ?? null, lon: f.lon ?? null, note: null });
    else send(geo.current, 'set', { id: p.id, note: t, name: null, outside: f?.outside ? f.name : null });
  };
  const cp = card && pins.find(p => p.id === card);

  return (
    <div className={'mm mm-' + cfg.style + (born ? ' born' : '') + (can ? ' can' : '')} style={{ width: w }}>
      {name && <b className="mm-name">{name}</b>}
      <div className="mm-geo" ref={geo} onClick={tap}>
        <svg viewBox={`0 0 ${M.W} ${M.H}`} aria-hidden="true">
          {cfg.region === 'paris'
            ? M.ar.map(a => <path key={a.n} d={a.d} pathLength="1" />)
            : <path d={M.d} pathLength="1" />}
        </svg>
        {pins.map(p => (
          <Pin key={p.id} p={p} pos={pos(p)} labels={!still} dot={!cfg.pins} onDown={down(p)} open={card === p.id}
            naming={naming === p.id} onName={named(p)} />
        ))}
        {cp && (
          <div className="mm-card" style={pos(cp)} onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            <b>{cp.name || cp.note}{cp.who && <small>{cp.who}</small>}</b>
            {cp.where && <span>{cp.where}{cp.approx ? ' · 대략 위치' : ''}</span>}
            {cp.line && <p>{cp.line}</p>}
            {cp.outside && <span>‘{cp.outside}’는 이 지도 밖이라 메모로 꽂았어요</span>}
            <div className="mm-card-act">
              {cp.name && <a href={openUrl(cfg.app, cp)} target="_blank" rel="noreferrer">{MAP_APPS[cfg.app] || MAP_APPS.google}에서 열기</a>}
              <button onClick={() => { send(geo.current, 'del', { id: cp.id }); setCard(null); }}>빼기</button>
            </div>
          </div>
        )}
        {merge && <Busy key={merge.at} merge={merge} />}
      </div>
      {miss.length > 0 && (
        <p className={'mm-miss' + (merge && fresh(merge.at) ? ' late' : '')} style={{ '--d': 2.2 + pins.filter(p => p.m).length * .6 + 's' }}>{miss.map(b => b.name + (b.who ? ' · ' + b.who : '')).join(', ')} — 위치를 못 찾았어요</p>
      )}
    </div>
  );
}
