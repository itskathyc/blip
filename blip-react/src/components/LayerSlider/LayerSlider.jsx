import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './LayerSlider.css';

const HOLD = 200; // 0.2초 누르면 잡힘 → 옮겨서 순서 바꾸기
const LONG = 600; // 잡은 채 가만히 더 누르면 흔들림 (오른쪽 내 판: × 로 지우기)

// 내 타임라인: 항상 "내 판"의 레이어들. 위 띠의 썸네일을 끌어다 놓으면 그대로 담김(리믹스)
// dragKey가 있으면(왼쪽 디깅 쪽) 카드 하나하나를 끌어서 오른쪽 타임라인에 그 장면만 담을 수 있음
// onMove가 있으면(오른쪽 편집 쪽) 손가락 문법:
//   탭 = 그 장으로 · 누른 채 이동 = 순서 바꾸기(= 질문의 우선순위, 선명해짐) · 꾹 누르기 = 흔들림 → × 로 지우기
export default function LayerSlider({ layers, index, active, fresh, canDrop, dragKey, dragKeys, mini, cls, addTitle = '빈 장 추가', onGo, onAdd, onDropTile, onMove, onRemove }) {
  const rowRef = useRef(null);
  const [over, setOver] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [holding, setHolding] = useState(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    rowRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [index, layers.length]);

  // 흔들리는 동안 다른 곳을 누르면 멈춤
  useEffect(() => {
    if (!wiggle) return undefined;
    const stop = e => { if (!rowRef.current?.contains(e.target)) setWiggle(false); };
    addEventListener('pointerdown', stop);
    return () => removeEventListener('pointerdown', stop);
  }, [wiggle]);

  const drop = canDrop ? {
    onDragOver: e => { if (e.dataTransfer.types.includes('text/blip-tile')) { e.preventDefault(); setOver(true); } },
    onDragLeave: () => setOver(false),
    onDrop: e => { e.preventDefault(); setOver(false); onDropTile(e.dataTransfer.getData('text/blip-tile')); }
  } : {};

  // 0.2초 누르면 카드가 잡혀 떠오름 → 그대로 옆으로 옮기면 순서 바꾸기 (왼쪽 · 오른쪽 같은 문법)
  // 0.2초 전에 움직이면: 끌어서 던지기(왼쪽 카드의 원래 드래그) — 잡힌 뒤엔 드래그를 막음
  const grabRef = useRef(null);
  const press = (e, layer) => {
    if (!onMove || e.button !== 0 || e.target.closest('.lcard-x, .lcard-minus')) return;
    const p = { x: e.clientX, y: e.clientY, id: layer.id, armed: false, moved: false, long: false, early: false };
    grabRef.current = p;
    p.arm = setTimeout(() => { if (!p.early) { p.armed = true; setHolding(p.id); } }, HOLD);
    p.timer = setTimeout(() => { if (p.armed && !p.moved && onRemove) { p.long = true; setHolding(null); setWiggle(true); } }, LONG);
    const move = ev => {
      if (!p.armed) {
        if (Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > 6) { p.early = true; clearTimeout(p.arm); clearTimeout(p.timer); }
        return;
      }
      if (p.long) return;
      if (!p.moved && Math.abs(ev.clientX - p.x) < 4) return;
      p.moved = true; clearTimeout(p.timer);
      // 손가락 아래에 가장 가까운 카드 자리로 (작은 카드 · 큰 카드가 섞여 있어도)
      const cards = [...rowRef.current.querySelectorAll('.lcard:not(.lcard-add)')];
      const ls = layersRef.current;
      const from = ls.findIndex(l => l.id === p.id);
      let to = from, best = Infinity;
      cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(ev.clientX - (r.left + r.width / 2)); if (d < best) { best = d; to = i; } });
      if (to !== from && best < 40) onMove(from, to);
    };
    const up = () => {
      clearTimeout(p.arm); clearTimeout(p.timer);
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      setHolding(null);
      grabRef.current = null;
      if (!p.moved && !p.long && !p.early && !wiggle) onGo(layersRef.current.findIndex(l => l.id === p.id));
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  };

  return (
    <div className={'slider' + (active ? '' : ' idle') + (over ? ' over' : '') + (wiggle ? ' wiggle' : '')} ref={rowRef} {...drop}>
      {layers.map((layer, i) => (
        <button key={layer.id}
          className={'lcard' + (active && i === index ? ' cur' : '') + (layer.draft ? ' draft' : '') + (fresh.includes(layer.id) ? ' fresh' : '') + (holding === layer.id ? ' holding' : '') + (mini?.[i] ? ' mini' : '') + (cls?.[i] ? ' ' + cls[i] : '')}
          onClick={onMove ? undefined : () => onGo(i)}
          onPointerDown={e => press(e, layer)}
          draggable={!!(dragKey || dragKeys)} onDragStart={dragKey || dragKeys ? e => { if (grabRef.current?.armed) { e.preventDefault(); return; } e.dataTransfer.setData('text/blip-tile', dragKeys ? dragKeys[i] : dragKey + '#' + i); e.dataTransfer.effectAllowed = 'copy'; } : undefined}
          aria-label={(i + 1) + '번째 레이어' + (layer.draft ? ', 제안' : '')}>
          <span className="lcard-scale"><Slide layer={layer} /></span>
          {wiggle && <span className="lcard-x" role="button" aria-label={(i + 1) + '번째 레이어 지우기'} onClick={() => onRemove(layer.id)}>×</span>}
          {/* 늘 보이는 작은 − : 보고 싶지 않은 레이어 빼기 (왼쪽 디깅 · 오른쪽 내 판 모두) */}
          {onRemove && !wiggle && (
            <span className="lcard-minus" role="button" aria-label={(i + 1) + '번째 레이어 빼기'} title="빼기"
              onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(layer.id, i); }}>−</span>
          )}
        </button>
      ))}
      {onAdd && <button className="lcard lcard-add" onClick={onAdd} title={addTitle} aria-label={addTitle}>+</button>}
      {over && <span className="slider-drop">여기에 놓으면 담겨요</span>}
    </div>
  );
}
