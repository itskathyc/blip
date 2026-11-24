import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './LayerSlider.css';

const HOLD = 200; // 0.2초 누르면 잡힘 → 옮겨서 순서 바꾸기
const LONG = 600; // 잡은 채 가만히 더 누르면 흔들림 (오른쪽 내 판: × 로 지우기)

// 내 타임라인: 항상 "내 판"의 레이어들. 위 띠의 썸네일을 끌어다 놓으면 그대로 담김(리믹스)
// dragKey가 있으면(왼쪽 디깅 쪽) 카드 하나하나를 끌어서 오른쪽 타임라인에 그 장면만 담을 수 있음
// onMove가 있으면(오른쪽 편집 쪽) 손가락 문법:
//   탭 = 그 장으로 · 누른 채 이동 = 순서 바꾸기(= 질문의 우선순위, 선명해짐) · 꾹 누르기 = 흔들림 → × 로 지우기
// rotary(왼쪽 콘텐츠 슬라이더): 책장 넘기듯. 지금 화면만 가운데에 크게 똑바로,
//   양옆은 비스듬히 돌아 겹친 책장 — 가까운 것일수록 조금 더 보이고, 멀수록 얇은 모서리(glimpse)만.
//   넘기면 카드가 축을 따라 돌며 가운데로 들어오고, 보던 것은 옆 책장으로 눕는다
const SIDE = 6; // 한쪽에 보이는 책장 수 (그 너머는 숨김)
// book(/flipbook): 더 책처럼 — 가운데 펼친 장이 크고, 양옆 책장은 얇은 모서리로 많이 겹쳐 쌓이고(두께), 넘김이 느리게 돎
const MODE = {
  true: { side: SIDE, gap: 72, step: 13, ry: 64, cur: 1.2, base: 1, shrink: .035, fade: .1 },
  book: { side: 12, gap: 70, step: 12, ry: 60, cur: 1.55, base: 1.32, shrink: .015, fade: .04 }
};
const rot = (i, index, mode = true) => {
  const M = MODE[mode] || MODE.true;
  const d = i - index, a = Math.abs(d), sg = Math.sign(d);
  if (!d) return { g: 0, style: { '--tx': '0px', '--ry': '0deg', '--s': M.cur, '--o': 1, zIndex: 50 } };
  const tx = sg * (M.gap + (a - 1) * M.step); // 첫 장은 지금 화면 옆에 붙고, 그 뒤로는 모서리만
  return { g: a, gone: a > M.side, style: { '--tx': tx + 'px', '--ry': -sg * M.ry + 'deg', '--s': M.base - Math.min(a, 8) * M.shrink, '--o': a > M.side ? 0 : 1 - (a - 1) * M.fade, zIndex: 50 - a } };
};
export default function LayerSlider({ layers, index, active, fresh, canDrop, dragKey, dragKeys, splitKeys, mini, cls, rotary, addTitle = '빈 장 추가', onGo, onAdd, onDropTile, onMove, onRemove }) {
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
    // 왼쪽 콘텐츠 슬라이더(책장): 꾹 누르기 · 순서 바꾸기 없음 — 누르면 그 콘텐츠로, 끌면 바로 나란히 보기(Split View)
    if (!onMove || rotary || e.button !== 0 || e.target.closest('.lcard-x, .lcard-minus')) return;
    const p = { x: e.clientX, y: e.clientY, id: layer.id, armed: false, moved: false, long: false, early: false };
    grabRef.current = p;
    // 오른쪽(끌어서 던질 일이 없는 슬라이더): 꾹 누르지 않고 바로 잡아 옮김. 지우기는 늘 보이는 − 로 (흔들기 없음)
    const instant = !dragKey && !dragKeys && !splitKeys;
    if (instant) p.armed = true;
    else {
      p.arm = setTimeout(() => { if (!p.early) { p.armed = true; setHolding(p.id); } }, HOLD);
      p.timer = setTimeout(() => { if (p.armed && !p.moved && onRemove) { p.long = true; setHolding(null); setWiggle(true); } }, LONG);
    }
    const move = ev => {
      if (!p.armed) {
        if (Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > 6) { p.early = true; clearTimeout(p.arm); clearTimeout(p.timer); }
        return;
      }
      if (p.long) return;
      if (!p.moved && Math.abs(ev.clientX - p.x) < 4) return;
      if (!p.moved) setHolding(p.id); // 움직이기 시작하면 들림
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
    <div className={'slider' + (rotary ? ' rotary' : '') + (rotary === 'book' ? ' book' : '') + (active ? '' : ' idle') + (over ? ' over' : '') + (wiggle ? ' wiggle' : '')} ref={rowRef} {...drop}>
      {layers.map((layer, i) => {
        const r = rotary && rot(i, index, rotary);
        return (
        <button key={layer.id} style={r ? r.style : undefined}
          className={'lcard' + (layer.web ? ' webl' : '') + (r && r.g ? ' ghost' + (r.gone ? ' gone' : '') + (i < index ? ' gl' : ' gr') : '') + (active && i === index ? ' cur' : '') + (layer.draft ? ' draft' : '') + (fresh.includes(layer.id) ? ' fresh' : '') + (holding === layer.id ? ' holding' : '') + (mini?.[i] ? ' mini' : '') + (cls?.[i] ? ' ' + cls[i] : '')}
          onClick={onMove && !rotary ? undefined : () => onGo(i)}
          title={splitKeys ? '누르면 보기 · 왼쪽 콘텐츠로 끌어 놓으면 나란히 보기' : undefined}
          onPointerDown={e => press(e, layer)}
          draggable={!!(dragKey || dragKeys || splitKeys)} onDragStart={dragKey || dragKeys ? e => { if (grabRef.current?.armed) { e.preventDefault(); return; } e.dataTransfer.setData('text/blip-tile', dragKeys ? dragKeys[i] : dragKey + '#' + i); e.dataTransfer.effectAllowed = 'copy'; }
            : splitKeys ? e => { if (grabRef.current?.armed) { e.preventDefault(); return; } e.dataTransfer.setData('text/blip-split', splitKeys[i]); e.dataTransfer.effectAllowed = 'move'; } : undefined}
          aria-label={(i + 1) + '번째 레이어' + (layer.draft ? ', 제안' : '')}>
          <span className="lcard-scale"><Slide layer={layer} /></span>
          {wiggle && <span className="lcard-x" role="button" aria-label={(i + 1) + '번째 레이어 지우기'} onClick={() => onRemove(layer.id)}>×</span>}
          {/* 늘 보이는 작은 − : 보고 싶지 않은 레이어 빼기 (왼쪽 디깅 · 오른쪽 내 판 모두) */}
          {onRemove && !wiggle && (
            <span className="lcard-minus" role="button" aria-label={(i + 1) + '번째 레이어 빼기'} title="빼기"
              onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(layer.id, i); }}>−</span>
          )}
        </button>
        );
      })}
      {onAdd && <button className="lcard lcard-add" onClick={onAdd} title={addTitle} aria-label={addTitle}>+</button>}
      {over && <span className="slider-drop">여기에 놓으면 담겨요</span>}
    </div>
  );
}
