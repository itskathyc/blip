import { useEffect, useRef, useState } from 'react';
import BlankRegion from './BlankRegion';
import GhostDemo from './GhostDemo';
import './BlankDeclare.css';

// 여기서 누르면 빈칸 그리기를 시작하지 않음 (원래 동작이 있는 곳)
const NODRAW = '.rg, .bitem, button, a, input, textarea, label, .strip-wrap, .slider, .remix, .cs, .view-empty';
const GRID = 24, snap = v => Math.round(v / GRID) * GRID;
const LEARN_KEY = 'blip.blankDeclare.learned';
const readLearned = () => { try { return localStorage.getItem(LEARN_KEY) === '1'; } catch { return false; } };

// 빈칸 선언: 화면 어디서든 드래그 → 점선 영역 + 기능 아이콘 + 입력.
// 빈칸에서 만든 아이템은 보이지 않는 격자에 붙어 지울 때까지 그 자리에 남음. 꾹 누르면 흔들리며 ×로 제거
export default function BlankDeclare({ onSearch, demoAllowed }) {
  const [region, setRegion] = useState(null);
  const [items, setItems] = useState([]);
  const [wiggle, setWiggle] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [learned, setLearned] = useState(readLearned);
  const drawRef = useRef(null), regionRef = useRef(null), wiggleRef = useRef(false), pressRef = useRef(0), uid = useRef(0);
  regionRef.current = region;
  wiggleRef.current = wiggle;

  useEffect(() => {
    const down = e => {
      if (e.button !== 0 || !e.target.closest) return;
      const t = e.target;
      if (wiggleRef.current && !t.closest('.bitem')) { setWiggle(false); return; }
      if (regionRef.current && !t.closest('.rg') && t.closest(NODRAW)) setRegion(null);
      if (t.closest(NODRAW)) return;
      if (regionRef.current) setRegion(null);
      drawRef.current = { x: e.clientX, y: e.clientY, on: false };
    };
    const move = e => {
      const d = drawRef.current;
      if (!d) return;
      if (!d.on) {
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return; // 6px 전에는 클릭으로 봄
        d.on = true; setDrawing(true);
      }
      setRegion({ x: Math.min(d.x, e.clientX), y: Math.min(d.y, e.clientY), w: Math.abs(e.clientX - d.x), h: Math.abs(e.clientY - d.y), done: false });
    };
    const up = () => {
      clearTimeout(pressRef.current);
      const d = drawRef.current;
      drawRef.current = null;
      if (!d || !d.on) return;
      setDrawing(false);
      setRegion(r => r && { ...r, done: true });
      setLearned(true);
      try { localStorage.setItem(LEARN_KEY, '1'); } catch { /* 저장 못 해도 이번 세션 동안은 기억 */ }
    };
    const key = e => { if (e.key === 'Escape') { setRegion(null); setWiggle(false); } };
    addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('keydown', key);
    return () => {
      removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('keydown', key);
    };
  }, []);

  useEffect(() => { document.body.classList.toggle('drawing', drawing); }, [drawing]);

  const addItem = (name, r) => {
    setItems(list => [...list, { id: 'b' + ++uid.current, name, x: snap(r.x + r.w / 2 - 60), y: snap(r.y + r.h / 2 - 60) }]);
    setRegion(null);
  };
  const removeItem = id => {
    const next = items.filter(it => it.id !== id);
    setItems(next);
    if (!next.length) setWiggle(false);
  };

  return (
    <>
      <div className={'bfull' + (wiggle ? ' wiggle' : '')}>
        {items.map(it => (
          <div key={it.id} className="bitem" style={{ left: it.x, top: it.y }}
            onPointerDown={() => { if (!wiggle) pressRef.current = setTimeout(() => setWiggle(true), 500); }}>
            <button className="bx" onClick={() => removeItem(it.id)} title="제거" aria-label={it.name + ' 제거'}>×</button>
            <div className="bic">{it.name[0]}</div>
            <span>{it.name}</span>
          </div>
        ))}
      </div>
      {region && (
        <BlankRegion region={region} onClose={() => setRegion(null)} onNewItem={addItem}
          onSubmit={q => { setRegion(null); onSearch(q); }} />
      )}
      <GhostDemo enabled={demoAllowed && !learned && !region && !drawing} />
    </>
  );
}
