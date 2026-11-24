import { useEffect, useRef, useState } from 'react';
import BlankRegion from './BlankRegion';
import FigmaMenu from './FigmaMenu';
import GhostDemo from './GhostDemo';
import DrawKit from './DrawKit';
import './BlankDeclare.css';

// 여기서 누르면 빈칸 그리기를 시작하지 않음 (원래 동작이 있는 곳)
const NODRAW = '.rg, .fm, .px, .tb, .te, .bitem, button, a, input, textarea, label, .strip-wrap, .slider, .remix, .cs, .view-empty, .gpt-panel, .fs, .bh';
const GRID = 24, snap = v => Math.round(v / GRID) * GRID;
// 우클릭 · Cmd+클릭 · 꾹 누르기로 여는 빈칸도 그려서 연 빈칸과 똑같은 판 (모든 빈칸의 기준 = 기본 빈칸 선언)
//   (예전엔 가로로 긴 한 줄짜리 작은 빈칸이었음)
const COMPACT_W = 240, COMPACT_H = 110;
const compactAt = (x, y, extra) => ({
  x: Math.max(8, Math.min(innerWidth - COMPACT_W - 8, x)),
  y: Math.max(8, Math.min(innerHeight - COMPACT_H - 8, y)),
  done: true, ...extra
});
// 빈칸을 놓으면: 그린 자리(왼쪽 위)에 내용만큼의 작은 유리판이 뜸 — 빈 공간 없이. 그린 자리·크기는 drawn에 남김
// (새 아이템은 drawn 자리·크기 그대로 놓임). 화면 밖으로 나가지 않게 판의 대략 크기(240×110)로 막음
const CARD_W = 240, CARD_H = 110;
const settle = r => ({
  ...r,
  x: Math.max(8, Math.min(innerWidth - CARD_W - 8, r.x)), y: Math.max(8, Math.min(innerHeight - CARD_H - 8, r.y)),
  drawn: { x: r.x, y: r.y, w: r.w, h: r.h }
});
const LEARN_KEY = 'blip.blankDeclare.learned';
const readLearned = () => { try { return localStorage.getItem(LEARN_KEY) === '1'; } catch { return false; } };

// 빈칸 선언: 화면 어디서든 드래그 → 점선 영역 + 기능 아이콘 + 입력.
// 빈칸에서 만든 아이템은 보이지 않는 격자에 붙어 지울 때까지 그 자리에 남음. 꾹 누르면 흔들리며 ×로 제거
// context: 지금 하는 일 (빈칸의 3가지가 바뀜). kit: 드로잉키트가 고친 대상·도구 실행
export default function BlankDeclare({ onSearch, demoAllowed, context, kit }) {
  const [region, setRegion] = useState(null);
  const [answer, setAnswer] = useState(null); // 빈칸에 물어본 것의 짧은 답 (잠깐 떴다 사라짐)
  useEffect(() => { if (!answer) return undefined; const t = setTimeout(() => setAnswer(null), 2500); return () => clearTimeout(t); }, [answer]);
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
      // Cmd를 누른 채 잡을 수 있는 것(점선)을 누르면 = 뜯어 옮기기. 빈칸 그리기는 시작하지 않음
      if ((e.metaKey || e.ctrlKey) && t.closest('[data-tear]')) { drawRef.current = null; return; }
      if (wiggleRef.current && !t.closest('.bitem')) { setWiggle(false); return; }
      // 내 판의 빈 장 위(조각·글자가 아닌 바탕)는 빈칸을 그릴 수 있음. 드로잉키트로 그리는 중이면 그쪽이 먼저
      const onBlank = t.closest('[data-declare]') && !t.closest('[data-piece], [data-comp], [data-el], input, textarea, button, .cx')
        && !document.body.classList.contains('tool-draw') && !document.body.classList.contains('tool-text');
      if (regionRef.current && !t.closest('.rg, .fm') && !onBlank && t.closest(NODRAW)) setRegion(null);
      if (!onBlank && t.closest(NODRAW)) return;
      if (regionRef.current) setRegion(null);
      drawRef.current = { x: e.clientX, y: e.clientY, on: false, empty: t.closest('[data-empty]')?.dataset.empty,
        layer: t.closest('[data-layer]')?.dataset.layer }; // 내 판 위에서 그렸으면 그 장 (Text가 그 장에 글을 넣음) // 빈 장 위에서 그린 빈칸이면 빈 장용 아이콘
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
      setRegion(r => r && { ...settle(r), done: true, ...(d.empty ? { context: 'emptypage', layerId: d.empty } : d.layer ? { layerId: d.layer } : {}) });
      setLearned(true);
      try { localStorage.setItem(LEARN_KEY, '1'); } catch { /* 저장 못 해도 이번 세션 동안은 기억 */ }
    };
    const abandon = () => { const d = drawRef.current; drawRef.current = null; if (d?.on) { setDrawing(false); setRegion(null); } };
    const key = e => { if (e.key === 'Escape') { setRegion(null); setWiggle(false); } };
    addEventListener('pointerdown', down);
    addEventListener('dragstart', abandon, true); addEventListener('pointercancel', abandon);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('keydown', key);
    return () => {
      removeEventListener('pointerdown', down);
      removeEventListener('dragstart', abandon, true); removeEventListener('pointercancel', abandon);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('keydown', key);
    };
  }, []);

  useEffect(() => { document.body.classList.toggle('drawing', drawing); }, [drawing]);

  // 우클릭 = 그 자리에 작은 빈칸. 글자를 쓰는 곳에선 원래 메뉴(붙여넣기 등)
  useEffect(() => {
    const menu = e => {
      const t = e.target;
      if (t.closest?.('input, textarea, [contenteditable="true"], .gpt-panel, .pj-panel, .pj-menu')) return; // 프로젝트 폴더 = 기본 우클릭 메뉴
      e.preventDefault();
      const unit = t.closest?.('[data-tear]'); // 왼쪽 원본의 컴포넌트 위라면 그 컴포넌트에 맞춘 3가지
      const subject = unit && (unit.dataset.bread || unit.innerText.trim().split(/\s+/).slice(0, 3).join(' '));
      // 내 판의 빈 장 위라면: 맨 앞에 "채우기" (그 장을 블립의 제안 콘텐츠로)
      const empty = !unit && t.closest?.('[data-empty]')?.dataset.empty;
      // 오른쪽 콘텐츠(내 판의 장) 위라면: 피그마 우클릭 메뉴 (위엔 블립의 4가지 + 검색)
      const page = !unit && t.closest?.('.pane.edit .viewer');
      if (page) {
        const layer = t.closest('[data-layer]')?.dataset.layer || empty || null;
        const piece = t.closest('[data-piece]')?.dataset.piece || null;
        const pEl = t.closest('[data-piece]');
        const kind = pEl?.classList.contains('pc-item') ? 'item' : null, name = pEl?.querySelector('[data-ptext]')?.textContent.trim() || '';
        const comp = !piece ? (t.closest('[data-comp]')?.dataset.comp || t.closest('[data-el]')?.dataset.el || null) : null;
        const asks = t.closest('[data-asks]')?.dataset.asks.split('|') || null;
        const ins = t.closest('[data-ins]')?.dataset.ins || null; // 끼워 넣은 글 칸 → 맨 앞 아이콘이 텍스트 에디터 // 이 문단에 맞춘 블립 추천 (맨 위)
        setRegion({ x: Math.min(e.clientX, innerWidth - 256), y: Math.max(8, Math.min(e.clientY, innerHeight - 500)), done: true, context: empty ? 'emptypage' : 'edit', layerId: empty || undefined,
          menu: { layerId: layer, piece, comp: ins ? null : comp, kind, name, asks: ins ? null : asks, ins, x: e.clientX, y: e.clientY } });
        setLearned(true);
        return;
      }
      // 버튼 위 우클릭(예: 주문하기)이면 그 버튼에 대한 질문으로 받음 (data-askctx)
      const askCtx = t.closest?.('[data-askctx]')?.dataset.askctx;
      setRegion(compactAt(e.clientX + 6, e.clientY + 6, { ...(unit ? { context: 'component', subject } : empty ? { context: 'emptypage', layerId: empty } : {}), ...(askCtx ? { askCtx } : {}) }));
      setLearned(true);
    };
    addEventListener('contextmenu', menu);
    return () => removeEventListener('contextmenu', menu);
  }, []);

  // 왼쪽 원본의 컴포넌트를 꾹 누르면: 그 컴포넌트 바로 아래에 작은 빈칸 (컴포넌트를 가리지 않게)
  useEffect(() => {
    const open = e => {
      const { rect: r, context: ctx, subject, acts, tear, at } = e.detail;
      // 마우스가 있는 자리에 (화면 밖으로 나가지 않게)
      if (at) {
        setRegion(compactAt(at.x + 10, at.y + 10, { context: ctx, subject, acts, tear }));
        return;
      }
      const below = r.y + r.h + 8 + COMPACT_H < innerHeight ? r.y + r.h + 8 : r.y - COMPACT_H - 8;
      setRegion(compactAt(r.x + r.w / 2 - COMPACT_W / 2, below, { context: ctx, subject, acts, tear }));
    };
    const close = () => setRegion(r => (r?.context === 'component' ? null : r)); // 꾹 누른 뒤 끌기 시작하면 그 빈칸은 닫음
    // 결과의 검색 문장을 누르면: 그 자리에 빈칸이 다시 열림 (쓴 문장 · 고른 기준 그대로)
    const research = e => {
      const { q, picks, rect: r } = e.detail;
      setRegion(compactAt(r.x, r.y + r.h + 6, { preset: { v: q, picks } }));
    };
    addEventListener('blip:research', research);
    addEventListener('blip:declare', open);
    addEventListener('blip:undeclare', close);
    return () => { removeEventListener('blip:declare', open); removeEventListener('blip:research', research); removeEventListener('blip:undeclare', close); };
  }, []);

  // 새 아이템은 선언한 그 자리에. 내 판의 장 위에서 선언했으면 그 장의 조각이 되고(EditSurface가 받음),
  // 아니면 화면 위에 떠 있는 아이템이 됨. 어느 쪽이든 놓이자마자 끌어서 옮길 수 있음
  const addItem = (name, r, type = 'item') => {
    if (type === 'item') {
      const ev = new CustomEvent('blip:item', { detail: { name, rect: r.drawn || r }, cancelable: true });
      dispatchEvent(ev);
      if (ev.defaultPrevented) { setRegion(null); return; }
    }
    const it = type === 'kit'
      ? { id: 'b' + ++uid.current, name, type, x: Math.max(8, Math.min(r.x, innerWidth - 560)), y: Math.max(8, Math.min(r.y + r.h - 70, innerHeight - 80)) }
      : { id: 'b' + ++uid.current, name, type, x: Math.round((r.drawn || r).x + (r.drawn || r).w / 2 - 60), y: Math.round((r.drawn || r).y + (r.drawn || r).h / 2 - 51), fresh: true };
    // 드로잉키트는 하나만: 다시 고르면 새 자리로 옮겨 감
    setItems(list => [...(type === 'kit' ? list.filter(x => x.type !== 'kit') : list), it]);
    setRegion(null);
  };
  // 떠 있는 아이템 옮기기: 누른 채 이동. 놓으면 보이지 않는 격자에 붙음. 움직이지 않고 꾹 누르면 흔들림(지우기)
  // 드로잉키트는 언제든 어디로든: 버튼 위에서 눌러도 끌기 시작하면 옮기기 (그때 버튼 클릭은 무시)
  const grab = (e, it) => {
    const kit = it.type === 'kit';
    if (e.button !== 0 || wiggle || e.target.closest('.bx, input, select, textarea, .fk-menu') || (!kit && e.target.closest('button'))) return;
    const p = { x: e.clientX, y: e.clientY, ox: it.x, oy: it.y, moved: false };
    if (!kit) pressRef.current = setTimeout(() => { if (!p.moved) setWiggle(true); }, 500);
    const move = ev => {
      const dx = ev.clientX - p.x, dy = ev.clientY - p.y;
      if (!p.moved && Math.hypot(dx, dy) < 4) return;
      p.moved = true; clearTimeout(pressRef.current);
      setItems(list => list.map(x => (x.id === it.id ? {
        ...x, moving: true,
        x: Math.max(0, Math.min(innerWidth - 40, p.ox + dx)), y: Math.max(0, Math.min(innerHeight - 30, p.oy + dy))
      } : x)));
    };
    const up = () => {
      clearTimeout(pressRef.current);
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      if (!p.moved) return;
      setItems(list => list.map(x => (x.id === it.id ? { ...x, x: kit ? x.x : snap(x.x), y: kit ? x.y : snap(x.y), moving: false } : x)));
      // 끌고 난 직후의 클릭(도구 버튼)은 무시
      const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };
      addEventListener('click', eat, { capture: true, once: true });
      setTimeout(() => removeEventListener('click', eat, { capture: true }), 0);
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  };
  // 채우기: 그 빈 장을 블립이 제안하는 콘텐츠(반투명)로 — App이 받음
  const fill = r => {
    dispatchEvent(new CustomEvent('blip:fillpage', { detail: { layerId: r.layerId } }));
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
          <div key={it.id} className={'bitem' + (it.type === 'kit' ? ' kit-item' : '') + (it.fresh ? ' fresh' : '') + (it.moving ? ' moving' : '')} style={{ left: it.x, top: it.y }}
            onPointerDown={e => grab(e, it)}>
            <button className="bx" onClick={() => removeItem(it.id)} title="제거" aria-label={it.name + ' 제거'}>×</button>
            {it.type === 'kit'
              ? <DrawKit target={kit?.target} onTool={kit?.onTool} tool={kit?.tool} onSetTool={kit?.setTool} onImage={kit?.onImage} disabled={wiggle} />
              : (<><div className="bic">{it.name[0]}</div><span>{it.name}</span></>)}
          </div>
        ))}
      </div>
      {region?.menu && (
        <FigmaMenu region={region} onClose={() => setRegion(null)} onSubmit={q => { setRegion(null); onSearch(q); }}
          onPick={a => {
            if (a.k === 'texteditor') { dispatchEvent(new CustomEvent('blip:texteditor', { detail: { layerId: region.menu.layerId, ins: region.menu.ins, x: region.menu.x, y: region.menu.y } })); setRegion(null); }
            else if (a.k === 'text') { dispatchEvent(new CustomEvent('blip:menu', { detail: { action: 'text', ...region.menu } })); setRegion(null); }
            else if (a.k === 'fill') fill(region);
            else if (a.k === 'drawkit') addItem(a.t, { x: region.x, y: region.y, w: 0, h: 70 }, 'kit');
            else setRegion(compactAt(region.x, region.y, { context: region.context, layerId: region.layerId, ...(a.k === 'new' ? { startMode: 'new' } : {}) }));
          }} />
      )}
      {region && !region.menu && (
        <BlankRegion region={region} context={context} onClose={() => setRegion(null)} onNewItem={addItem} onFill={fill}
          onText={r => {
            const x = r.x + (r.w || 0) / 2, y = r.y + (r.h || 0) / 2;
            // 내 판의 장 위면 그 장에 글 / 아니면(판을 만들기 전 · 바깥) 오른쪽에 떠 있는 글로
            dispatchEvent(new CustomEvent(r.layerId ? 'blip:menu' : 'blip:floattext', { detail: { action: 'text', layerId: r.layerId, x, y } }));
            setRegion(null);
          }}
          onSubmit={(q, picks, view) => {
            // 주문하기 위에서 "지금 주문하면 얼마나 걸려?" → 그 자리에 답이 잠깐 (2.5초) 떴다가 사라짐 (검색하지 않음)
            if (region.askCtx === 'order' && /얼마나|몇\s*분|걸려|걸리/.test(q)) { setAnswer({ id: Date.now(), text: '25분', x: region.x, y: region.y }); setRegion(null); return; }
            setRegion(null); onSearch(q, picks, view);
          }} />
      )}
      {answer && <div className="bd-answer" key={answer.id} style={{ left: answer.x, top: answer.y }} role="status">{answer.text}</div>}
      <GhostDemo enabled={demoAllowed && !learned && !region && !drawing} />
    </>
  );
}
