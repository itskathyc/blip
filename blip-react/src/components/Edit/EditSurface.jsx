import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cloneUnit } from './cloneUnit';
import { getClip, setClip } from '../../data/clip';
import Shape from './Shape';
import { TextBlock, TextEditor } from './TextBlock';

const MOVE = 6;      // 이만큼 움직이면 "누른 채 이동"
const LONG = 500;    // 이만큼 누르고 있으면 "꾹 누르기"

// 사진 편집 앱의 손가락 문법을 슬라이드 한 장에
//   탭          고르기 (드로잉키트 도구가 고른 것에 맞게 바뀜)        → 선명해지지 않음
//   두 번 탭     글자 고쳐 쓰기                                       → 시작하는 순간 선명
//   누른 채 이동  조각 옮기기                                         → 움직이는 순간 선명
//   핀치         조각 크기 (트랙패드 핀치 = ctrl + 휠)                → 선명
//   꾹 누르기     조각이 흔들림 → × 로 지우기                         → 선명
//   좌우로 밀기   넘기기 (바깥 캐러셀이 처리)                          → 선명해지지 않음
// 조각(data-piece)뿐 아니라 슬라이드의 모든 글자(data-el)·컴포넌트(data-comp)가 같은 문법 — 기본이 컴포넌트 쪼개기
const MOVABLE = '[data-el], [data-comp]';
const keyOf = el => el.dataset.el || el.dataset.comp;
const selKeyOf = el => (el.dataset.el ? el.dataset.el : 'comp:' + el.dataset.comp);

export default function EditSurface({ layer, edit, wiggle, children }) {
  const ref = useRef(null);
  const [xs, setXs] = useState([]); // 흔들리는 동안 컴포넌트마다 붙는 ×
  const [draft, setDraft] = useState(null); // 드로잉키트로 그리는 중인 것 (미리보기)
  const penRef = useRef(null);
  const press = useRef(null);
  const editRef = useRef(edit);
  editRef.current = edit;
  const layerRef = useRef(layer);
  layerRef.current = layer;

  // 끼워 넣은 글 칸 (layer.inserts: { id, after, text, w, h, font, align, size, color })
  //   after = 바로 앞 컴포넌트(data-comp · data-el)의 키. 그 뒤에 자리(host)를 만들어 그 안에 그림 → 아래 내용이 밀려 내려감
  const [hosts, setHosts] = useState({});
  const hostRef = useRef({});
  const [freshIns, setFreshIns] = useState(null); // 막 넣어서 바로 쓰기 시작할 칸
  const [editor, setEditor] = useState(null); // 텍스트 에디터 { id, x, y }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 매번 자리 확인 (다시 그려지면 host가 밀려날 수 있어서). setHosts는 바뀔 때만
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const list = layer.inserts || [];
    const h = hostRef.current;
    const last = {};
    for (const ins of list) {
      const anchor = root.querySelector(`[data-comp="${ins.after}"], [data-el="${ins.after}"]`);
      let el = h[ins.id];
      if (!el) { el = document.createElement('div'); el.className = 'tb-host'; h[ins.id] = el; }
      if (!anchor) { el.remove(); continue; }
      const ref0 = last[ins.after] || anchor; // 같은 자리에 여러 개면 넣은 순서대로
      if (ref0.nextSibling !== el) ref0.after(el);
      last[ins.after] = el;
    }
    for (const id of Object.keys(h)) if (!list.some(i => i.id === id)) { h[id].remove(); delete h[id]; }
    const keys = Object.keys(h).join(',');
    if (keys !== Object.keys(hosts).join(',')) setHosts({ ...h }); // 바뀔 때만 → 끝없이 돌지 않음
  });
  useEffect(() => {
    const open = e => { const d = e.detail; if (d.layerId === layer.id && d.ins) setEditor({ id: d.ins, x: d.x, y: d.y }); };
    addEventListener('blip:texteditor', open);
    return () => removeEventListener('blip:texteditor', open);
  }, [layer.id]);

  // 핀치: 리액트의 휠 이벤트는 기본 동작을 막을 수 없어서 직접 붙임 (막지 않으면 페이지 전체가 확대됨)
  useEffect(() => {
    const el = ref.current;
    const wheel = e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.01);
      const pc = e.target.closest('[data-piece]');
      if (pc) { editRef.current.scalePiece(layer.id, pc.dataset.piece, f); return; }
      const m = e.target.closest(MOVABLE);
      if (m) editRef.current.scaleComp(layer.id, keyOf(m), f);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [layer.id]);

  // 빈칸에서 "새로운 아이템선언"을 하면: 그 빈칸이 이 장(지금 보이는 장) 위였다면 그린 자리·크기 그대로 조각이 됨.
  // 조각이라 놓이자마자 누른 채 이동으로 옮길 수 있음
  useEffect(() => {
    const onItem = e => {
      if (e.defaultPrevented) return;
      const el = ref.current, vw = el?.closest('.viewer');
      if (!vw) return;
      const { name, rect: r } = e.detail;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const inside = q => cx >= q.left && cx <= q.right && cy >= q.top && cy <= q.bottom;
      const b = el.getBoundingClientRect();
      if (!inside(vw.getBoundingClientRect()) || !inside(b)) return;
      e.preventDefault();
      const k = b.width / el.offsetWidth || 1;
      const w = Math.min(390, Math.max(72, r.w / k)), h = Math.min(488, Math.max(72, r.h / k));
      const x = Math.min(390 - w / 2, Math.max(w / 2, (cx - b.left) / k)), y = Math.min(488 - h / 2, Math.max(h / 2, (cy - b.top) / k));
      editRef.current.addPiece(layer.id, { kind: 'item', text: name, w, h, x, y });
    };
    addEventListener('blip:item', onItem);
    return () => removeEventListener('blip:item', onItem);
  }, [layer.id]);

  // 우클릭 메뉴(피그마식)에서 고른 기능: 이 장에서 우클릭했을 때만
  useEffect(() => {
    const onMenu = e => {
      const m = e.detail;
      if (m.layerId !== layer.id || !ref.current) return;
      const ed = editRef.current;
      const L = layerRef.current;
      const b = ref.current.getBoundingClientRect(), k = b.width / ref.current.offsetWidth || 1;
      const at = { x: Math.round((m.x - b.left) / k), y: Math.round((m.y - b.top) / k) };
      const pc = m.piece && L.pieces?.find(p => p.id === m.piece);
      const compEl = m.comp && ref.current.querySelector(`[data-comp="${m.comp}"], [data-el="${m.comp}"]`);
      // 고른 것 하나를 조각으로 (조각이면 그대로, 컴포넌트면 지금 모양 그대로 떠서)
      const grab = () => {
        if (pc) { const { id, ...rest } = pc; void id; return rest; }
        if (compEl) return { kind: 'comp', ...cloneUnit(compEl), text: compEl.innerText.trim(), scale: 1 };
        return null;
      };
      const put = (c, pos) => c && ed.addPiece(layer.id, { ...c, x: pos.x, y: pos.y });
      const remove = () => { if (pc) ed.removePiece(layer.id, pc.id); else if (m.comp) ed.hideComp(layer.id, m.comp); };
      switch (m.action) {
        case 'copy': setClip(grab()); break;
        case 'paste': put(getClip(), at); break;
        case 'replace': { const pos = pc ? { x: pc.x, y: pc.y } : at; remove(); put(getClip(), pos); break; }
        case 'dup': { const c = grab(); put(c, pc ? { x: pc.x + 16, y: pc.y + 16 } : { x: at.x + 16, y: at.y + 16 }); break; }
        // 맨 앞 = 맨 마지막에 다시 놓기 / 맨 뒤 = 나머지를 그 위로 다시 놓기
        case 'front': if (pc) { const c = grab(); ed.removePiece(layer.id, pc.id); put(c, { x: pc.x, y: pc.y }); } break;
        case 'back': if (pc) L.pieces.filter(p => p.id !== pc.id).forEach(p => { const { id, ...rest } = p; ed.removePiece(layer.id, id); ed.addPiece(layer.id, rest); }); break;
        case 'hide': case 'del': if (m.ins) ed.removeInsert(layer.id, m.ins); else remove(); break;
        // 텍스트 입력: 떠 있는 글이 아니라 콘텐츠 안에 글 칸을 끼워 넣음 — 우클릭한 컴포넌트(없으면 그 위쪽에서 가장 가까운 것) 바로 아래
        //   끼울 컴포넌트가 없는 장(빈 장 등)일 때만 그 자리에 떠 있는 글
        case 'text': {
          const flow = compEl || (() => {
            let best = null, by = -Infinity;
            ref.current.querySelectorAll('[data-comp], [data-el]').forEach(el => {
              if (!el.offsetParent || el.closest('[data-piece]')) return;
              const r = el.getBoundingClientRect();
              if (r.bottom <= m.y + 2 && r.left <= m.x && r.right >= m.x && r.bottom > by) { best = el; by = r.bottom; }
            });
            return best;
          })();
          const after = m.ins ? (L.inserts || []).find(i => i.id === m.ins)?.after : flow && (flow.dataset.comp || flow.dataset.el);
          if (after) {
            const id = ed.addInsert(layer.id, { after, text: '텍스트' });
            setFreshIns(id);
            break;
          }
          const id = ed.addPiece(layer.id, { kind: 'note', text: '텍스트', x: at.x, y: at.y });
          requestAnimationFrame(() => {
            const t = ref.current?.querySelector(`[data-piece="${id}"] [data-ptext]`);
            if (t) rewrite(t, text => editRef.current.setPieceText(layer.id, id, text || '텍스트'));
          });
          break;
        }
        default:
      }
    };
    addEventListener('blip:menu', onMenu);
    return () => removeEventListener('blip:menu', onMenu);
  }, [layer.id]);

  // 꾹 눌러 흔들리는 동안: 맨 바깥 컴포넌트마다 왼쪽 위에 ×
  useLayoutEffect(() => {
    if (!wiggle) { setXs([]); return; }
    const box = ref.current, b = box.getBoundingClientRect(), k = b.width / box.offsetWidth || 1;
    const els = [...box.querySelectorAll(MOVABLE)].filter(el => el.offsetParent && !el.parentElement.closest(MOVABLE));
    setXs(els.map(el => {
      const r = el.getBoundingClientRect();
      return { key: keyOf(el), x: (r.left - b.left) / k, y: (r.top - b.top) / k };
    }));
  }, [wiggle, layer]);

  const scale = () => ref.current.getBoundingClientRect().width / ref.current.offsetWidth || 1;

  const down = e => {
    if (e.button !== 0) return;
    // 슬라이더·입력칸은 원래 동작 (컴포넌트로 잡지 않음)
    if (e.target.closest('input, textarea, select')) { e.stopPropagation(); return; }
    // 드로잉키트에서 그리는 도구를 골랐으면: 누르는 곳에 새로 그림
    if (edit.tool && edit.tool !== 'move') { drawDown(e); return; }
    // 최소화된 아이콘은 통째로 잡아 옮길 수 있음 (눌렀다 바로 떼면 펼치기 — click에서). 펼친 조각의 최소화 버튼은 누르기만
    const miniGrab = e.target.closest('.pc-mini');
    if (!miniGrab && e.target.closest('[data-del], [data-from], [data-fold], [data-min], .cx')) { e.stopPropagation(); return; }
    if (e.target.isContentEditable) return;
    const pc = e.target.closest('[data-piece]');
    const el = !pc && e.target.closest(MOVABLE);
    const p = { x: e.clientX, y: e.clientY, moved: false, long: false };
    if (pc) {
      e.stopPropagation(); // 조각을 잡은 손은 넘기기가 아님
      const piece = layer.pieces.find(q => q.id === pc.dataset.piece);
      Object.assign(p, { piece: piece.id, ox: piece.x, oy: piece.y, k: scale() });
      p.timer = setTimeout(() => { p.long = true; edit.wiggle(layer.id); }, LONG);
      const move = ev => {
        const dx = ev.clientX - p.x, dy = ev.clientY - p.y;
        if (!p.moved) {
          if (p.long || Math.hypot(dx, dy) < MOVE) return;
          p.moved = true; clearTimeout(p.timer); edit.touch(layer.id);
        }
        edit.movePiece(layer.id, p.piece, p.ox + dx / p.k, p.oy + dy / p.k);
      };
      const up = ev => {
        clearTimeout(p.timer);
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        if (!p.moved && !p.long && !miniGrab) edit.select(layer.id, 'piece:' + p.piece);
        press.current = null;
        if (!p.moved) return;
        // 끌고 난 직후의 클릭(최소화 아이콘 펼치기 등)은 무시
        const eat = c => { c.stopPropagation(); c.preventDefault(); };
        addEventListener('click', eat, { capture: true, once: true });
        setTimeout(() => removeEventListener('click', eat, { capture: true }), 0);
        // 콘텐츠 네모 밖에 놓으면: 떠 있는 아이템으로 (안팎을 자유롭게)
        const vw = ref.current?.closest('.viewer')?.getBoundingClientRect();
        if (vw && (ev.clientX < vw.left || ev.clientX > vw.right || ev.clientY < vw.top || ev.clientY > vw.bottom)) {
          dispatchEvent(new CustomEvent('blip:unpin', { detail: { layerId: layer.id, piece: p.piece, x: ev.clientX, y: ev.clientY } }));
          return;
        }
        // 다른 조각 위에 놓았으면: 지도 위라면 그 지도와 합침
        const self = ref.current?.querySelector(`[data-piece="${p.piece}"]`);
        const under = document.elementsFromPoint(ev.clientX, ev.clientY).map(n => n.closest?.('.pc-map[data-piece]')).find(n => n && n !== self);
        const me = layerRef.current.pieces?.find(q => q.id === p.piece);
        if (under && me && me.kind === 'item') {
          dispatchEvent(new CustomEvent('blip:mapmerge', { detail: { layerId: layer.id, map: under.dataset.piece, item: me.id, name: me.text } }));
        }
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    } else if (el) {
      e.stopPropagation(); // 컴포넌트를 잡은 손도 넘기기가 아님 (넘기기는 빈 바탕이나 휠로)
      const key = keyOf(el), o = layer.moves?.[key] || {};
      Object.assign(p, { comp: key, sel: selKeyOf(el), ox: o.dx || 0, oy: o.dy || 0, k: scale() });
      p.timer = setTimeout(() => { p.long = true; edit.wiggle(layer.id); }, LONG);
      const move = ev => {
        const dx = ev.clientX - p.x, dy = ev.clientY - p.y;
        if (!p.moved) {
          if (p.long || Math.hypot(dx, dy) < MOVE) return;
          p.moved = true; clearTimeout(p.timer); edit.touch(layer.id); ref.current.classList.add('moving');
        }
        edit.moveComp(layer.id, p.comp, p.ox + dx / p.k, p.oy + dy / p.k);
      };
      const up = () => {
        clearTimeout(p.timer);
        ref.current?.classList.remove('moving');
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        if (!p.moved && !p.long) edit.select(layer.id, p.sel);
        press.current = null;
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    } else {
      p.key = 'bg';
    }
    press.current = p;
  };

  // 글자·배경: 움직이지 않고 뗐을 때만 "탭" (움직였다면 넘기기)
  const move = e => {
    const p = press.current;
    if (p && !p.piece && !p.comp && Math.hypot(e.clientX - p.x, e.clientY - p.y) >= MOVE) p.moved = true;
  };
  const up = () => {
    const p = press.current;
    if (!p || p.piece || p.comp) return;
    press.current = null;
    if (!p.moved) edit.select(layer.id, p.key);
  };

  const click = e => {
    const cx = e.target.closest('.cx');
    if (cx) { edit.hideComp(layer.id, cx.dataset.key); return; }
    const min = e.target.closest('[data-min]');
    if (min) { edit.minPiece?.(layer.id, min.dataset.min); return; }
    const fold = e.target.closest('[data-fold]');
    if (fold) { edit.foldPiece?.(layer.id, fold.dataset.fold); return; }
    const del = e.target.closest('[data-del]');
    if (del) { edit.removePiece(layer.id, del.dataset.del); return; }
    const from = e.target.closest('[data-from]');
    if (from) edit.openFrom(from.dataset.from);
  };

  // 그 자리에서 고쳐 쓰기 (글자 요소, 글자 조각 공용)
  const rewrite = (el, commit) => {
    el.contentEditable = 'true';
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const keydown = ev => {
      if (ev.key === 'Escape' || (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing)) { ev.preventDefault(); el.blur(); }
    };
    const blur = () => {
      el.removeEventListener('keydown', keydown);
      el.contentEditable = 'false';
      commit(el.innerText.replace(/\n+$/, ''));
    };
    el.addEventListener('keydown', keydown);
    el.addEventListener('blur', blur, { once: true });
  };

  // 두 번 탭 → 그 자리에서 고쳐 쓰기. 쓰기 시작하는 순간 선명해짐
  const dbl = e => {
    if (penRef.current) { finishPen(); return; }
    const pt = e.target.closest('[data-ptext]');
    if (pt && !pt.isContentEditable) {
      const id = pt.closest('[data-piece]').dataset.piece;
      edit.touch(layer.id);
      rewrite(pt, text => editRef.current.setPieceText(layer.id, id, text));
      return;
    }
    const el = e.target.closest('[data-el]');
    if (!el || el.isContentEditable) return;
    const key = el.dataset.el;
    edit.touch(layer.id);
    rewrite(el, text => editRef.current.setText(layer.id, key, text));
  };

  // ---------- 드로잉키트로 그리기 ----------
  const at = e => {
    const b = ref.current.getBoundingClientRect(), k = scale();
    return [(e.clientX - b.left) / k, (e.clientY - b.top) / k];
  };
  // 그린 것 → 조각 하나 (상자 가운데가 x·y)
  const commitShape = (shape, a, z) => {
    let [x0, y0] = a, [x1, y1] = z;
    if (Math.hypot(x1 - x0, y1 - y0) < 4) { // 그냥 누르면 피그마처럼 100×100
      x1 = x0 + 100; y1 = y0 + (shape === 'line' || shape === 'arrow' ? 0 : 100);
    }
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
    return { kind: 'shape', shape, w, h, fx: x1 < x0, fy: y1 < y0, x: Math.min(x0, x1) + w / 2, y: Math.min(y0, y1) + h / 2 };
  };
  const commitPath = (shape, pts) => {
    const xs_ = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minx = Math.min(...xs_), miny = Math.min(...ys), w = Math.max(...xs_) - minx, h = Math.max(...ys) - miny;
    return { kind: 'shape', shape, w, h, pts: pts.map(([x, y]) => [x - minx, y - miny]), x: minx + w / 2, y: miny + h / 2 };
  };
  const place = piece => {
    const id = edit.addPiece(layer.id, piece);
    edit.setTool('move'); // 그리고 나면 피그마처럼 다시 이동 도구
    setDraft(null);
    return id;
  };
  // 펜: 누를 때마다 점, 두 번 누르기·Enter·Esc로 끝
  const finishPen = () => {
    const pts = penRef.current;
    penRef.current = null;
    if (pts && pts.length > 1) place(commitPath('pen', pts));
    else { setDraft(null); edit.setTool('move'); }
  };
  useEffect(() => {
    if (edit.tool !== 'pen') return undefined;
    const key = e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); finishPen(); } };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  });

  const drawDown = e => {
    const tool = edit.tool;
    e.stopPropagation(); e.preventDefault();
    const a = at(e);
    if (tool === 'text') {
      const id = place({ kind: 'note', text: '텍스트', x: a[0], y: a[1] });
      // 놓자마자 바로 고쳐 쓰기
      requestAnimationFrame(() => {
        const t = ref.current?.querySelector(`[data-piece="${id}"] [data-ptext]`);
        if (t) rewrite(t, text => editRef.current.setPieceText(layer.id, id, text || '텍스트'));
      });
      return;
    }
    if (tool === 'pen') {
      penRef.current = [...(penRef.current || []), a];
      setDraft({ shape: 'pen', pts: penRef.current, cur: a });
      return;
    }
    const pts = [a];
    const move = ev => {
      const z = at(ev);
      if (tool === 'pencil') { pts.push(z); setDraft({ shape: 'pencil', pts: [...pts] }); }
      else setDraft({ shape: tool, a, z });
    };
    const up = ev => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      if (tool === 'pencil') { if (pts.length > 1) place(commitPath('pencil', pts)); else setDraft(null); return; }
      place(commitShape(tool, a, at(ev)));
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };
  const penHover = e => { if (penRef.current) setDraft(d => d && { ...d, cur: at(e) }); };

  // 미리보기 (콘텐츠 좌표 그대로 겹쳐 그림)
  const preview = () => {
    if (!draft) return null;
    let g;
    if (draft.shape === 'pen' || draft.shape === 'pencil') {
      const pts = draft.cur ? [...draft.pts, draft.cur] : draft.pts;
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
      g = <path d={d} fill="none" stroke="#0d99ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
    } else {
      const s = commitShape(draft.shape, draft.a, draft.z);
      g = (
        <g transform={`translate(${s.x - s.w / 2} ${s.y - s.h / 2})`} color="#0d99ff" opacity=".55">
          <Shape shape={s.shape} w={s.w} h={s.h} fx={s.fx} fy={s.fy} />
        </g>
      );
    }
    return <svg className="es-draft" viewBox="0 0 390 488" aria-hidden="true">{g}</svg>;
  };

  return (
    <div className={'es' + (wiggle ? ' wig' : '')} ref={ref} data-layer={layer.id}
      onPointerDown={down} onPointerMove={e => { move(e); penHover(e); }} onPointerUp={up} onClick={click} onDoubleClick={dbl}>
      {children}
      {Object.entries(hosts).map(([id, el]) => {
        const ins = layer.inserts?.find(i => i.id === id);
        return ins && createPortal(
          <TextBlock key={id} ins={ins} startEdit={freshIns === id} onEdited={() => setFreshIns(null)}
            onChange={patch => editRef.current.setInsert(layer.id, id, patch)} />, el);
      })}
      {editor && layer.inserts?.some(i => i.id === editor.id) && (
        <TextEditor ins={layer.inserts.find(i => i.id === editor.id)} at={editor}
          onChange={patch => editRef.current.setInsert(layer.id, editor.id, patch)} onClose={() => setEditor(null)} />
      )}
      {preview()}
      {xs.map(x => <b key={x.key} className="cx" data-key={x.key} role="button" aria-label="지우기" style={{ left: x.x, top: x.y }}>×</b>)}
    </div>
  );
}
