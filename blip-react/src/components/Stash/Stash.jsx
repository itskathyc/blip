import { useEffect, useRef, useState } from 'react';
import { fromPiece, fromText, fromTile, layout } from '../../data/stash';
import './Stash.css';

// 던져 두기: 콘텐츠(오른쪽 화면) 말고 아무 데나 떨어뜨리면 그 자리에 요약 아이콘 하나.
// 같은 맥락이 3개 쌓이면 그 자리로 모여 폴더가 됨. 폴더를 누르면 펼쳐짐.
//   아이콘·폴더를 오른쪽 화면에 끌어 넣기 = 불러오기 (복사, 아이콘은 남음)
//   아이콘을 폴더(또는 다른 아이콘) 위에 놓기 = 그 묶음에 넣기 / 펼친 폴더에서 바깥으로 끌기 = 빼기
//   꾹 누르기 = 흔들림 → × 지우기 (오른쪽 화면과 같은 문법)
const OURS = ['text/blip-piece', 'text/blip-tile', 'text/blip-stash-move', 'text/uri-list', 'text/plain'];
const SKIP = 'input, textarea, select, [contenteditable="true"], .imp-modal, .gpt-panel';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const spot = (x, y) => ({ x: clamp(x - 34, 8, innerWidth - 84), y: clamp(y - 30, 8, innerHeight - 96) });

export default function Stash({ resolve, onOpen }) {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(null); // 펼친 폴더의 맥락
  const [wiggle, setWiggle] = useState(false);
  const [over, setOver] = useState(null); // 끌고 있는 것이 올라간 폴더·아이콘의 맥락
  const ptr = useRef({ x: innerWidth / 2, y: innerHeight / 2 });
  const hold = useRef(null);
  const { folders } = layout(assets);
  const folderOf = new Map(folders.flatMap(f => f.items.map(a => [a.id, f])));

  useEffect(() => {
    const ctxAt = el => el?.closest?.('[data-stash-ctx]')?.dataset.stashCtx || null;
    const mine = e => [...(e.dataTransfer?.types || [])].some(t => OURS.includes(t));
    const dragover = e => {
      if (!mine(e) || e.target.closest?.(SKIP)) return;
      // 오른쪽 화면은 전체가 내 판의 것 (콘텐츠 영역이 아직 없어도) — 던져 두기는 그 밖에서만
      if (e.target.closest?.('.pane.edit')) { setOver(null); return; }
      e.preventDefault();
      setOver(ctxAt(e.target));
    };
    const drop = e => {
      setOver(null);
      if (e.defaultPrevented || !mine(e) || e.target.closest?.(SKIP) || e.target.closest?.('.pane.edit')) return;
      const dt = e.dataTransfer;
      const into = ctxAt(e.target);
      const at = spot(e.clientX, e.clientY);
      const moved = dt.getData('text/blip-stash-move');
      if (moved) {
        e.preventDefault();
        const { ids, folder } = JSON.parse(moved);
        setAssets(list => list.map(a => {
          if (!ids.includes(a.id)) return a;
          if (into && into !== (a.pin || a.ctx)) return { ...a, pin: into };
          if (folder) return a.id === ids[0] ? { ...a, ...at } : a; // 폴더째 옮기기: 폴더 자리 = 첫 아이콘 자리
          return { ...a, ...at, ...(folderOf.has(a.id) ? { pin: 'solo:' + a.id } : {}) };
        }));
        return;
      }
      // 보고 있던 원본 위에 다시 놓은 건 던진 게 아님
      if (e.target.closest?.('.pane.dig .viewer')) return;
      let made = null;
      const piece = dt.getData('text/blip-piece');
      const tile = dt.getData('text/blip-tile');
      if (piece) made = fromPiece(JSON.parse(piece));
      else if (tile) { const r = resolve(tile); if (r) made = fromTile(r.tile, r.page); }
      else {
        const text = dt.getData('text/uri-list').split('\n').find(l => l && !l.startsWith('#')) || dt.getData('text/plain');
        if (text?.trim()) made = fromText(text);
      }
      if (!made) return;
      e.preventDefault();
      setAssets(list => [...list, { ...made, ...at, ...(into ? { pin: into } : {}), fresh: true }]);
    };
    const leave = e => { if (!e.relatedTarget) setOver(null); };
    // 붙여넣기(⌘V)도 던지기: 마우스가 있는 자리에. 블로그 주소는 원래대로 불러오기가 먼저 받음
    const paste = e => {
      if (e.target.closest?.(SKIP)) return;
      const text = e.clipboardData?.getData('text') || '';
      if (!text.trim()) return;
      setTimeout(() => {
        if (e.defaultPrevented) return;
        const at = spot(ptr.current.x, ptr.current.y);
        setAssets(list => [...list, { ...fromText(text), ...at, fresh: true }]);
      });
    };
    const track = e => { ptr.current = { x: e.clientX, y: e.clientY }; };
    addEventListener('dragover', dragover);
    addEventListener('drop', drop);
    addEventListener('dragleave', leave);
    addEventListener('paste', paste);
    addEventListener('pointermove', track);
    return () => {
      removeEventListener('dragover', dragover); removeEventListener('drop', drop); removeEventListener('dragleave', leave);
      removeEventListener('paste', paste); removeEventListener('pointermove', track);
    };
  });

  // 흔들림·펼친 폴더는 바깥을 누르면 닫힘
  useEffect(() => {
    if (!wiggle && !open) return undefined;
    const stop = e => {
      if (e.target.closest?.('.st-x')) return;
      if (!e.target.closest?.('.st-ic, .st-fd, .st-open')) { setWiggle(false); setOpen(null); }
    };
    addEventListener('pointerdown', stop);
    return () => removeEventListener('pointerdown', stop);
  }, [wiggle, open]);

  const press = () => { clearTimeout(hold.current); hold.current = setTimeout(() => { hold.current = 'long'; setWiggle(true); }, 550); };
  const release = () => { if (hold.current !== 'long') clearTimeout(hold.current); };
  const wasLong = () => { const l = hold.current === 'long'; hold.current = null; return l; };
  const dragStart = (e, list, folder) => {
    clearTimeout(hold.current);
    e.dataTransfer.setData('text/blip-stash', JSON.stringify(list));
    e.dataTransfer.setData('text/blip-stash-move', JSON.stringify({ ids: list.map(a => a.id), folder }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };
  const remove = ids => setAssets(list => list.filter(a => !ids.includes(a.id)));

  const icon = (a, style, cls = '') => (
    <div key={a.id} className={'st-ic ' + cls + (a.fresh ? ' fresh' : '') + (wiggle ? ' wig' : '') + (over === (a.pin || a.ctx) && !folderOf.has(a.id) ? ' over' : '')}
      style={style} data-stash-ctx={folderOf.has(a.id) ? undefined : a.pin || a.ctx} draggable={!wiggle}
      onDragStart={e => dragStart(e, [a], false)} onPointerDown={press} onPointerUp={release} onPointerLeave={release}
      onAnimationEnd={() => a.fresh && setAssets(list => list.map(x => (x.id === a.id ? { ...x, fresh: false } : x)))}
      onClick={() => { if (!wasLong() && !wiggle) onOpen(a); }} title={a.sum}>
      <span className={'st-glyph t-' + a.type}>{a.icon}</span>
      <b>{a.title}</b>
      <span className="st-card" aria-hidden="true"><em>{a.from || (a.type === 'clip' ? '조각' : '링크')}</em>{a.sum}</span>
      {wiggle && <button className="st-x" aria-label="지우기" onClick={e => { e.stopPropagation(); remove([a.id]); }}>×</button>}
    </div>
  );

  if (!assets.length) return null;
  const openF = folders.find(f => f.ctx === open);
  return (
    <div className="st" aria-label="던져 둔 것">
      {/* 폴더 안에 든 것은 폴더 자리로 날아가 사라짐 */}
      {assets.map(a => {
        const f = folderOf.get(a.id);
        return f ? <span key={a.id} className="st-ic in" style={{ left: f.x, top: f.y }} aria-hidden="true"><span className="st-glyph">{a.icon}</span></span>
          : icon(a, { left: a.x, top: a.y });
      })}
      {folders.map(f => (
        <div key={'f:' + f.ctx} className={'st-fd' + (open === f.ctx ? ' on' : '') + (wiggle ? ' wig' : '') + (over === f.ctx ? ' over' : '')}
          style={{ left: f.x, top: f.y }} data-stash-ctx={f.ctx} draggable={!wiggle}
          onDragStart={e => dragStart(e, f.items, true)} onPointerDown={press} onPointerUp={release} onPointerLeave={release}
          onClick={() => { if (!wasLong() && !wiggle) setOpen(o => (o === f.ctx ? null : f.ctx)); }} title={f.ctx + ' · ' + f.items.length + '개'}>
          <span className="st-folder">
            <i className="st-tab" />
            <span className="st-peek">{f.items.slice(-3).map(a => <span key={a.id}>{a.icon}</span>)}</span>
            <span className="st-n">{f.items.length}</span>
          </span>
          <b>{f.ctx}</b>
          {wiggle && <button className="st-x" aria-label="폴더 지우기" onClick={e => { e.stopPropagation(); remove(f.items.map(a => a.id)); }}>×</button>}
        </div>
      ))}
      {openF && (
        <div className="st-open" style={{ left: clamp(openF.x - 80, 8, innerWidth - 300), top: openF.y + 92 > innerHeight - 220 ? openF.y - 200 : openF.y + 92 }}>
          <p>{openF.ctx}</p>
          <div className="st-grid">{openF.items.map(a => icon(a, undefined, 'inner'))}</div>
        </div>
      )}
    </div>
  );
}
